import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { AuthContext } from "../context/AuthContext";
import {
  createStudentReport,
  deleteStudentReport,
  getActiveAttendanceSession as getActiveSession,
  getNotifications,
  getStudentAttendance,
  getStudentProfile,
  getStudentReports,
  markNotificationRead,
  submitStudentReport,
  timeInStudent,
  timeOutStudent,
  updateStudentProfile,
} from "../services/api";
import "../styles/student-dashboard.css";

const studentSections = [
  { key: "dashboard", label: "Dashboard" },
  { key: "attendance", label: "Attendance" },
  { key: "reports", label: "Reports" },
  { key: "about", label: "About" },
  { key: "settings", label: "Settings" },
];

const emptyStudentProfile = {
  fullName: "",
  email: "",
  studentId: "",
  profilePicture: "",
};

const emptyReportForm = {
  title: "",
  content: "",
  reportFile: null,
};

const StudentDashboard = () => {
  const { user, login, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const sections = studentSections;
  const [activeSection, setActiveSection] = useState("dashboard");
  const [pageError, setPageError] = useState("");
  const [busyAction, setBusyAction] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [studentProfile, setStudentProfile] = useState(emptyStudentProfile);
  const [profileFile, setProfileFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [attendance, setAttendance] = useState([]);
  const [attendanceSession, setAttendanceSession] = useState(() => {
    const saved = localStorage.getItem('studentAttendanceSession');
    return saved ? JSON.parse(saved) : { am: null, pm: null };
  });
  const [reports, setReports] = useState([]);
  const [reportForm, setReportForm] = useState(emptyReportForm);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const userKey = `darkMode_${user?.id || 'guest'}`;
    return localStorage.getItem(userKey) === 'true';
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('notifications') !== 'false';
  });
  const [toast, setToast] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);

  const title = useMemo(() => "Student Dashboard", []);

  // Check if student has already marked attendance for AM/PM sessions today
  const today = new Date().toISOString().split('T')[0];
  const hasMarkedAMToday = attendance.some(record => {
    const recordDate = new Date(record.date).toISOString().split('T')[0];
    return recordDate === today && record.sessionType === 'AM' && record.timeIn;
  });

  const hasMarkedPMToday = attendance.some(record => {
    const recordDate = new Date(record.date).toISOString().split('T')[0];
    return recordDate === today && record.sessionType === 'AM' && record.timeOut;
  });

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

  const refreshStudentProfile = async () => {
    const response = await getStudentProfile();
    setStudentProfile({
      fullName: response.data.fullName || "",
      email: response.data.email || "",
      studentId: response.data.studentId || "",
      profilePicture: response.data.profilePicture || "",
    });

    login({
      token: localStorage.getItem("token"),
      user: {
        fullName: response.data.fullName || user?.fullName,
        role: response.data.role || user?.role,
      },
    });
  };

  const refreshStudentAttendance = async () => {
    const response = await getStudentAttendance();
    setAttendance(response.data.attendance || []);
  };

  const refreshStudentAttendanceSession = async () => {
    try {
      const response = await getActiveSession();

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
      // If session fetch fails, clear local storage
      setAttendanceSession({ am: null, pm: null });
      localStorage.removeItem('studentAttendanceSession');
    }
  };

  const refreshStudentReports = async () => {
    const response = await getStudentReports();
    setReports(response.data.reports || []);
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
          refreshStudentProfile(),
          refreshStudentAttendance(),
          refreshStudentAttendanceSession(),
          refreshNotifications(),
        ]);
      } catch (error) {
        handleRequestError(error);
      }
    };

    bootstrap();
  }, []);

  // Save attendance session to localStorage when it changes
  useEffect(() => {
    if (attendanceSession) {
      localStorage.setItem('studentAttendanceSession', JSON.stringify(attendanceSession));
    } else {
      localStorage.removeItem('studentAttendanceSession');
    }
  }, [attendanceSession]);

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
    if (pageError) {
      const timer = setTimeout(() => {
        setPageError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [pageError]);





  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setStudentProfile((current) => ({ ...current, [name]: value }));
  };

  const handleCancelProfile = () => {
    setProfileFile(null);
    refreshStudentProfile();
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
      const formData = new FormData();
      formData.append("fullName", studentProfile.fullName);
      formData.append("email", studentProfile.email);
      formData.append("studentId", studentProfile.studentId);

      if (profileFile) {
        formData.append("profilePicture", profileFile);
      }

      await updateStudentProfile(formData);
      setProfileFile(null);
      await refreshStudentProfile();
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

  const handleAttendanceMark = async (actionType) => {
    setPageError("");
    setBusyAction(`attendance-${actionType}`);

    try {
      if (actionType === "time-in") {
        await timeInStudent();
      } else if (actionType === "time-out") {
        await timeOutStudent();
      }

      await Promise.all([refreshStudentAttendance(), refreshStudentAttendanceSession()]);

      // Show success message with date and time
      const currentTime = new Date();
      const actionText = actionType === "time-in" ? "AM Time In" : "PM Time Out";
      const successMessage = `${actionText} marked successfully at ${currentTime.toLocaleDateString()} ${currentTime.toLocaleTimeString()}!`;
      setToast && setToast(successMessage, 'success');
    } catch (error) {
      handleRequestError(error);
    } finally {
      setBusyAction("");
    }
  };





  const handleStudentReportChange = (event) => {
    const { name, value, files } = event.target;
    setReportForm((current) => ({
      ...current,
      [name]: files ? files[0] || null : value,
    }));
  };

  const handleCreateReport = async (event) => {
    event.preventDefault();
    setPageError("");
    setBusyAction("report");

    try {
      const formData = new FormData();
      formData.append("title", reportForm.title);
      formData.append("content", reportForm.content);
      const today = new Date().toISOString().split('T')[0];
      formData.append("date", today);
      if (reportForm.reportFile) {
        formData.append("reportFile", reportForm.reportFile);
      }

      await createStudentReport(formData);
      setReportForm(emptyReportForm);
      await refreshStudentReports();
    } catch (error) {
      handleRequestError(error);
    } finally {
      setBusyAction("");
    }
  };

  const handleSubmitReport = async (reportId) => {
    setPageError("");
    setBusyAction(reportId);

    try {
      await submitStudentReport(reportId);
      await refreshStudentReports();
    } catch (error) {
      handleRequestError(error);
    } finally {
      setBusyAction("");
    }
  };

  const handleDeleteReport = (reportId) => {
    setDeleteTarget(reportId);
    setShowDeleteModal(true);
  };

  const confirmDeleteReport = async () => {
    if (!deleteTarget) return;

    setPageError("");
    setBusyAction(deleteTarget);
    setShowDeleteModal(false);

    try {
      await deleteStudentReport(deleteTarget);
      await refreshStudentReports();
    } catch (error) {
      handleRequestError(error);
    } finally {
      setBusyAction("");
      setDeleteTarget(null);
    }
  };

  const cancelDeleteReport = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const showToast = (message, type = 'success', duration = 3000) => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), duration);
  };

  const confirmSaveProfile = () => {
    showToast('Profile changes saved successfully!', 'success');
  };

  const markAsRead = async (id) => {
    try {
      await markNotificationRead(id);
      await refreshNotifications();
    } catch {
      // Silently fail
    }
  };

  const renderStudentProfile = () => (
    <div>
      {!showProfileModal && (
        <div className="panel__header panel__header--split">
          <div>
            <p className="panel__eyebrow">Profile</p>
            <h2>Student Information</h2>
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
        <>
          <div className="profile-preview">
            <div className="profile-preview__avatar">
              {studentProfile.profilePicture ? (
                <img
                  src={`http://localhost:3000${studentProfile.profilePicture}`}
                  alt={studentProfile.fullName || "Student profile"}
                />
              ) : (
                <span className="avatar-placeholder">
                  {window.innerWidth <= 640
                    ? (studentProfile.fullName || "Student")
                    : (studentProfile.fullName || "S").charAt(0).toUpperCase()
                  }
                </span>
              )}
            </div>
            <div className="profile-preview__meta">
              <strong>{studentProfile.fullName || "Student"}</strong>
              <span>{studentProfile.studentId || "No student ID"}</span>
            </div>
          </div>

          <label className="field profile-upload">
            <span className="field__label">Profile Picture</span>
            <input
              className="field__control field__control--file"
              type="file"
              accept="image/*"
              onChange={(event) => setProfileFile(event.target.files?.[0] || null)}
            />
          </label>

          <form className="dashboard-form" onSubmit={handleSaveProfile}>
            <div className="dashboard-form__grid">
              <Input
                label="Full Name"
                name="fullName"
                value={studentProfile.fullName}
                onChange={handleProfileChange}
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={studentProfile.email}
                onChange={handleProfileChange}
              />
              <Input
                label="Student ID"
                name="studentId"
                value={studentProfile.studentId}
                onChange={handleProfileChange}
              />
            </div>

            <div className="panel__actions">
              <Button type="submit" disabled={busyAction === "profile"}>
                {busyAction === "profile" ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </form>
        </>
      ) : (
        <div className="profile-view">
          <div className="profile-view__avatar">
            {studentProfile.profilePicture ? (
              <img
                src={`http://localhost:3000${studentProfile.profilePicture}`}
                alt={studentProfile.fullName || "Student profile"}
              />
            ) : (
              <span className="avatar-placeholder">
                {window.innerWidth <= 640
                  ? (studentProfile.fullName || "Student")
                  : (studentProfile.fullName || "S").charAt(0).toUpperCase()
                }
              </span>
            )}
          </div>
          <div className="profile-view__details">
            <dl>
              <dt>Full Name</dt>
              <dd>{studentProfile.fullName || 'Not set'}</dd>
              <dt>Email</dt>
              <dd>{studentProfile.email || 'Not set'}</dd>
              <dt>Student ID</dt>
              <dd>{studentProfile.studentId || 'Not set'}</dd>
            </dl>
          </div>
        </div>
      )}
    </div>
  );

  const renderStudentAttendance = () => (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="panel__eyebrow">Attendance</p>
          <h2>AM & PM Session Attendance</h2>
        </div>
      </div>

      <div className="attendance-actions">
        <div className="attendance-actions__content">
          <strong>Attendance Status</strong>
          <span>
            {attendanceSession?.am?.hasActiveSession && `AM Session: ${hasMarkedAMToday ? "Marked" : "Active"}`}
            {attendanceSession?.am?.hasActiveSession && attendanceSession?.pm?.hasActiveSession && <br />}
            {attendanceSession?.pm?.hasActiveSession && `PM Session: ${hasMarkedPMToday ? "Marked" : "Active"}`}
          </span>
        </div>

        <div className="attendance-buttons" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            onClick={() => handleAttendanceMark("time-in")}
            disabled={hasMarkedAMToday || busyAction === "attendance-time-in"}
            style={{
              background: '#10b981',
              color: 'white',
              padding: '0.75rem 1rem',
              fontSize: '0.9rem',
              fontWeight: '600',
              borderRadius: '8px',
              border: 'none',
              flex: '1 1 200px',
              maxWidth: '200px',
              opacity: hasMarkedAMToday ? 0.5 : 1
            }}
          >
            {busyAction === "attendance-time-in" ? "Marking AM Time In..." : "AM Time In"}
          </Button>
          <Button
            onClick={() => handleAttendanceMark("time-out")}
            disabled={hasMarkedPMToday || busyAction === "attendance-time-out"}
            style={{
              background: '#f59e0b',
              color: 'white',
              padding: '0.75rem 1rem',
              fontSize: '0.9rem',
              fontWeight: '600',
              borderRadius: '8px',
              border: 'none',
              flex: '1 1 200px',
              maxWidth: '200px',
              opacity: hasMarkedPMToday ? 0.5 : 1
            }}
          >
            {busyAction === "attendance-time-out" ? "Marking PM Time Out..." : "PM Time Out"}
          </Button>
        </div>
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Time In</th>
              <th>Time Out</th>
            </tr>
          </thead>
          <tbody>
            {attendance.length ? (
              attendance.map((record) => (
                <tr key={record._id}>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
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
                <td colSpan="4">No attendance records yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderStudentReports = () => (
    <section className="panel panel--stacked">
      <div className="panel__header">
        <div>
          <p className="panel__eyebrow">Reports</p>
          <h2>Create and Submit Reports</h2>
        </div>
      </div>

      <form className="dashboard-form" onSubmit={handleCreateReport}>
        <div className="dashboard-form__grid">
          <Input
            label="Title"
            name="title"
            value={reportForm.title}
            onChange={handleStudentReportChange}
          />
        </div>

        <label className="field">
          <span className="field__label">Content</span>
          <textarea
            className="field__control field__control--textarea"
            name="content"
            value={reportForm.content}
            onChange={handleStudentReportChange}
            placeholder="Write your report details"
          />
        </label>

        <label className="field">
          <span className="field__label">Report File</span>
          <input
            className="field__control field__control--file"
            type="file"
            name="reportFile"
            accept=".pdf,.doc,.docx"
            onChange={handleStudentReportChange}
          />
        </label>

        <div className="panel__actions">
          <Button type="submit" disabled={busyAction === "report"}>
            {busyAction === "report" ? "Saving..." : "Create Report"}
          </Button>
        </div>
      </form>



      <div className="cards-grid">
        {reports.length ? (
          reports.map((report) => (
            <article key={report._id} className="info-card">
              <div className="info-card__top">
                <h3>{report.title}</h3>
                <div className="card-badges">
                  <span className={`status-pill status-pill--${report.status}`}>{report.status}</span>
                  {report.grade && <span className="grade-badge">Grade: {report.grade}/10</span>}
                </div>
              </div>
              <p>{report.content || "No content added."}</p>
              <small>{new Date(report.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</small>
              <div className="panel__actions">
                {report.status !== "submitted" ? (
                  <>
                    <Button
                      onClick={() => handleSubmitReport(report._id)}
                      disabled={busyAction === report._id}
                    >
                      {busyAction === report._id ? "Submitting..." : "Submit"}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleDeleteReport(report._id)}
                      disabled={busyAction === report._id}
                      style={{ background: '#dc2626', color: 'white' }}
                    >
                      {busyAction === report._id ? "Deleting..." : "Delete"}
                    </Button>
                  </>
                ) : null}
              </div>
            </article>
          ))
        ) : (
          <p className="empty-state">No reports yet.</p>
        )}
      </div>
    </section>
  );

  const renderStudentDashboard = () => {
    const totalAbsent = attendance.filter(r => r.status === "absent").length;
    const totalReports = reports.length;
    const totalHours = attendance.reduce((sum, r) => {
      if (r.timeIn && r.timeOut) {
        const hours = (new Date(r.timeOut) - new Date(r.timeIn)) / (1000 * 60 * 60);
        return sum + hours;
      }
      return sum;
    }, 0).toFixed(1);
    const totalDays = attendance.length;
    const presentDays = attendance.filter(r => r.status === "present").length;
    const attendanceRate = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

    return (
      <section className="panel">
        <div className="panel__header">
          <div>
            <h2>{user?.fullName || "Student"}</h2>
          </div>
        </div>

        <div className="metrics-grid">
          <div className="metric-card">
            <strong>{totalAbsent}</strong>
            <span>Total Absent</span>
          </div>
          <div className="metric-card">
            <strong>{totalReports}</strong>
            <span>Total Reports</span>
          </div>
          <div className="metric-card">
            <strong>{totalHours} hrs</strong>
            <span>Total Hours</span>
          </div>
          <div className="metric-card">
            <strong>{attendanceRate}%</strong>
            <span>Attendance Rate</span>
          </div>
        </div>

        <div className="progress-section">
          <h3>Attendance Progress</h3>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${attendanceRate}%` }}
            ></div>
          </div>
          <p>{presentDays} out of {totalDays} days present</p>
        </div>

        <div className="graph-section">
          <h3>Attendance Rate Trend</h3>
          <svg className="attendance-graph" viewBox="0 0 300 150" width="100%" height="200">
            {(() => {
              const sortedAttendance = attendance.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-10);
              const points = [];
              let total = 0;
              let present = 0;
              sortedAttendance.forEach((record, index) => {
                if (record.status === "present" || record.status === "late") present++;
                total++;
                const rate = total > 0 ? (present / total) * 100 : 0;
                const x = (index / (sortedAttendance.length - 1)) * 260 + 20;
                const y = 120 - (rate / 100) * 100;
                points.push(`${x},${y}`);
              });
              return (
                <g>
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    points={points.join(' ')}
                  />
                  {points.map((point, index) => {
                    const [x, y] = point.split(',');
                    return (
                      <circle
                        key={index}
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#10b981"
                      />
                    );
                  })}
                  <line x1="20" y1="20" x2="20" y2="120" stroke="#374151" strokeWidth="1" />
                  <line x1="20" y1="120" x2="280" y2="120" stroke="#374151" strokeWidth="1" />
                  <text x="10" y="15" textAnchor="middle" fontSize="10" fill="#6b7280">100%</text>
                  <text x="10" y="70" textAnchor="middle" fontSize="10" fill="#6b7280">50%</text>
                  <text x="10" y="125" textAnchor="middle" fontSize="10" fill="#6b7280">0%</text>
                  <text x="150" y="140" textAnchor="middle" fontSize="12" fill="#6b7280">Last 10 Days</text>
                </g>
              );
            })()}
          </svg>
        </div>

        <div className="graph-section">
          <h3>Reports Per Day</h3>
          <svg className="reports-graph" viewBox="0 0 300 150" width="100%" height="200">
            {(() => {
              const reportsByDate = reports.reduce((acc, report) => {
                const date = new Date(report.date).toDateString();
                acc[date] = (acc[date] || 0) + 1;
                return acc;
              }, {});
              const dates = Object.keys(reportsByDate).sort((a, b) => new Date(a) - new Date(b)).slice(-7);
              return dates.map((date, index) => {
                const count = reportsByDate[date];
                const height = count * 20; // Scale height
                const x = index * 35 + 20;
                return (
                  <g key={date}>
                    <rect
                      x={x}
                      y={120 - height}
                      width="20"
                      height={height}
                      fill="#3b82f6"
                    />
                    <text x={x + 10} y={115 - height} textAnchor="middle" fontSize="10" fill="#1f2937">
                      {count}
                    </text>
                  </g>
                );
              });
            })()}
            <line x1="0" y1="120" x2="300" y2="120" stroke="#374151" strokeWidth="1" />
            <text x="150" y="140" textAnchor="middle" fontSize="12" fill="#6b7280">Last 7 Days</text>
          </svg>
        </div>
      </section>
    );
  };

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
          <h3>Welcome to Your Learning Journey</h3>
          <p>A comprehensive platform designed to streamline student work immersion experiences, foster professional development, and maintain effective teacher-student collaboration.</p>
        </div>

        <div className="about-features-grid">
          <div className="feature-card">
            <h4>Dashboard Overview</h4>
            <p>Track your attendance progress, total reports, and work hours with interactive visualizations and real-time analytics.</p>
          </div>

          <div className="feature-card">
            <h4>Smart Attendance</h4>
            <p>Seamless time-in and time-out tracking with automated session management and instant status updates.</p>
          </div>

          <div className="feature-card">
            <h4>Report Management</h4>
            <p>Create, edit, and submit detailed reports with file attachments for comprehensive teacher evaluation.</p>
          </div>

          <div className="feature-card">
            <h4>Profile Center</h4>
            <p>Manage your personal information, update credentials, and customize your learning profile.</p>
          </div>

          <div className="feature-card">
            <h4>Smart Settings</h4>
            <p>Personalize your experience with dark mode, notification preferences, and accessibility options.</p>
          </div>

          <div className="feature-card">
            <h4>Live Sync</h4>
            <p>Real-time data synchronization with instant notifications and collaborative updates.</p>
          </div>
        </div>

        <div className="about-benefits">
          <h3>Why Choose Our System?</h3>
          <div className="benefits-grid">
            <div className="benefit-item">
              <span className="benefit-check">✓</span>
              <span>Efficient attendance management</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-check">✓</span>
              <span>Comprehensive reporting system</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-check">✓</span>
              <span>Intuitive user interface</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-check">✓</span>
              <span>Secure data handling</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-check">✓</span>
              <span>Mobile-responsive design</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-check">✓</span>
              <span>Real-time collaboration</span>
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
            <div className="stat-label">Secure & Private</div>
          </div>
        </div>
      </div>
    </section>
  );

  const renderStudentSettings = () => (
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
    if (activeSection === "dashboard") return renderStudentDashboard();
    if (activeSection === "attendance") return renderStudentAttendance();
    if (activeSection === "reports") return renderStudentReports();
    if (activeSection === "about") return renderAbout();
    if (activeSection === "settings") return renderStudentSettings();
    return renderStudentDashboard();
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
            {studentProfile.profilePicture ? (
              <img
                src={`http://localhost:3000${studentProfile.profilePicture}`}
                alt="Profile"
              />
            ) : (
              <span>{(studentProfile.fullName || "S").charAt(0).toUpperCase()}</span>
            )}
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
              {renderStudentProfile()}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="delete-modal" onClick={cancelDeleteReport}>
          <div className="delete-modal__content" onClick={(e) => e.stopPropagation()}>
            <h3 className="delete-modal__title">Delete Report</h3>
            <p className="delete-modal__message">
              Are you sure you want to delete this report? This action cannot be undone.
            </p>
            <div className="delete-modal__actions">
              <button
                type="button"
                className="delete-modal__cancel"
                onClick={cancelDeleteReport}
              >
                Cancel
              </button>
              <button
                type="button"
                className="delete-modal__confirm"
                onClick={confirmDeleteReport}
                disabled={busyAction === deleteTarget}
              >
                {busyAction === deleteTarget ? "Deleting..." : "Delete"}
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

export default StudentDashboard;