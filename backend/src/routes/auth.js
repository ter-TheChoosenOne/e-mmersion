// backend/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, studentId, teacherId, password, role } = req.body;

    let user;
    if (role === 'student') {
      user = await User.findOne({ studentId });
    } else if (role === 'teacher') {
      user = await User.findOne({ teacherId });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: { id: user._id, fullName: user.fullName, role: user.role, status: user.status } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;