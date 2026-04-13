import { useEffect, useState } from "react";
import Button from "../../components/common/Button.jsx";
import { getAllUsers, getAllStudents, getAllTeachers } from "../../services/api";

const UserStatistics = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalAdmins: 0,
    approvedStudents: 0,
    pendingStudents: 0,
    approvedTeachers: 0,
    pendingTeachers: 0,
    recentUsers: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, studentsRes, teachersRes] = await Promise.all([
        getAllUsers(),
        getAllStudents(),
        getAllTeachers()
      ]);

      const users = usersRes.data;
      const students = studentsRes.data;
      const teachers = teachersRes.data;

      const approvedStudents = students.filter(s => s.status === 'approved').length;
      const pendingStudents = students.filter(s => s.status === 'pending').length;
      const approvedTeachers = teachers.filter(t => t.status === 'approved').length;
      const pendingTeachers = teachers.filter(t => t.status === 'pending').length;
      const admins = users.filter(u => u.role === 'admin').length;

      // Get recent users (last 10)
      const recentUsers = users
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);

      setStats({
        totalUsers: users.length,
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalAdmins: admins,
        approvedStudents,
        pendingStudents,
        approvedTeachers,
        pendingTeachers,
        recentUsers
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading statistics...</div>;
  }

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
          <h1 style={{ margin: 0 }}>User Statistics</h1>
          <p style={{ margin: "0.25rem 0 0 0", opacity: 0.9 }}>
            System analytics and user insights
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

      {/* Stats Cards */}
      <div style={{ padding: "2rem" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem"
        }}>
          {/* Total Users */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "1.5rem",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            borderLeft: "4px solid #58111f"
          }}>
            <h3 style={{ margin: "0 0 0.5rem 0", color: "#58111f" }}>Total Users</h3>
            <p style={{ fontSize: "2rem", fontWeight: "bold", margin: 0 }}>{stats.totalUsers}</p>
          </div>

          {/* Students */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "1.5rem",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            borderLeft: "4px solid #3b82f6"
          }}>
            <h3 style={{ margin: "0 0 0.5rem 0", color: "#3b82f6" }}>Students</h3>
            <p style={{ fontSize: "2rem", fontWeight: "bold", margin: 0 }}>{stats.totalStudents}</p>
            <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: "0.5rem 0 0 0" }}>
              {stats.approvedStudents} approved, {stats.pendingStudents} pending
            </p>
          </div>

          {/* Teachers */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "1.5rem",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            borderLeft: "4px solid #059669"
          }}>
            <h3 style={{ margin: "0 0 0.5rem 0", color: "#059669" }}>Teachers</h3>
            <p style={{ fontSize: "2rem", fontWeight: "bold", margin: 0 }}>{stats.totalTeachers}</p>
            <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: "0.5rem 0 0 0" }}>
              {stats.approvedTeachers} approved, {stats.pendingTeachers} pending
            </p>
          </div>

          {/* Admins */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "1.5rem",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            borderLeft: "4px solid #7c3aed"
          }}>
            <h3 style={{ margin: "0 0 0.5rem 0", color: "#7c3aed" }}>Administrators</h3>
            <p style={{ fontSize: "2rem", fontWeight: "bold", margin: 0 }}>{stats.totalAdmins}</p>
          </div>
        </div>

        {/* Charts/Graphs Placeholder */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem"
        }}>
          {/* User Distribution Chart */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "1.5rem",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ margin: "0 0 1rem 0", color: "#58111f" }}>User Distribution</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Students</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{
                    width: "200px",
                    height: "8px",
                    backgroundColor: "#e5e7eb",
                    borderRadius: "4px"
                  }}>
                    <div style={{
                      width: `${stats.totalUsers > 0 ? (stats.totalStudents / stats.totalUsers) * 100 : 0}%`,
                      height: "100%",
                      backgroundColor: "#3b82f6",
                      borderRadius: "4px"
                    }}></div>
                  </div>
                  <span style={{ fontWeight: "500", minWidth: "40px" }}>{stats.totalStudents}</span>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Teachers</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{
                    width: "200px",
                    height: "8px",
                    backgroundColor: "#e5e7eb",
                    borderRadius: "4px"
                  }}>
                    <div style={{
                      width: `${stats.totalUsers > 0 ? (stats.totalTeachers / stats.totalUsers) * 100 : 0}%`,
                      height: "100%",
                      backgroundColor: "#059669",
                      borderRadius: "4px"
                    }}></div>
                  </div>
                  <span style={{ fontWeight: "500", minWidth: "40px" }}>{stats.totalTeachers}</span>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Administrators</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{
                    width: "200px",
                    height: "8px",
                    backgroundColor: "#e5e7eb",
                    borderRadius: "4px"
                  }}>
                    <div style={{
                      width: `${stats.totalUsers > 0 ? (stats.totalAdmins / stats.totalUsers) * 100 : 0}%`,
                      height: "100%",
                      backgroundColor: "#7c3aed",
                      borderRadius: "4px"
                    }}></div>
                  </div>
                  <span style={{ fontWeight: "500", minWidth: "40px" }}>{stats.totalAdmins}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Overview */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "1.5rem",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ margin: "0 0 1rem 0", color: "#58111f" }}>Account Status Overview</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span>Students Approved</span>
                  <span>{stats.approvedStudents} / {stats.totalStudents}</span>
                </div>
                <div style={{
                  width: "100%",
                  height: "8px",
                  backgroundColor: "#e5e7eb",
                  borderRadius: "4px"
                }}>
                  <div style={{
                    width: `${stats.totalStudents > 0 ? (stats.approvedStudents / stats.totalStudents) * 100 : 0}%`,
                    height: "100%",
                    backgroundColor: "#10b981",
                    borderRadius: "4px"
                  }}></div>
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span>Teachers Approved</span>
                  <span>{stats.approvedTeachers} / {stats.totalTeachers}</span>
                </div>
                <div style={{
                  width: "100%",
                  height: "8px",
                  backgroundColor: "#e5e7eb",
                  borderRadius: "4px"
                }}>
                  <div style={{
                    width: `${stats.totalTeachers > 0 ? (stats.approvedTeachers / stats.totalTeachers) * 100 : 0}%`,
                    height: "100%",
                    backgroundColor: "#10b981",
                    borderRadius: "4px"
                  }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "1.5rem",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{ margin: "0 0 1rem 0", color: "#58111f" }}>Recent Registrations</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600" }}>Name</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600" }}>Email</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600" }}>Role</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600" }}>Status</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600" }}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentUsers.map(user => (
                  <tr key={user._id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "0.75rem" }}>{user.fullName}</td>
                    <td style={{ padding: "0.75rem" }}>{user.email}</td>
                    <td style={{ padding: "0.75rem" }}>
                      <span style={{
                        backgroundColor: user.role === 'admin' ? '#58111f' :
                                       user.role === 'teacher' ? '#059669' : '#3b82f6',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <span style={{
                        color: user.status === 'approved' ? '#10b981' :
                               user.status === 'pending' ? '#f59e0b' : '#ef4444',
                        fontWeight: '500'
                      }}>
                        {user.status}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem", fontSize: "0.875rem", color: "#6b7280" }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStatistics;