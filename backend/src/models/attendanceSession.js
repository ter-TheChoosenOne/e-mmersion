const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['AM', 'PM'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('AttendanceSession', sessionSchema);