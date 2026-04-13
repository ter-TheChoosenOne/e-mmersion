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
  Object.assign(user, req.body);
  await user.save();
  res.json({ message: "Profile updated" });
};

// STUDENTS MANAGEMENT
const getMyStudents = async (req, res) => {
  // For now, teachers can view all students
  // In a real system, you'd have teacher-student assignments
  const students = await User.find({ role: "student" }).select('-password');
  res.json(students);
};

const getStudentById = async (req, res) => {
  const student = await User.findById(req.params.id).select('-password');
  if (!student || student.role !== 'student') {
    return res.status(404).json({ error: "Student not found" });
  }
  res.json(student);
};

// ATTENDANCE MANAGEMENT
const openAttendance = async (req, res) => {
  const now = new Date();

  await Session.updateMany(
    {
      isActive: true,
      $or: [{ endTime: { $lte: now } }, { endTime: { $exists: false } }],
    },
    {
      $set: { isActive: false },
    }
  );

  const activeSession = await Session.findOne({ isActive: true }).sort({ startTime: -1 });
  if (activeSession && activeSession.endTime > now) {
    return res.status(400).json({ error: "Attendance is already open" });
  }

  const session = await Session.create({
    startTime: now,
    endTime: new Date(now.getTime() + 60 * 60 * 1000) // 1 hour
  });

  res.json({ message: "Attendance opened for 1 hour", session });
};

const closeAttendance = async (req, res) => {
  const session = await Session.findOne({ isActive: true }).sort({ startTime: -1 });
  if (!session) {
    return res.status(400).json({ error: "No active session" });
  }

  const now = new Date();
  if (now < session.endTime) {
    // Force close
    session.endTime = now;
  }

  // Mark absent students
  const students = await User.find({ role: "student" });
  for (let student of students) {
    const existing = await Attendance.findOne({
      student: student._id,
      date: { $gte: session.startTime }
    });

    if (!existing) {
      await Attendance.create({
        student: student._id,
        status: "absent"
      });
    }
  }

  session.isActive = false;
  await session.save();

  res.json({ message: "Attendance closed" });
};

const getAttendanceRecords = async (req, res) => {
  const { date, studentId } = req.query;

  let filter = {};

  if (date) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    filter.date = { $gte: startDate, $lt: endDate };
  }

  if (studentId) {
    const student = await User.findOne({ studentId, role: 'student' });
    if (student) {
      filter.student = student._id;
    }
  }

  const records = await Attendance.find(filter)
    .populate('student', 'fullName studentId')
    .sort({ date: -1 });

  res.json({ attendance: records });
};

const getAttendanceSummary = async (req, res) => {
  const { startDate, endDate } = req.query;

  let filter = {};
  if (startDate && endDate) {
    filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  const records = await Attendance.find(filter)
    .populate('student', 'fullName studentId');

  const summary = {
    totalRecords: records.length,
    present: records.filter(r => r.status === 'present').length,
    absent: records.filter(r => r.status === 'absent').length,
    students: {}
  };

  // Group by student
  records.forEach(record => {
    const studentId = record.student._id.toString();
    if (!summary.students[studentId]) {
      summary.students[studentId] = {
        name: record.student.fullName,
        studentId: record.student.studentId,
        total: 0,
        present: 0,
        absent: 0
      };
    }
    summary.students[studentId].total++;
    summary.students[studentId][record.status]++;
  });

  res.json(summary);
};

// REPORT MANAGEMENT
const getStudentReports = async (req, res) => {
  const student = await User.findById(req.params.id);
  if (!student || student.role !== 'student') {
    return res.status(404).json({ error: "Student not found" });
  }

  const reports = await Report.find({ student: req.params.id })
    .populate('student', 'fullName studentId')
    .sort({ date: -1 });

  res.json({ reports });
};

const getAllReports = async (req, res) => {
  const { status, date } = req.query;

  let filter = {};

  if (status) {
    filter.status = status;
  }

  if (date) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    filter.date = { $gte: startDate, $lt: endDate };
  }

  const reports = await Report.find(filter)
    .populate('student', 'fullName studentId')
    .sort({ submittedAt: -1 });

  res.json({ reports });
};

const gradeReport = async (req, res) => {
  const { grade } = req.body;
  const gradeNum = parseInt(grade);

  console.log('Grading report', req.params.id, 'with grade', grade, 'parsed to', gradeNum);

  if (!gradeNum || gradeNum < 1 || gradeNum > 10) {
    console.log('Invalid grade');
    return res.status(400).json({ error: "Grade must be between 1 and 10" });
  }

  const report = await Report.findById(req.params.id);
  if (!report) {
    console.log('Report not found');
    return res.status(404).json({ error: "Report not found" });
  }

  report.grade = gradeNum;
  report.status = 'reviewed'; // Mark as reviewed when graded
  await report.save();

  console.log('Report graded successfully');
  res.json({ message: "Report graded successfully", report });
};

// APPROVAL MANAGEMENT
const approveStudent = async (req, res) => {
  const student = await User.findById(req.params.id);
  if (!student || student.role !== 'student') {
    return res.status(404).json({ error: "Student not found" });
  }

  student.status = 'approved';
  await student.save();

  res.json({ message: "Student approved successfully" });
};

const rejectStudent = async (req, res) => {
  const student = await User.findById(req.params.id);
  if (!student || student.role !== 'student') {
    return res.status(404).json({ error: "Student not found" });
  }

  student.status = 'disapproved';
  await student.save();

  res.json({ message: "Student rejected successfully" });
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getMyStudents,
  getStudentById,
  approveStudent,
  rejectStudent,
  openAttendance,
  closeAttendance,
  getAttendanceRecords,
  getAttendanceSummary,
  getStudentReports,
  getAllReports,
  gradeReport
};
