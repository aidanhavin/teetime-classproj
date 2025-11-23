const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Booking = require('../models/Booking');

// POST /api/bookings
// Create a new booking for the logged in user
router.post('/', auth, async (req, res) => {
  try {
   

    const userId = req.user.id; // from JWT 
    const { course, teeDate, teeTime, players, notes } = req.body;

    if (!teeDate || !teeTime) {
      return res.status(400).json({ msg: 'teeDate and teeTime are required.' });
    }

    // prevents duplicates for same user / same slot
    const existing = await Booking.findOne({
      user: userId,
      teeDate,
      teeTime,
      course: course || 'Main Course',
      status: { $ne: 'cancelled' },
    });

    if (existing) {
      return res
        .status(400)
        .json({ msg: 'You already have a booking at that time.' });
    }
      // Create the booking
    const booking = await Booking.create({
      user: userId,
      course: course || 'Main Course',
      teeDate,
      teeTime,
      players: players || 1,
      notes,
    });

      // Return the created booking
    return res.status(201).json({
      msg: 'Booking created.',
      booking,
    });
  } catch (err) {
    console.error('Create booking error:', err);
    return res.status(500).json({ msg: 'Server error.' });
  }
});

// GET /api/bookings/mine
// Get bookings for the logged in user
router.get('/mine', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.find({ user: userId })
      .sort({ teeDate: 1, teeTime: 1 })
      .lean();

    return res.json({ bookings });
  } catch (err) {
    console.error('Get my bookings error:', err);
    return res.status(500).json({ msg: 'Server error.' });
  }
});

// GET /api/bookings/day?date=YYYY-MM-DD&course=Optional
// Tee sheet view for a given day
router.get('/day', auth, async (req, res) => {
  try {
    const { date, course } = req.query;

    if (!date) {
      return res.status(400).json({ msg: 'date query param is required.' });
    }

    const query = {
      teeDate: date,
      status: { $ne: 'cancelled' },
    };
    if (course) query.course = course;

    const bookings = await Booking.find(query)
      .populate('user', 'name email')
      .sort({ teeTime: 1 })
      .lean();

    return res.json({ bookings });
  } catch (err) {
    console.error('Get day bookings error:', err);
    return res.status(500).json({ msg: 'Server error.' });
  }
});

// DELETE /api/bookings/:id
// Allow user to cancel their own booking
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found.' });
    }

    // only the admin can cancel booking not under their unique user id
    if (booking.user.toString() !== userId) {
      return res.status(403).json({ msg: 'Not authorized to cancel this booking.' });
    }

    booking.status = 'cancelled';
    await booking.save();

    return res.json({ msg: 'Booking cancelled.', booking });
  } catch (err) {
    console.error('Cancel booking error:', err);
    return res.status(500).json({ msg: 'Server error.' });
  }
});
// Tee sheet slots endpoint

// simple config for now – you can move this to DB later
const DEFAULT_COURSE_CONFIG = {
  courseName: 'Kings Course',
  startTime: '08:00',    // first tee time
  endTime: '18:00',      // last tee time 
  intervalMinutes: 10,   // gap between tee times
  maxPlayersPerGroup: 4,
  holes: 18,
  basePrice: 40,         // prob make time based later - but for now defaults work
  maxPrice: 70,
};

// helps generate time strings between start-end
function generateTimeSlots(startTime, endTime, intervalMinutes) {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  const slots = [];
  let current = new Date(2000, 0, 1, startH, startM);
  const end = new Date(2000, 0, 1, endH, endM);

  while (current <= end) {
    const hh = String(current.getHours()).padStart(2, '0');
    const mm = String(current.getMinutes()).padStart(2, '0');
    slots.push(`${hh}:${mm}`);
    current.setMinutes(current.getMinutes() + intervalMinutes);
  }
  return slots;
}

// GET /api/bookings/slots?date=YYYY-MM-DD&course=Main%20Course
// returns all times for the day with occupancy + price info
router.get('/slots', async (req, res) => {
  try {
    const { date, course } = req.query;

    if (!date) {
      return res.status(400).json({ msg: 'date query param is required.' });
    }

    const config = {
      ...DEFAULT_COURSE_CONFIG,
      courseName: course || DEFAULT_COURSE_CONFIG.courseName,
    };

    // generates all potential tee times for that day
    const times = generateTimeSlots(
      config.startTime,
      config.endTime,
      config.intervalMinutes
    );

    // gets all bookings for that date + course
    const bookings = await Booking.find({
      teeDate: date,
      course: config.courseName,
      status: { $ne: 'cancelled' },
    }).lean();

    // aggregates by teeTime
    const occupancyMap = {};
    for (const b of bookings) {
      if (!occupancyMap[b.teeTime]) {
        occupancyMap[b.teeTime] = {
          totalPlayers: 0,
          bookings: [],
        };
      }
      occupancyMap[b.teeTime].totalPlayers += b.players || 1;
      occupancyMap[b.teeTime].bookings.push(b);
    }

    // builds the tee sheet
    const slots = times.map((time) => {
      const occ = occupancyMap[time] || { totalPlayers: 0, bookings: [] };
      const currentPlayers = occ.totalPlayers;
      const maxPlayers = config.maxPlayersPerGroup;
      const availableSpots = Math.max(maxPlayers - currentPlayers, 0);

      // simple pricing logic – could be more complex based on time of day, demand, etc. not implemented yet but will add later

      const minPrice = config.basePrice;
      const maxPrice = config.maxPrice;

      let status = 'available';
      if (availableSpots === 0) status = 'full';

      return {
        teeTime: time,                      // the time slot
        bookings: occ.bookings,              // all bookings for that time
        holes: config.holes,                // number of holes for the course
        course: config.courseName,          // course name
        currentPlayers,                     // total players booked for that time
        maxPlayers,                         // max players allowed for that time
        availableSpots,                     // how many spots are still available
        status,                             // availability status
        minPrice,                       // base price for that time slot              
        maxPrice,                       // max price for that time slot 
      };
    });
      // Return the tee sheet for the day
    return res.json({
      course: config.courseName,
      date,
      slots,
    });
  } catch (err) {
    console.error('Tee sheet slots error:', err);
    return res.status(500).json({ msg: 'Server error.' });
  }
});

module.exports = router;
