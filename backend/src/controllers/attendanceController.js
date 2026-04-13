const Attendance = require('../models/attendance');
const Session = require('../models/attendanceSession');
const User = require('../models/user');

// START AM ATTENDANCE SESSION
const startAMAttendance = async (req, res) => {
  try {
    const teacherId = req.user.id;

    // Check if there's already an active session
    const activeSession = await Session.findOne({
      status: 'active',
      createdBy: teacherId
    });

    if (activeSession) {
      return res.status(400).json({
        error: `Cannot start AM session. ${activeSession.type} session is already active.`
      });
    }

    // Create new AM session
    const session = await Session.create({
      type: 'AM',
      status: 'active',
      createdBy: teacherId,
      startTime: new Date(),
      endTime: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hours for AM session
    });

    res.json({
      message: "AM Attendance session started successfully",
      session
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// START PM ATTENDANCE SESSION
const startPMAttendance = async (req, res) => {
  try {
    const teacherId = req.user.id;

    // Check if there's already an active session
    const activeSession = await Session.findOne({
      status: 'active',
      createdBy: teacherId
    });

    if (activeSession) {
      return res.status(400).json({
        error: `Cannot start PM session. ${activeSession.type} session is already active.`
      });
    }

    // Create new PM session
    const session = await Session.create({
      type: 'PM',
      status: 'active',
      createdBy: teacherId,
      startTime: new Date(),
      endTime: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hours for PM session
    });

    res.json({
      message: "PM Attendance session started successfully",
      session
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// CLOSE ATTENDANCE SESSION
const closeAttendance = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const activeSession = await Session.findOne({
      status: 'active',
      createdBy: teacherId
    });

    if (!activeSession) {
      return res.status(400).json({ error: "No active attendance session found" });
    }

    // Mark absent students who haven't checked in/out
    const students = await User.find({ role: "student" });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let student of students) {
      const existingAttendance = await Attendance.findOne({
        student: student._id,
        sessionType: activeSession.type,
        date: today
      });

      if (!existingAttendance) {
        await Attendance.create({
          student: student._id,
          sessionType: activeSession.type,
          status: "absent"
        });
      }
    }

    // Close the session
    activeSession.status = 'closed';
    activeSession.endTime = new Date();
    await activeSession.save();

    res.json({ message: "Attendance session closed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ACTIVE SESSION
const getActiveSession = async (req, res) => {
  try {
    const activeSession = await Session.findOne({ status: 'active' })
      .populate('createdBy', 'fullName')
      .sort({ createdAt: -1 });

    if (!activeSession) {
      return res.json({ hasActiveSession: false, session: null });
    }

    res.json({
      hasActiveSession: true,
      session: activeSession
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// STUDENT TIME IN (AM session)
const studentTimeIn = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Check if there's an active AM session
    const activeSession = await Session.findOne({
      type: 'AM',
      status: 'active'
    });

    if (!activeSession) {
      return res.status(400).json({ error: "No active AM attendance session" });
    }

    // Check if student already has AM attendance for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      student: studentId,
      sessionType: 'AM',
      date: today
    });

    if (existingAttendance) {
      return res.status(400).json({ error: "You have already marked attendance for AM session today" });
    }

    // Create attendance record
    const attendance = await Attendance.create({
      student: studentId,
      sessionType: 'AM',
      timeIn: new Date(),
      status: 'present'
    });

    res.json({
      message: "Time In recorded successfully",
      attendance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// STUDENT TIME OUT (PM session)
const studentTimeOut = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Check if there's an active PM session
    const activeSession = await Session.findOne({
      type: 'PM',
      status: 'active'
    });

    if (!activeSession) {
      return res.status(400).json({ error: "No active PM attendance session" });
    }

    // Find today's AM attendance to update with time out
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      student: studentId,
      sessionType: 'AM', // AM session record to update with time out
      date: today
    });

    if (!attendance) {
      return res.status(400).json({ error: "No AM attendance record found. Please mark time in first." });
    }

    if (attendance.timeOut) {
      return res.status(400).json({ error: "You have already marked time out for today" });
    }

    // Update with time out
    attendance.timeOut = new Date();
    await attendance.save();

    res.json({
      message: "Time Out recorded successfully",
      attendance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET STUDENT ATTENDANCE
const getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { date } = req.query;

    let query = { student: studentId };
    if (date) {
      const queryDate = new Date(date);
      queryDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(queryDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: queryDate, $lt: nextDay };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1, createdAt: -1 });

    res.json({ attendance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET TEACHER ATTENDANCE RECORDS
const getAttendanceRecords = async (req, res) => {
  try {
    const { date, studentId } = req.query;

    let query = {};
    if (date) {
      const queryDate = new Date(date);
      queryDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(queryDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: queryDate, $lt: nextDay };
    }
    if (studentId) {
      query.student = studentId;
    }

    const attendance = await Attendance.find(query)
      .populate('student', 'fullName studentId email')
      .sort({ date: -1, createdAt: -1 });

    res.json({ attendance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  startAMAttendance,
  startPMAttendance,
  closeAttendance,
  getActiveSession,
  studentTimeIn,
  studentTimeOut,
  getStudentAttendance,
  getAttendanceRecords
};