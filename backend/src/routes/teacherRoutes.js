const express = require('express');
const {
  getMyProfile,
  updateMyProfile,
  getMyStudents,
  getStudentById,
  approveStudent,
  rejectStudent,
  getAttendanceRecords,
  getAttendanceSummary,
  getStudentReports,
  getAllReports,
  gradeReport
} = require('../controllers/teacherController');

const {
  startAMAttendance,
  startPMAttendance,
  closeAttendance,
  getActiveSession
} = require('../controllers/attendanceController');

const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

// Profile routes
router.get('/me', protect, authorize('teacher'), getMyProfile);
router.put('/me', protect, authorize('teacher'), updateMyProfile);

// Student management routes
router.get('/students', protect, authorize('teacher'), getMyStudents);
router.get('/students/:id', protect, authorize('teacher'), getStudentById);
router.post('/students/:id/approve', protect, authorize('teacher'), approveStudent);
router.post('/students/:id/reject', protect, authorize('teacher'), rejectStudent);

// Attendance management routes
router.post('/attendance/start-am', protect, authorize('teacher'), startAMAttendance);
router.post('/attendance/start-pm', protect, authorize('teacher'), startPMAttendance);
router.post('/attendance/close', protect, authorize('teacher'), closeAttendance);
router.get('/attendance', protect, authorize('teacher'), getAttendanceRecords);
router.get('/attendance/session', protect, authorize('teacher'), getActiveSession);
router.get('/attendance/summary', protect, authorize('teacher'), getAttendanceSummary);

// Report management routes
router.get('/students/:id/reports', protect, authorize('teacher'), getStudentReports);
router.get('/reports', protect, authorize('teacher'), getAllReports);
router.post('/reports/:id/grade', protect, authorize('teacher'), gradeReport);

module.exports = router;