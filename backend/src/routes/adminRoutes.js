const express = require('express');
const {
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
} = require('../controllers/adminController');


const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

// Student management routes
router.get('/students', protect, authorize('admin'), getAllStudents);
router.get('/students/:id', protect, authorize('admin'), getStudentById);
router.put('/students/:id', protect, authorize('admin'), updateStudent);
router.delete('/students/:id', protect, authorize('admin'), deleteStudent);
router.get('/students/search', protect, authorize('admin'), filterStudents);

// Teacher management routes
router.get('/teachers', protect, authorize('admin'), getAllTeachers);
router.get('/teachers/:id', protect, authorize('admin'), getTeacherById);
router.put('/teachers/:id', protect, authorize('admin'), updateTeacher);
router.delete('/teachers/:id', protect, authorize('admin'), deleteTeacher);
router.get('/teachers/search', protect, authorize('admin'), filterTeachers);

// General user management routes
router.get('/users', protect, authorize('admin'), getAllUsers);
router.get('/users/:id', protect, authorize('admin'), getUserById);
router.put('/users/:id', protect, authorize('admin'), updateUser);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);
router.get('/users/search', protect, authorize('admin'), filterUsers);

// Attendance reports routes
router.get('/attendance/reports', protect, authorize('admin'), getAttendanceReports);
router.get('/attendance/summary', protect, authorize('admin'), getAttendanceSummary);



module.exports = router;