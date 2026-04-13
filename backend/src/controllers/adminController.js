const User = require('../models/user');
const bcrypt = require('bcryptjs');

const getAllStudents = async (req, res) => {
  const students = await User.find({ role: "student" }).select('-password');
  res.json(students);
};

const getAllTeachers = async (req, res) => {
  const teachers = await User.find({ role: "teacher" }).select('-password');
  res.json(teachers);
};

const getAllUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
};

const getStudentById = async (req, res) => {
  const student = await User.findById(req.params.id).select('-password');
  if (!student || student.role !== 'student') {
    return res.status(404).json({ error: "Student not found" });
  }
  res.json(student);
};

const getTeacherById = async (req, res) => {
  const teacher = await User.findById(req.params.id).select('-password');
  if (!teacher || teacher.role !== 'teacher') {
    return res.status(404).json({ error: "Teacher not found" });
  }
  res.json(teacher);
};

const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json(user);
};

const updateStudent = async (req, res) => {
  const student = await User.findById(req.params.id);

  if (!student || student.role !== 'student') return res.status(404).json({ error: "Student not found" });

  Object.assign(student, req.body);

  if (req.body.password) {
    student.password = await bcrypt.hash(req.body.password, 10);
  }

  await student.save();
  res.json({ message: "Student updated" });
};

const updateTeacher = async (req, res) => {
  const teacher = await User.findById(req.params.id);

  if (!teacher || teacher.role !== 'teacher') return res.status(404).json({ error: "Teacher not found" });

  Object.assign(teacher, req.body);

  if (req.body.password) {
    teacher.password = await bcrypt.hash(req.body.password, 10);
  }

  await teacher.save();
  res.json({ message: "Teacher updated" });
};

const updateUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) return res.status(404).json({ error: "User not found" });

  Object.assign(user, req.body);

  if (req.body.password) {
    user.password = await bcrypt.hash(req.body.password, 10);
  }

  await user.save();
  res.json({ message: "User updated" });
};

const deleteStudent = async (req, res) => {
  const student = await User.findById(req.params.id);
  if (!student || student.role !== 'student') {
    return res.status(404).json({ error: "Student not found" });
  }
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "Student deleted" });
};

const deleteTeacher = async (req, res) => {
  const teacher = await User.findById(req.params.id);
  if (!teacher || teacher.role !== 'teacher') {
    return res.status(404).json({ error: "Teacher not found" });
  }
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "Teacher deleted" });
};

const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
};

const filterStudents = async (req, res) => {
  const search = req.query.search || "";

  const students = await User.find({
    role: "student",
    $or: [
      { studentId: { $regex: search, $options: "i" } },
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ]
  }).select('-password');

  res.json(students);
};

const filterTeachers = async (req, res) => {
  const search = req.query.search || "";

  const teachers = await User.find({
    role: "teacher",
    $or: [
      { teacherId: { $regex: search, $options: "i" } },
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ]
  }).select('-password');

  res.json(teachers);
};

const filterUsers = async (req, res) => {
  const search = req.query.search || "";
  const role = req.query.role;

  let filter = {
    $or: [
      { studentId: { $regex: search, $options: "i" } },
      { teacherId: { $regex: search, $options: "i" } },
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ]
  };

  if (role) {
    filter.role = role;
  }

  const users = await User.find(filter).select('-password');
  res.json(users);
};

const Attendance = require('../models/attendance');
const Session = require('../models/attendanceSession');

const getAttendanceReports = async (req, res) => {
  try {
    const { startDate, endDate, studentId, teacherId } = req.query;

    let filter = {};

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (studentId) {
      filter.student = studentId;
    }

    if (teacherId) {
      // Find sessions created by this teacher and get attendance for those sessions
      const teacherSessions = await Session.find({ createdBy: teacherId }).select('_id');
      const sessionIds = teacherSessions.map(s => s._id);
      filter.session = { $in: sessionIds };
    }

    const attendance = await Attendance.find(filter)
      .populate('student', 'fullName studentId')
      .populate({
        path: 'session',
        populate: {
          path: 'createdBy',
          select: 'fullName teacherId'
        }
      })
      .sort({ date: -1, createdAt: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAttendanceSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(dateFilter)
      .populate('student', 'fullName studentId')
      .populate('session', 'type');

    // Calculate summary statistics
    const summary = {
      totalRecords: attendance.length,
      presentCount: attendance.filter(a => a.timeIn).length,
      absentCount: attendance.filter(a => !a.timeIn).length,
      onTimeCount: attendance.filter(a => {
        if (!a.timeIn) return false;
        const sessionStart = new Date(a.session?.startTime || a.createdAt);
        const timeIn = new Date(a.timeIn);
        const diffMinutes = (timeIn - sessionStart) / (1000 * 60);
        return diffMinutes <= 15; // Consider on time if within 15 minutes
      }).length,
      lateCount: attendance.filter(a => {
        if (!a.timeIn) return false;
        const sessionStart = new Date(a.session?.startTime || a.createdAt);
        const timeIn = new Date(a.timeIn);
        const diffMinutes = (timeIn - sessionStart) / (1000 * 60);
        return diffMinutes > 15;
      }).length,
      bySessionType: {
        AM: attendance.filter(a => a.session?.type === 'AM').length,
        PM: attendance.filter(a => a.session?.type === 'PM').length
      }
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllStudents,
  getAllTeachers,
  getAllUsers,
  getStudentById,
  getTeacherById,
  getUserById,
  updateStudent,
  updateTeacher,
  updateUser,
  deleteStudent,
  deleteTeacher,
  deleteUser,
  filterStudents,
  filterTeachers,
  filterUsers,
  getAttendanceReports,
  getAttendanceSummary
};