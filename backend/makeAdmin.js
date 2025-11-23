
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tee_time_app';

async function makeAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    const email = 'aidan@example.com'; // <-- change this

    const user = await User.findOneAndUpdate(
      { email },
      { role: 'admin' },
      { new: true }
    );

    if (!user) {
      console.log('User not found for that email.');
    } else {
      console.log('Updated user:', user.email, 'role =', user.role);
    }
  } catch (err) {
    console.error('Error making admin:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

makeAdmin();
