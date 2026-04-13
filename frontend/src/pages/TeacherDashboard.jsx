import { useContext, useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { AuthContext } from "../context/AuthContext";
import {
  approveStudent,
  getActiveAttendanceSession,
  getNotifications,
  getTeacherAttendance,
  getTeacherProfile,
  getTeacherReports,
  getTeacherStudentReports,
  getTeacherStudents,
  
  markNotificationRead,
  startAMAttendance,
  startPMAttendance,
  closeTeacherAttendance,
  rejectStudent,
  updateTeacherProfile,
} from "../services/api";
import "../styles/teacher-dashboard.css";
import mapImg from "../assets/images/map.png"; // Ensure this path is correct

const teacherSections = [
  { key: "dashboard", label: "Dashboard" },
  { key: "students", label: "Students" },
  { key: "attendance", label: "Attendance" },
  { key: "reports", label: "Reports" },
  { key: "location", label: "Student Location" },
  { key: "about", label: "About" },
  { key: "settings", label: "Settings" },
];

const emptyTeacherProfile = {
  fullName: "",
  email: "",
  teacherId: "",
};

const TeacherDashboard = () => {
  const { user, login, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const sections = teacherSections;
  const [activeSection, setActiveSection] = useState("dashboard");
  const [pageError, setPageError] = useState("");
  const [busyAction, setBusyAction] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [teacherProfile, setTeacherProfile] = useState(emptyTeacherProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceSession, setAttendanceSession] = useState(() => {
    const saved = localStorage.getItem('teacherAttendanceSession');
    return saved ? JSON.parse(saved) : { am: null, pm: null };
  });


  const [selectedStudentReports, setSelectedStudentReports] = useState([]);
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [reports, setReports] = useState([]);
  const [reportStatusFilter, setReportStatusFilter] = useState("");
  const [teacherAttendanceFilters, setTeacherAttendanceFilters] = useState({
    date: "",
    studentId: "",
  });

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteType, setDeleteType] = useState(null); // 'single' or 'all'
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);
  const [deletedAttendanceIds, setDeletedAttendanceIds] = useState(() => {
    const saved = localStorage.getItem('deletedAttendanceIds');
    return saved ? JSON.parse(saved) : [];
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const userKey = `darkMode_${user?.id || 'guest'}`;
    return localStorage.getItem(userKey) === 'true';
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('notifications') !== 'false';
  });
  const [toast, setToast] = useState(null);

  const title = useMemo(() => "Teacher Dashboard", []);

  const openSidebar = () => {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      setSidebarOpen(true);
    }
  };

  const closeSidebar = () => {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleRequestError = (error) => {
    setPageError(error.response?.data?.error || "Something went wrong.");
  };

  const refreshTeacherProfile = async () => {
    const response = await getTeacherProfile();
    setTeacherProfile({
      fullName: response.data.fullName || "",
      email: response.data.email || "",
      teacherId: response.data.teacherId || "",
    });

    login({
      token: localStorage.getItem("token"),
      user: {
        fullName: response.data.fullName || user?.fullName,
        role: response.data.role || user?.role,
      },
    });
  };

  const refreshTeacherStudents = async () => {
    const response = await getTeacherStudents();
    setStudents(response.data || []);
  };

  const refreshTeacherAttendance = async () => {
    const params = {};

    if (teacherAttendanceFilters.date) {
      params.date = teacherAttendanceFilters.date;
    }

    if (teacherAttendanceFilters.studentId) {
      params.studentId = teacherAttendanceFilters.studentId;
    }

    const response = await getTeacherAttendance(params);
    const fetchedAttendance = response.data.attendance || [];
    const filteredAttendance = fetchedAttendance.filter(r => !deletedAttendanceIds.includes(r._id));
    setAttendance(filteredAttendance);
  };

  const refreshTeacherAttendanceSession = async () => {
    try {
      const response = await getActiveAttendanceSession();

      if (response.data.hasActiveSession) {
        const session = response.data.session;
        const sessionData = {
          am: session.type === 'AM' ? {
            hasActiveSession: true,
            sessionStartTime: session.startTime,
          } : null,
          pm: session.type === 'PM' ? {
            hasActiveSession: true,
            sessionStartTime: session.startTime,
          } : null,
          currentSession: session
        };
        setAttendanceSession(sessionData);
      } else {
        setAttendanceSession({ am: null, pm: null });
      }
    } catch {
      setAttendanceSession({ am: null, pm: null });
    }
  };



  const refreshTeacherReports = async () => {
    const params = {};

    if (reportStatusFilter) {
      params.status = reportStatusFilter;
    }

    const response = await getTeacherReports(params);
    const fetchedReports = response.data.reports || [];
    // Apply local grades to fetched reports
    const reportsWithGrades = fetchedReports.map(report => ({
      ...report,
      grade: localGrades[report._id] || report.grade,
      status: localGrades[report._id] ? 'reviewed' : report.status
    }));
    setReports(reportsWithGrades);
  };

  const refreshNotifications = async () => {
    try {
      const response = await getNotifications();
      setNotifications(response.data || []);
    } catch {
      // Silently fail for notifications
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setPageError("");

        await Promise.all([
          refreshTeacherProfile(),
          refreshTeacherStudents(),
          refreshTeacherAttendance(),
          refreshTeacherAttendanceSession(),
          refreshTeacherReports(),
          refreshNotifications(),
        ]);
      } catch (error) {
        handleRequestError(error);
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    // Apply dark mode only to dashboard container, not globally
    const dashboardElement = document.querySelector('.workspace-shell');
    if (dashboardElement) {
      dashboardElement.classList.toggle('dark-mode', isDarkMode);
    }
    const userKey = `darkMode_${user?.id || 'guest'}`;
    localStorage.setItem(userKey, isDarkMode);
  }, [isDarkMode, user?.id]);

  useEffect(() => {
    localStorage.setItem('notifications', notificationsEnabled);
    // Here you could add actual notification permission logic
    if (notificationsEnabled) {
      // Request notification permission if needed
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [notificationsEnabled]);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem('deletedAttendanceIds', JSON.stringify(deletedAttendanceIds));
  }, [deletedAttendanceIds]);

  useEffect(() => {
    if (pageError) {
      const timer = setTimeout(() => {
        setPageError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [pageError]);

  // Save attendance session to localStorage when it changes
  useEffect(() => {
    if (attendanceSession) {
      localStorage.setItem('teacherAttendanceSession', JSON.stringify(attendanceSession));
    } else {
      localStorage.removeItem('teacherAttendanceSession');
    }
  }, [attendanceSession]);



  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setTeacherProfile((current) => ({ ...current, [name]: value }));
  };

  const handleCancelProfile = () => {
    refreshTeacherProfile();
    setIsEditing(false);
    if (showProfileModal) {
      setShowProfileModal(false);
    }
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setPageError("");
    setBusyAction("profile");

    try {
      await updateTeacherProfile({
        fullName: teacherProfile.fullName,
        email: teacherProfile.email,
        teacherId: teacherProfile.teacherId,
      });
      await refreshTeacherProfile();
      if (showProfileModal) {
        setShowProfileModal(false);
        setIsEditing(false);
      }
      confirmSaveProfile();
    } catch (error) {
      handleRequestError(error);
    } finally {
      setBusyAction("");
    }
  };

  const handleTeacherAttendanceSession = async (action, sessionType) => {
    setPageError("");

    setBusyAction(`${action}-${sessionType}`);

    try {
      if (action === "start") {
        // Start AM or PM session
        if (sessionType === "am") {
          await startAMAttendance();
        } else {
          await startPMAttendance();
        }
      } else if (action === "close") {
        await closeTeacherAttendance();
      }

      await Promise.all([refreshTeacherAttendance(), refreshTeacherAttendanceSession()]);

    } catch (error) {
      handleRequestError(error);
    } finally {
      setBusyAction("");
    }
  };

  const handleTeacherFilterChange = (event) => {
    const { name, value } = event.target;
    setTeacherAttendanceFilters((current) => ({ ...current, [name]: value }));
  };

  const handleDeleteAttendance = (id) => {
    setDeleteTarget(id);
    setDeleteType('single');
    setShowDeleteModal(true);
  };

  const handleDeleteAllAttendance = () => {
    setDeleteTarget(null);
    setDeleteType('all');
    setShowDeleteModal(true);
  };

  const confirmDeleteAttendance = async () => {
    setPageError("");
    setBusyAction(deleteType === 'single' ? deleteTarget : 'delete-all');

    setShowDeleteModal(false);

    try {
      if (deleteType === 'single') {
        setDeletedAttendanceIds(prev => [...prev, deleteTarget]);
        setAttendance(prev => prev.filter(r => r._id !== deleteTarget));
      } else {
        const allIds = attendance.map(r => r._id);
        setDeletedAttendanceIds(prev => [...prev, ...allIds]);
        setAttendance([]);
      }

      showToast(deleteType === 'single' ? 'Attendance record deleted successfully!' : 'All attendance records deleted successfully!', 'success');
    } catch (error) {
      handleRequestError(error);
    } finally {
      setBusyAction("");
      setDeleteTarget(null);
      setDeleteType(null);
    }
  };

  const cancelDeleteAttendance = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
    setDeleteType(null);
  };

  const markAsRead = async (id) => {
    try {
      await markNotificationRead(id);
      await refreshNotifications();
    } catch {
      // Silently fail
    }
  };



  const handleViewStudentReports = async (student) => {
    setPageError("");
    setBusyAction(student._id);

    try {
      const response = await getTeacherStudentReports(student._id);
      const fetchedReports = response.data.reports || [];
      // Apply local grades
      const reportsWithGrades = fetchedReports.map(report => ({
        ...report,
        grade: localGrades[report._id] || report.grade,
        status: localGrades[report._id] ? 'reviewed' : report.status
      }));
      setSelectedStudentReports(reportsWithGrades);
      setSelectedStudentName(student.fullName);
      setActiveSection("reports");
    } catch (error) {
      handleRequestError(error);
    } finally {
      setBusyAction("");
    }
  };

  const handleApproveStudent = async (studentId) => {
    setPageError("");
    setBusyAction(studentId);

    try {
      await approveStudent(studentId);
      await refreshTeacherStudents(); // Refresh to get updated status
      showToast('Student approved successfully!', 'success');
    } catch (error) {
      handleRequestError(error);
    } finally {
      setBusyAction("");
    }
  };

  const handleRejectStudent = async (studentId) => {
    setPageError("");
    setBusyAction(studentId);

    try {
      await rejectStudent(studentId);
      await refreshTeacherStudents(); // Refresh to get updated status
      showToast('Student disapproved and blacklisted!', 'info');
    } catch (error) {
      handleRequestError(error);
    } finally {
      setBusyAction("");
    }
  };

  const handleGradeReport = async (reportId, grade) => {
    console.log('Grading report', reportId, 'with grade', grade);
    setBusyAction(reportId);

    // Update local grades storage
    const newGrades = { ...localGrades, [reportId]: grade };
    setLocalGrades(newGrades);
    localStorage.setItem('teacherReportGrades', JSON.stringify(newGrades));

    // Update local reports state for immediate UI feedback
    setReports(prev => prev.map(report =>
      report._id === reportId ? { ...report, grade, status: 'reviewed' } : report
    ));
    if (selectedStudentReports.length > 0) {
      setSelectedStudentReports(prev => prev.map(report =>
        report._id === reportId ? { ...report, grade, status: 'reviewed' } : report
      ));
    }
    showToast('Report graded successfully!', 'success');
    setBusyAction("");
    setGradingReport(null);
  };

  const showToast = (message, type = 'success', duration = 3000) => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), duration);
  };

  const confirmSaveProfile = () => {
    showToast('Profile changes saved successfully!', 'success');
  };

  const renderTeacherDashboard = () => {
    const totalStudents = students.length;
    const totalReports = reports.length;
    const totalAttendance = attendance.length;

    return (
      <section className="panel">
        <div className="panel__header">
          <div>
            <h2>{user?.fullName || "Teacher"}</h2>
          </div>
        </div>

        <div className="metrics-grid">
          <div className="metric-card">
            <strong>{totalStudents}</strong>
            <span>Total Students</span>
          </div>
          <div className="metric-card">
            <strong>{totalReports}</strong>
            <span>Total Reports</span>
          </div>
          <div className="metric-card">
            <strong>{totalAttendance}</strong>
            <span>Total Attendance Records</span>
          </div>
        </div>

        <div className="graph-section">
          <h3>Reports Submitted Over Time</h3>
          <p>Graph will be added here.</p>
        </div>
      </section>
    );
  };

  const renderTeacherProfile = () => (
    <div>
      {!showProfileModal && (
        <div className="panel__header panel__header--split">
          <div>
            <p className="panel__eyebrow">Profile</p>
            <h2>Teacher Information</h2>
          </div>
          <div className="panel__actions">
            <Button
              type="button"
              variant="secondary"
              onClick={isEditing ? handleCancelProfile : () => setIsEditing(true)}
              disabled={busyAction === "profile"}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div style={{ marginBottom: '1.5rem' }}>
          <Button
            type="button"
            variant="secondary"
            onClick={isEditing ? handleCancelProfile : () => setIsEditing(true)}
            disabled={busyAction === "profile"}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>
      )}

      {isEditing ? (
        <form className="dashboard-form" onSubmit={handleSaveProfile}>
          <div className="dashboard-form__grid">
            <Input
              label="Full Name"
              name="fullName"
              value={teacherProfile.fullName}
              onChange={handleProfileChange}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={teacherProfile.email}
              onChange={handleProfileChange}
            />
            <Input
              label="Teacher ID"
              name="teacherId"
              value={teacherProfile.teacherId}
              onChange={handleProfileChange}
            />
          </div>

          <div className="panel__actions">
            <Button type="submit" disabled={busyAction === "profile"}>
              {busyAction === "profile" ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="profile-view">
          <div className="profile-view__avatar">
            <span className="avatar-placeholder">
              {window.innerWidth <= 640
                ? (teacherProfile.fullName || "Teacher")
                : (teacherProfile.fullName || "T").charAt(0).toUpperCase()
              }
            </span>
          </div>
          <div className="profile-view__details">
            <dl>
              <dt>Full Name</dt>
              <dd>{teacherProfile.fullName || 'Not set'}</dd>
              <dt>Email</dt>
              <dd>{teacherProfile.email || 'Not set'}</dd>
              <dt>Teacher ID</dt>
              <dd>{teacherProfile.teacherId || 'Not set'}</dd>
            </dl>
          </div>
        </div>
      )}
    </div>
  );

  const renderTeacherStudents = () => (
    <section className="panel">
      <div className="panel__header student-list-header">
        <div>
          <p className="panel__eyebrow">Students</p>
          <h2>Student List</h2>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Student ID</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.length ? (
              students.map((student) => (
                <tr key={student._id} className={(student.status === 'pending' || !student.status) && student.status !== 'disapproved' ? 'pending-student' : ''}>
                  <td>{student.fullName}</td>
                  <td>{student.email}</td>
                  <td>{student.studentId || "-"}</td>
                  <td>
                    <span className={`status-pill status-pill--${!student.status ? 'pending' : student.status}`}>
                      {!student.status ? 'Pending' : student.status === 'disapproved' ? 'Disapproved' : student.status}
                    </span>
                  </td>
                  <td>
                    {student.status === 'pending' || !student.status ? (
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <Button
                          onClick={() => handleApproveStudent(student._id)}
                          disabled={busyAction === student._id}
                          style={{ background: '#10b981', color: 'white' }}
                        >
                          {busyAction === student._id ? "Processing..." : "Accept"}
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => handleRejectStudent(student._id)}
                          disabled={busyAction === student._id}
                          style={{ background: '#dc2626', color: 'white' }}
                        >
                          {busyAction === student._id ? "Processing..." : "Not Accept"}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="secondary"
                        onClick={() => handleViewStudentReports(student)}
                        disabled={busyAction === student._id}
                      >
                        {busyAction === student._id ? "Loading..." : window.innerWidth < 640 ? "View" : "View Reports"}
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={window.innerWidth < 640 ? "3" : "5"}>No students found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );

  const [showAttendanceDetails, setShowAttendanceDetails] = useState(false);
  const [attendanceFilter, setAttendanceFilter] = useState('all'); // 'all', 'present', 'absent'
  const [gradingReport, setGradingReport] = useState(null); // {id, grade}
  const [localGrades, setLocalGrades] = useState(() => {
    const saved = localStorage.getItem('teacherReportGrades');
    return saved ? JSON.parse(saved) : {};
  }); // { [reportId]: grade }

  const renderTeacherAttendance = () => {
    const today = new Date().toISOString().split('T')[0];
    const selectedDate = today;
    const isToday = true;

    // Calculate summary for selected date
    const dayRecords = attendance.filter(record =>
      new Date(record.date).toISOString().split('T')[0] === selectedDate
    );
    const presentCount = dayRecords.filter(r => r.status === 'present').length;
    const absentCount = dayRecords.filter(r => r.status === 'absent').length;
    const totalCount = dayRecords.length;

    return (
      <section className="panel panel--stacked">
        <div className="panel__header">
          <div>
            <p className="panel__eyebrow">Attendance</p>
            <h2>AM & PM Sessions</h2>
          </div>
          <div className="panel__actions">
            <Button
              onClick={handleDeleteAllAttendance}
              disabled={busyAction === "delete-all"}
              style={{ background: '#dc2626', color: 'white' }}
            >
              {busyAction === "delete-all" ? "Deleting..." : "DELETE ALL"}
            </Button>
          </div>
        </div>

        <div className="attendance-session-controls">
          <div className="session-group">
            <h3>AM Session (Morning)</h3>
            <div className="session-status">
              {attendanceSession?.am?.hasActiveSession ? (
                <span style={{ color: '#10b981' }}>● Active</span>
              ) : (
                <span style={{ color: '#6b7280' }}>○ Closed</span>
              )}
              {attendanceSession?.am?.sessionStartTime && (
                <small> • Started: {new Date(attendanceSession.am.sessionStartTime).toLocaleTimeString()}</small>
              )}
            </div>
            <div className="session-actions">
              <Button
                onClick={() => handleTeacherAttendanceSession("start", "am")}
                disabled={busyAction === "start-am"}
                size="small"
              >
                {busyAction === "start-am" ? "Starting..." :
                 attendanceSession?.am?.hasActiveSession ? "AM Active" : "Start AM"}
              </Button>
            </div>
          </div>

          <div className="session-group">
            <h3>PM Session (Afternoon)</h3>
            <div className="session-status">
              {attendanceSession?.pm?.hasActiveSession ? (
                <span style={{ color: '#10b981' }}>● Active</span>
              ) : (
                <span style={{ color: '#6b7280' }}>○ Closed</span>
              )}
              {attendanceSession?.pm?.sessionStartTime && (
                <small> • Started: {new Date(attendanceSession.pm.sessionStartTime).toLocaleTimeString()}</small>
              )}
            </div>
            <div className="session-actions">
              <Button
                onClick={() => handleTeacherAttendanceSession("start", "pm")}
                disabled={busyAction === "start-pm"}
                size="small"
              >
                {busyAction === "start-pm" ? "Starting..." :
                 attendanceSession?.pm?.hasActiveSession ? "PM Active" : "Start PM"}
              </Button>
            </div>
          </div>
        </div>

        {/* Close Attendance Button */}
        {(attendanceSession?.am?.hasActiveSession || attendanceSession?.pm?.hasActiveSession) && (
          <div className="attendance-close-section">
            <Button
              variant="secondary"
              onClick={() => handleTeacherAttendanceSession("close", "all")}
              disabled={busyAction === "close-all"}
              style={{ background: '#dc2626', color: 'white' }}
            >
              {busyAction === "close-all" ? "Closing..." : "Close Attendance Session"}
            </Button>
          </div>
        )}

        <div className="attendance-search-bar">
          <Input
            label="Student ID"
            name="studentId"
            value={teacherAttendanceFilters.studentId}
            onChange={handleTeacherFilterChange}
            placeholder="Search by Student ID..."
          />
          <Button onClick={refreshTeacherAttendance}>🔍 Search</Button>
        </div>

        {/* Daily Summary Card */}
        <div className="attendance-summary-card">
          <div className="attendance-summary-header">
            <h3>{isToday ? "Today's Attendance" : `Attendance for ${new Date(selectedDate).toLocaleDateString()}`}</h3>
            <Button
              variant="secondary"
              onClick={() => setShowAttendanceDetails(!showAttendanceDetails)}
            >
              {showAttendanceDetails ? "Hide Details" : "Show Details"}
            </Button>
          </div>
          <div className="attendance-summary-stats">
            <div
              className={`stat-item stat-present ${attendanceFilter === 'present' ? 'active' : ''}`}
              onClick={() => {
                setAttendanceFilter(attendanceFilter === 'present' ? 'all' : 'present');
                setShowAttendanceDetails(true);
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="stat-number">{presentCount}</div>
              <div className="stat-label">Present</div>
            </div>
            <div
              className={`stat-item stat-absent ${attendanceFilter === 'absent' ? 'active' : ''}`}
              onClick={() => {
                setAttendanceFilter(attendanceFilter === 'absent' ? 'all' : 'absent');
                setShowAttendanceDetails(true);
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="stat-number">{absentCount}</div>
              <div className="stat-label">Absent</div>
            </div>
            <div
              className={`stat-item stat-total ${attendanceFilter === 'all' ? 'active' : ''}`}
              onClick={() => {
                setAttendanceFilter('all');
                setShowAttendanceDetails(true);
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="stat-number">{totalCount}</div>
              <div className="stat-label">Total Records</div>
            </div>
          </div>
        </div>

        {/* Detailed Records */}
        {showAttendanceDetails && (
          <div className="attendance-details">
            <h4>Attendance Details {attendanceFilter !== 'all' ? `(${attendanceFilter})` : ''}</h4>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Student ID</th>
                    <th>Status</th>
                    <th>Time In</th>
                    <th>Time Out</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const filteredRecords = dayRecords.filter(record => {
                      if (attendanceFilter === 'present') return record.status === 'present';
                      if (attendanceFilter === 'absent') return record.status === 'absent';
                      return true; // all
                    });
                    return filteredRecords.length ? (
                      filteredRecords.map((record) => (
                        <tr key={record._id}>
                          <td>{record.student?.fullName || "-"}</td>
                          <td>{record.student?.studentId || "-"}</td>
                          <td>
                            <span className={`status-pill status-pill--${record.status}`}>
                              {record.status}
                            </span>
                          </td>
                          <td>{record.timeIn ? new Date(record.timeIn).toLocaleTimeString() : "-"}</td>
                          <td>{record.timeOut ? new Date(record.timeOut).toLocaleTimeString() : "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5">No {attendanceFilter === 'all' ? '' : attendanceFilter} attendance records for this date.</td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Grouped Attendance Records (when not showing details) */}
        {!showAttendanceDetails && attendance.length > 0 && (() => {
          const groupedAttendance = attendance.reduce((acc, record) => {
            const dateStr = new Date(record.date).toLocaleDateString();
            if (!acc[dateStr]) acc[dateStr] = [];
            acc[dateStr].push(record);
            return acc;
          }, {});
          const sortedDates = Object.keys(groupedAttendance).sort((a, b) => new Date(b) - new Date(a));
          return sortedDates.map(date => (
            <div key={date} style={{ border: '2px solid maroon', marginBottom: '1rem', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ marginTop: 0, marginBottom: '0.5rem' }}>{date}</h4>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Student ID</th>
                      <th>Status</th>
                      <th>Time In</th>
                      <th>Time Out</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedAttendance[date].map((record) => (
                      <tr key={record._id}>
                        <td>{record.student?.fullName || "-"}</td>
                        <td>{record.student?.studentId || "-"}</td>
                        <td>
                          <span className={`status-pill status-pill--${record.status}`}>
                            {record.status}
                          </span>
                        </td>
                        <td>{record.timeIn ? new Date(record.timeIn).toLocaleTimeString() : "-"}</td>
                        <td>{record.timeOut ? new Date(record.timeOut).toLocaleTimeString() : "-"}</td>
                        <td>
                          <Button
                            onClick={() => handleDeleteAttendance(record._id)}
                            disabled={busyAction === record._id}
                            variant="secondary"
                            style={{ background: '#dc2626', color: 'white', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                          >
                            {busyAction === record._id ? "..." : "DELETE"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ));
        })()}
        {!showAttendanceDetails && attendance.length === 0 && <p className="empty-state">No attendance records</p>}
      </section>
    );
  };




const renderTeacherStudentLocation = () => (
  <section className="panel">
    <div className="panel__header location-header">
      <div>
        <p className="panel__eyebrow">Location</p>
        <h2>Student Locations</h2>
      </div>
    </div>

    <div className="location-map-container">
      <img
        src={mapImg}
        alt="Student Locations Map"
        className="location-map-image"
      />

      <p className="location-description">
        View student locations on the interactive map. This feature helps track student distribution and accessibility.
      </p>
    </div>
  </section>
);

  const renderTeacherReports = () => (
    <section className="panel">
      <div className="panel__header panel__header--split reports-header">
        <div>
          <p className="panel__eyebrow">Reports</p>
          <h2>{selectedStudentName ? `${selectedStudentName} Reports` : "All Reports"}</h2>
        </div>
        <div className="inline-filter">
          <label>
            <span>Status</span>
            <select
              className="select-control"
              value={reportStatusFilter}
              onChange={(event) => setReportStatusFilter(event.target.value)}
            >
              <option value="">All</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="reviewed">Reviewed</option>
            </select>
          </label>
          <Button onClick={refreshTeacherReports} variant="secondary">
            Filter
          </Button>
        </div>
      </div>

      <div className="cards-grid">
        {(selectedStudentReports.length ? selectedStudentReports : reports).length ? (
          (selectedStudentReports.length ? selectedStudentReports : reports).map((report) => (
        <article key={report._id} className="info-card">
          <div className="info-card__top">
            <h3>{report.title}</h3>
            <div className="card-badges">
              <span className={`status-pill status-pill--${report.status}`}>{report.status}</span>
              {report.grade && <span className="grade-badge">Grade: {report.grade}/10</span>}
            </div>
          </div>
          <p>{report.content || "No content available."}</p>
          <small>
            {report.student?.fullName ? <><strong className="student-name">{report.student.fullName}</strong> • </> : ""}
            {new Date(report.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </small>
          {!report.grade && (
            <div className="grading-section">
              {gradingReport?.id === report._id ? (
                <div className="grade-input-group">
                  <select
                    value={gradingReport.grade}
                    onChange={(e) => setGradingReport({ id: report._id, grade: parseInt(e.target.value) })}
                    className="grade-select"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                  <Button onClick={() => handleGradeReport(report._id, gradingReport.grade)} disabled={busyAction === report._id}>
                    {busyAction === report._id ? "Grading..." : "Submit"}
                  </Button>
                  <Button variant="secondary" onClick={() => setGradingReport(null)}>Cancel</Button>
                </div>
              ) : (
                <Button variant="secondary" onClick={() => setGradingReport({ id: report._id, grade: 5 })}>
                  Grade Report
                </Button>
              )}
            </div>
          )}
        </article>
          ))
        ) : (
          <p className="empty-state">No reports found.</p>
        )}
      </div>
    </section>
  );

  const renderAbout = () => (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="panel__eyebrow">About</p>
          <h2>Work Immersion System</h2>
        </div>
      </div>

      <div className="about-content">
        <div className="about-intro">
          <h3>Empower Your Teaching Excellence</h3>
          <p>A comprehensive platform designed to streamline student management, enhance learning outcomes, and provide powerful tools for effective teacher-student collaboration.</p>
        </div>

        <div className="about-features-grid">
          <div className="feature-card">
            <h4>Student Management</h4>
            <p>Comprehensive oversight of student information, attendance records, and performance tracking in one centralized dashboard.</p>
          </div>

          <div className="feature-card">
            <h4>Attendance Control</h4>
            <p>Monitor and manage attendance sessions with real-time tracking, automated reporting, and detailed analytics.</p>
          </div>

          <div className="feature-card">
            <h4>Report Evaluation</h4>
            <p>Review, grade, and provide constructive feedback on student reports with advanced assessment tools.</p>
          </div>

          <div className="feature-card">
            <h4>Performance Analytics</h4>
            <p>Generate detailed attendance summaries, performance insights, and comprehensive progress reports.</p>
          </div>

          <div className="feature-card">
            <h4>Profile Center</h4>
            <p>Maintain your professional profile, manage credentials, and customize your teaching dashboard.</p>
          </div>

          <div className="feature-card">
            <h4>Live Collaboration</h4>
            <p>Real-time data synchronization with instant notifications and seamless communication channels.</p>
          </div>
        </div>

        <div className="about-benefits">
          <h3>Why Choose Our Platform?</h3>
          <div className="benefits-grid">
            <div className="benefit-item">
              <span className="benefit-check">✓</span>
              <span>Streamlined student management</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-check">✓</span>
              <span>Advanced analytics & reporting</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-check">✓</span>
              <span>Intuitive teacher interface</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-check">✓</span>
              <span>Enterprise-grade security</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-check">✓</span>
              <span>Cross-platform accessibility</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-check">✓</span>
              <span>Real-time collaboration tools</span>
            </div>
          </div>
        </div>

        <div className="about-stats">
          <div className="stat-highlight">
            <div className="stat-number">24/7</div>
            <div className="stat-label">System Availability</div>
          </div>
          <div className="stat-highlight">
            <div className="stat-number">100%</div>
            <div className="stat-label">Mobile Responsive</div>
          </div>
          <div className="stat-highlight">
            <div className="stat-number">🔒</div>
            <div className="stat-label">Secure & Compliant</div>
          </div>
        </div>
      </div>
    </section>
  );

  const renderTeacherSettings = () => (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="panel__eyebrow">Settings</p>
          <h2>Dashboard Preferences</h2>
        </div>
      </div>

      <div className="settings-section">
        <h3 className="settings-section__title">Appearance</h3>
        <div className="settings-item">
          <div className="settings-item__info">
            <strong>Dark Mode</strong>
            <p>Enable dark theme for better visibility in low light</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={isDarkMode}
              onChange={(e) => setIsDarkMode(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <h3 className="settings-section__title">Notifications</h3>
        <div className="settings-item">
          <div className="settings-item__info">
            <strong>Enable Notifications</strong>
            <p>Receive notifications for important updates and reminders</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <h3 className="settings-section__title">Account</h3>
        <div className="settings-item">
          <div className="settings-item__info">
            <strong>Profile Settings</strong>
            <p>Manage your personal information and preferences</p>
          </div>
          <Button
            onClick={() => setShowProfileModal(true)}
            variant="secondary"
          >
            Edit Profile
          </Button>
        </div>
      </div>
    </section>
  );

  const renderContent = () => {
    if (activeSection === "dashboard") return renderTeacherDashboard();
    if (activeSection === "students") return renderTeacherStudents();
    if (activeSection === "attendance") return renderTeacherAttendance();
    if (activeSection === "reports") return renderTeacherReports();
    if (activeSection === "location") return renderTeacherStudentLocation();
    if (activeSection === "about") return renderAbout();
    if (activeSection === "settings") return renderTeacherSettings();
    return renderTeacherDashboard();
  };

  return (
    <main className="workspace-shell">
      <aside
        className={`workspace-sidebar ${sidebarOpen ? "is-open" : ""}`}
        onMouseLeave={closeSidebar}
      >
        <div className="workspace-brand">
          <span className="workspace-brand__eyebrow">Work Immersion System</span>
          <h1>{title}</h1>
        </div>

        <nav className="workspace-nav">
          {sections.map((section) => (
            <button
              key={section.key}
              type="button"
              className={activeSection === section.key ? "is-active" : ""}
              onClick={() => {
                setActiveSection(section.key);
                setSidebarOpen(false);
                setPageError("");
                if (section.key !== "reports") {
                  setSelectedStudentReports([]);
                  setSelectedStudentName("");
                }
              }}
            >
              {section.label}
            </button>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setShowNotificationsPanel(!showNotificationsPanel)}
          style={{ background: 'none', border: 'none', color: 'inherit', textAlign: 'left', width: '100%', padding: '0.75rem 1rem' }}
        >
          Notifications ({notifications.filter(n => !n.isRead).length})
        </button>

        <div className="workspace-user">
          <strong>{user?.fullName || "User"}</strong>
          <span>{user?.role || "role"}</span>
        </div>

        <Button onClick={handleLogout} variant="secondary">
          Logout
        </Button>
      </aside>

      <section className="workspace-content">
        <header className="workspace-topbar">
          <div className="workspace-topbar__left">
            <button
              type="button"
              className="workspace-burger"
              onMouseEnter={openSidebar}
              onClick={() => setSidebarOpen((current) => !current)}
              aria-label="Toggle navigation"
            >
              <span />
              <span />
              <span />
            </button>
            <div className="workspace-topbar__title">
              <strong>{title}</strong>
              <span>{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</span>
            </div>
            <Button
              onClick={() => setShowNotificationsPanel(!showNotificationsPanel)}
              className="notification-btn"
              style={{ marginLeft: '1rem', display: isDesktop ? 'none' : 'inline-block' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22c1.1 0 2-.9 2-2H10c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
              </svg>
            </Button>
          </div>

          <button
            type="button"
            className="workspace-topbar__profile-btn"
            onClick={() => setShowProfileModal(true)}
            aria-label="Edit profile"
          >
            <span>{(teacherProfile.fullName || "T").charAt(0).toUpperCase()}</span>
          </button>
        </header>

        {showNotificationsPanel && (
          <div style={{
            position: 'absolute',
            top: '60px',
            right: '10px',
            width: '300px',
            maxHeight: '400px',
            overflowY: 'auto',
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            zIndex: 1000,
            padding: '10px'
          }}>
            <h4>Notifications</h4>
            {notifications.length === 0 ? (
              <p>No notifications</p>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification._id}
                  onClick={() => markAsRead(notification._id)}
                  style={{
                    padding: '8px',
                    marginBottom: '5px',
                    border: '1px solid #eee',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    background: notification.isRead ? '#f9f9f9' : '#fff',
                    fontWeight: notification.isRead ? 'normal' : 'bold'
                  }}
                >
                  <p>{notification.message}</p>
                  <small>{new Date(notification.createdAt).toLocaleString()}</small>
                </div>
              ))
            )}
          </div>
        )}

        {pageError && <div className="error-popup">{pageError}</div>}
        {renderContent()}
      </section>

      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast--${toast.type}`}>
          <span>{toast.message}</span>
          <button
            type="button"
            className="toast__close"
            onClick={() => setToast(null)}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="profile-modal" onClick={() => setShowProfileModal(false)}>
          <div className="profile-modal__content" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal__header">
              <h2 className="profile-modal__title">Edit Profile</h2>
              <button
                type="button"
                className="profile-modal__close"
                onClick={() => setShowProfileModal(false)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div className="profile-modal__body">
              {renderTeacherProfile()}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="delete-modal" onClick={cancelDeleteAttendance}>
          <div className="delete-modal__content" onClick={(e) => e.stopPropagation()}>
            <h3 className="delete-modal__title">Delete Attendance Record</h3>
            <p className="delete-modal__message">
              {deleteType === 'single' ? "Are you sure you want to permanently delete this attendance record?" : "This will permanently delete ALL attendance records. Are you sure?"}
            </p>
            <div className="delete-modal__actions">
              <button
                type="button"
                className="delete-modal__cancel"
                onClick={cancelDeleteAttendance}
              >
                Cancel
              </button>
              <button
                type="button"
                className="delete-modal__confirm"
                onClick={confirmDeleteAttendance}
                disabled={busyAction === (deleteType === 'single' ? deleteTarget : 'delete-all')}
              >
                {busyAction === (deleteType === 'single' ? deleteTarget : 'delete-all') ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="delete-modal" onClick={cancelLogout}>
          <div className="delete-modal__content" onClick={(e) => e.stopPropagation()}>
            <h3 className="delete-modal__title">Logout</h3>
            <p className="delete-modal__message">
              Are you sure you want to logout?
            </p>
            <div className="delete-modal__actions">
              <button
                type="button"
                className="delete-modal__cancel"
                onClick={cancelLogout}
              >
                Cancel
              </button>
              <button
                type="button"
                className="delete-modal__confirm"
                onClick={confirmLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default TeacherDashboard;