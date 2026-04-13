import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Button from "../components/common/Button";

const AdminDashboard = () => {
  const { adminUser, adminLogout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    adminLogout();
    navigate("/admin/login");
  };

  const handleNavigation = (path) => {
    navigate(path);
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
          <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
          <p style={{ margin: "0.25rem 0 0 0", opacity: 0.9 }}>
            Welcome, {adminUser?.fullName}
          </p>
        </div>
        <Button
          onClick={handleLogout}
          style={{
            backgroundColor: "transparent",
            border: "1px solid white",
            color: "white"
          }}
        >
          Logout
        </Button>
      </header>

      {/* Main Content */}
      <main style={{ padding: "2rem" }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem"
        }}>
          {/* User Management Card */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "2rem",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
          }}>
            <h2 style={{ marginTop: 0, color: "#58111f" }}>User Management</h2>
            <p>Manage students, teachers, and their accounts</p>
            <div style={{ marginTop: "1rem" }}>
              <Button
                onClick={() => handleNavigation('/admin/users')}
                style={{ marginRight: "0.5rem", marginBottom: "0.5rem" }}
              >
                View All Users
              </Button>
              <Button
                onClick={() => handleNavigation('/admin/students')}
                style={{ marginRight: "0.5rem", marginBottom: "0.5rem" }}
              >
                Manage Students
              </Button>
              <Button
                onClick={() => handleNavigation('/admin/teachers')}
                style={{ marginBottom: "0.5rem" }}
              >
                Manage Teachers
              </Button>
            </div>
          </div>

          {/* System Settings Card */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "2rem",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
          }}>
            <h2 style={{ marginTop: 0, color: "#58111f" }}>System Settings</h2>
            <p>Configure system-wide settings and preferences</p>
            <div style={{ marginTop: "1rem" }}>
              <Button
                onClick={() => handleNavigation('/admin/config')}
                style={{ marginRight: "0.5rem", marginBottom: "0.5rem" }}
              >
                System Configuration
              </Button>
              <Button
                onClick={() => handleNavigation('/admin/backup')}
                style={{ marginBottom: "0.5rem" }}
              >
                Backup & Restore
              </Button>
            </div>
          </div>

          {/* Reports & Analytics Card */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "2rem",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
          }}>
            <h2 style={{ marginTop: 0, color: "#58111f" }}>Reports & Analytics</h2>
            <p>View system reports and analytics</p>
            <div style={{ marginTop: "1rem" }}>
              <Button
                onClick={() => handleNavigation('/admin/statistics')}
                style={{ marginRight: "0.5rem", marginBottom: "0.5rem" }}
              >
                User Statistics
              </Button>
              <Button
                onClick={() => handleNavigation('/admin/attendance-reports')}
                style={{ marginBottom: "0.5rem" }}
              >
                Attendance Reports
              </Button>
            </div>
          </div>

          {/* Security Card */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "2rem",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
          }}>
            <h2 style={{ marginTop: 0, color: "#58111f" }}>Security</h2>
            <p>Manage security settings and access controls</p>
            <div style={{ marginTop: "1rem" }}>
              <Button
                onClick={() => handleNavigation('/admin/logs')}
                style={{ marginRight: "0.5rem", marginBottom: "0.5rem" }}
              >
                Access Logs
              </Button>
              <Button
                onClick={() => handleNavigation('/admin/security')}
                style={{ marginBottom: "0.5rem" }}
              >
                Security Settings
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;