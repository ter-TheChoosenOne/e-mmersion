const User = require('../models/user');
const Attendance = require('../models/attendance');
const Session = require('../models/attendanceSession');
const Report = require('../models/report');

// PROFILE
const getMyProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
};

const updateMyProfile = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const allowedFields = ['fullName', 'email', 'studentId', 'teacherId'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });

  if (req.file) {
    user.profilePicture = `/uploads/profile-pics/${req.file.filename}`;
  }

  await user.save();
  res.json({ message: "Profile updated", profilePicture: user.profilePicture });
};

// TIME IN
const timeIn = async (req, res) => {
  const session = await Session.findOne({ isActive: true }).sort({ startTime: -1 });

  if (!session) return res.status(400).json({ error: "No active session" });

  const now = new Date();

  if (now > session.endTime) {
    return res.status(400).json({ error: "Attendance closed" });
  }

  const existing = await Attendance.findOne({
    student: req.user.id,
    date: { $gte: session.startTime }
  });

  if (existing) {
    return res.status(400).json({ error: "Already timed in" });
  }

  const record = await Attendance.create({
    student: req.user.id,
    timeIn: now,
    status: "present"
  });

  res.json({ message: "Time-in successful", record });
};

// TIME OUT
const timeOut = async (req, res) => {
  const record = await Attendance.findOne({
    student: req.user.id,
    status: "present"
  }).sort({ date: -1 });

  if (!record) {
    return res.status(400).json({ error: "No time-in record" });
  }

  record.timeOut = new Date();
  await record.save();

  res.json({ message: "Time-out successful" });
};

// MY ATTENDANCE
const getMyAttendance = async (req, res) => {
  const records = await Attendance.find({
    student: req.user.id
  });

  res.json({ attendance: records });
};

const getAttendanceSessionStatus = async (req, res) => {
  const session = await Session.findOne({ isActive: true }).sort({ startTime: -1 });

  if (!session) {
    return res.json({ hasActiveSession: false, session: null });
  }

  if (new Date() > session.endTime) {
    session.isActive = false;
    await session.save();
    return res.json({ hasActiveSession: false, session: null });
  }

  res.json({
    hasActiveSession: true,
    session,
  });
};

// REPORTS
const createReport = async (req, res) => {
  const { title, content, date } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  const reportData = {
    student: req.user.id,
    title,
    content: content || '',
    date: date ? new Date(date) : new Date()
  };

  if (req.file) {
    reportData.filePath = `/uploads/reports/${req.file.filename}`;
  }

  const report = await Report.create(reportData);
  res.status(201).json({ message: "Report created", report });
};

const updateReport = async (req, res) => {
  const { title, content } = req.body;
  const report = await Report.findOne({ _id: req.params.id, student: req.user.id });

  if (!report) {
    return res.status(404).json({ error: "Report not found" });
  }

  if (report.status === 'submitted') {
    return res.status(400).json({ error: "Cannot update submitted report" });
  }

  if (title) report.title = title;
  if (content !== undefined) report.content = content;

  if (req.file) {
    report.filePath = `/uploads/reports/${req.file.filename}`;
  }

  await report.save();
  res.json({ message: "Report updated", report });
};

const getMyReports = async (req, res) => {
  const reports = await Report.find({ student: req.user.id }).sort({ date: -1 });
  res.json({ reports });
};

const submitReport = async (req, res) => {
  const report = await Report.findOne({ _id: req.params.id, student: req.user.id });

  if (!report) {
    return res.status(404).json({ error: "Report not found" });
  }

  if (report.status === 'submitted') {
    return res.status(400).json({ error: "Report already submitted" });
  }

  report.status = 'submitted';
  report.submittedAt = new Date();
  await report.save();

  res.json({ message: "Report submitted", report });
};

const deleteReport = async (req, res) => {
  const report = await Report.findOne({ _id: req.params.id, student: req.user.id });

  if (!report) {
    return res.status(404).json({ error: "Report not found" });
  }

  if (report.status === 'submitted') {
    return res.status(400).json({ error: "Cannot delete submitted report" });
  }

  await Report.findByIdAndDelete(req.params.id);
  res.json({ message: "Report deleted" });
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  timeIn,
  timeOut,
  getMyAttendance,
  getAttendanceSessionStatus,
  createReport,
  updateReport,
  getMyReports,
  submitReport,
  deleteReport
};
