const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionType: {
    type: String,
    enum: ['AM', 'PM'],
    required: true
  },
  date: {
    type: Date,
    default: () => {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
  },
  timeIn: Date,
  timeOut: Date,
  status: {
    type: String,
    enum: ['present', 'absent'],
    default: 'absent'
  }
}, {
  timestamps: true
});

// Ensure one attendance record per student per session type per day
attendanceSchema.index({ student: 1, sessionType: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);