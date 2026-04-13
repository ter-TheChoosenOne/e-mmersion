const express = require('express');
const { uploadProfilePic, uploadReport } = require('../config/multer');
const {
  getMyProfile,
  updateMyProfile,
  createReport,
  updateReport,
  getMyReports,
  submitReport,
  deleteReport
} = require('../controllers/studentController');

const {
  studentTimeIn,
  studentTimeOut,
  getStudentAttendance,
  getActiveSession
} = require('../controllers/attendanceController');

const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/me', protect, authorize('student'), getMyProfile);
router.put('/me', protect, authorize('student'), uploadProfilePic, updateMyProfile);

router.post('/time-in', protect, authorize('student'), studentTimeIn);
router.post('/time-out', protect, authorize('student'), studentTimeOut);
router.get('/attendance', protect, authorize('student'), getStudentAttendance);
router.get('/attendance/session', protect, authorize('student'), getActiveSession);

// Report routes
router.post('/reports', protect, authorize('student'), uploadReport, createReport);
router.put('/reports/:id', protect, authorize('student'), uploadReport, updateReport);
router.get('/reports', protect, authorize('student'), getMyReports);
router.post('/reports/:id/submit', protect, authorize('student'), submitReport);
router.delete('/reports/:id', protect, authorize('student'), deleteReport);

module.exports = router;
