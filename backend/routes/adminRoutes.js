
const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');
const User = require('../models/User');
const Booking = require('../models/Booking');

// All routes in here are: auth + admin only
const protectAdmin = [auth, requireAdmin];

// users

// GET /api/admin/users
router.get('/users', protectAdmin, async (req, res) => {
  try {
    const users = await User.find({})
      .select('name email role createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ users });
  } catch (err) {
    console.error('Admin get users error:', err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

// PATCH /api/admin/users/:id/role
// body: { role: 'user' | 'admin' }
router.patch('/users/:id/role', protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ msg: 'Invalid role.' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('name email role');

    if (!user) {
      return res.status(404).json({ msg: 'User not found.' });
    }

    res.json({ msg: 'Role updated.', user });
  } catch (err) {
    console.error('Admin update role error:', err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

// Bookings

// GET /api/admin/bookings
// query params: date (YYYY-MM-DD), status (pending|approved|cancelled)
router.get('/bookings', protectAdmin, async (req, res) => {
  try {
    const { date, status } = req.query;

    const query = {};
    if (date) query.teeDate = date;
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('user', 'name email')
      .sort({ teeDate: 1, teeTime: 1 })
      .lean();

    res.json({ bookings });
  } catch (err) {
    console.error('Admin get bookings error:', err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

// PATCH /api/admin/bookings/:id/status
// body: { status: 'pending' | 'approved' | 'cancelled' }
router.patch('/bookings/:id/status', protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'cancelled'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status.' });
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found.' });
    }

    res.json({ msg: 'Booking status updated.', booking });
  } catch (err) {
    console.error('Admin update booking status error:', err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

// Stats and analytics

// GET /api/admin/stats
router.get('/stats', protectAdmin, async (req, res) => {
  try {
    const [totalUsers, totalBookings, pendingBookings, approvedBookings, cancelledBookings] =
      await Promise.all([
        User.countDocuments({}),
        Booking.countDocuments({}),
        Booking.countDocuments({ status: 'pending' }),
        Booking.countDocuments({ status: 'approved' }),
        Booking.countDocuments({ status: 'cancelled' }),
      ]);

    // bookings per date 
    const bookingsByDateAgg = await Booking.aggregate([
      {
        $group: {
          _id: '$teeDate',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const bookingsByDate = bookingsByDateAgg.map((row) => ({
      date: row._id,
      count: row.count,
    }));
// Return all stats in one response
    res.json({
      totalUsers,
      totalBookings,
      pendingBookings,
      approvedBookings,
      cancelledBookings,
      bookingsByDate,
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ msg: 'Server error.' });
  }
});

module.exports = router;
