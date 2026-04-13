import { useEffect, useState } from "react";
import Button from "../../components/common/Button.jsx";
import { getAttendanceReports, getAttendanceSummary, getAllStudents, getAllTeachers } from "../../services/api";

const AttendanceReports = () => {
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    studentId: "",
    teacherId: ""
  });
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    fetchStudentsAndTeachers();
  }, []);

  const fetchStudentsAndTeachers = async () => {
    try {
      const [studentsRes, teachersRes] = await Promise.all([
        getAllStudents(),
        getAllTeachers()
      ]);
      setStudents(studentsRes.data);
      setTeachers(teachersRes.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.studentId) params.studentId = filters.studentId;
      if (filters.teacherId) params.teacherId = filters.teacherId;

      const [reportsRes, summaryRes] = await Promise.all([
        getAttendanceReports(params),
        getAttendanceSummary(params)
      ]);

      setReports(reportsRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error("Error fetching attendance reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (attendance) => {
    if (!attendance.timeIn) return '#ef4444'; // red for absent

    const sessionStart = new Date(attendance.session?.startTime || attendance.createdAt);
    const timeIn = new Date(attendance.timeIn);
    const diffMinutes = (timeIn - sessionStart) / (1000 * 60);

    if (diffMinutes <= 15) return '#10b981'; // green for on time
    return '#f59e0b'; // yellow for late
  };

  const getStatusText = (attendance) => {
    if (!attendance.timeIn) return 'Absent';

    const sessionStart = new Date(attendance.session?.startTime || attendance.createdAt);
    const timeIn = new Date(attendance.timeIn);
    const diffMinutes = (timeIn - sessionStart) / (1000 * 60);

    if (diffMinutes <= 15) return 'Present (On Time)';
    return `Present (Late: ${Math.round(diffMinutes)} min)`;
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* Header */}
      <header style={{
        backgroundColor: "#58111f",
        color: "white",
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <h1 style={{ margin: 0 }}>Attendance Reports</h1>
          <p style={{ margin: "0.25rem 0 0 0", opacity: 0.9 }}>
            View and analyze attendance data
          </p>
        </div>
        <Button
          onClick={() => window.history.back()}
          style={{
            backgroundColor: "transparent",
            border: "1px solid white",
            color: "white"
          }}
        >
          ← Back to Dashboard
        </Button>
      </header>

      {/* Filters */}
      <div style={{ padding: "1rem 2rem", backgroundColor: "white", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.25rem" }}>
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              style={{
                padding: "0.5rem",
                border: "1px solid #d1d5db",
                borderRadius: "4px"
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.25rem" }}>
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              style={{
                padding: "0.5rem",
                border: "1px solid #d1d5db",
                borderRadius: "4px"
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.25rem" }}>
              Student
            </label>
            <select
              name="studentId"
              value={filters.studentId}
              onChange={handleFilterChange}
              style={{
                padding: "0.5rem",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                minWidth: "150px"
              }}
            >
              <option value="">All Students</option>
              {students.map(student => (
                <option key={student._id} value={student._id}>
                  {student.fullName} ({student.studentId})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.25rem" }}>
              Teacher
            </label>
            <select
              name="teacherId"
              value={filters.teacherId}
              onChange={handleFilterChange}
              style={{
                padding: "0.5rem",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                minWidth: "150px"
              }}
            >
              <option value="">All Teachers</option>
              {teachers.map(teacher => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.fullName} ({teacher.teacherId})
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={fetchReports}
            disabled={loading}
            style={{ marginTop: "1.75rem" }}
          >
            {loading ? "Loading..." : "Generate Report"}
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div style={{ padding: "1rem 2rem" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem"
          }}>
            <div style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "1rem",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              textAlign: "center"
            }}>
              <h3 style={{ margin: "0 0 0.5rem 0", color: "#58111f" }}>Total Records</h3>
              <p style={{ fontSize: "2rem", fontWeight: "bold", margin: 0 }}>{summary.totalRecords}</p>
            </div>
            <div style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "1rem",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              textAlign: "center"
            }}>
              <h3 style={{ margin: "0 0 0.5rem 0", color: "#10b981" }}>Present</h3>
              <p style={{ fontSize: "2rem", fontWeight: "bold", margin: 0 }}>{summary.presentCount}</p>
            </div>
            <div style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "1rem",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              textAlign: "center"
            }}>
              <h3 style={{ margin: "0 0 0.5rem 0", color: "#ef4444" }}>Absent</h3>
              <p style={{ fontSize: "2rem", fontWeight: "bold", margin: 0 }}>{summary.absentCount}</p>
            </div>
            <div style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "1rem",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              textAlign: "center"
            }}>
              <h3 style={{ margin: "0 0 0.5rem 0", color: "#f59e0b" }}>Late</h3>
              <p style={{ fontSize: "2rem", fontWeight: "bold", margin: 0 }}>{summary.lateCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Reports Table */}
      <div style={{ padding: "0 2rem 2rem 2rem" }}>
        <div style={{
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          overflow: "hidden"
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Student</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Date</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Session</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Time In</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Time Out</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Status</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Teacher</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(report => (
                <tr key={report._id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "1rem" }}>
                    <div>
                      <div style={{ fontWeight: "500" }}>{report.student?.fullName}</div>
                      <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                        ID: {report.student?.studentId}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "1rem" }}>{formatDate(report.date)}</td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{
                      backgroundColor: report.session?.type === 'AM' ? '#dbeafe' : '#fef3c7',
                      color: report.session?.type === 'AM' ? '#1e40af' : '#92400e',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      {report.session?.type || 'N/A'}
                    </span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {report.timeIn ? formatTime(report.timeIn) : '-'}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {report.timeOut ? formatTime(report.timeOut) : '-'}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{
                      color: getStatusColor(report),
                      fontWeight: '500'
                    }}>
                      {getStatusText(report)}
                    </span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div>
                      <div style={{ fontWeight: "500" }}>{report.session?.createdBy?.fullName}</div>
                      <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                        ID: {report.session?.createdBy?.teacherId}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reports.length === 0 && !loading && (
            <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
              No attendance records found. Use the filters above to generate a report.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceReports;