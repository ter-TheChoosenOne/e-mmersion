import { useState } from "react";
import Button from "../../components/common/Button.jsx";

const SystemConfiguration = () => {
  const [settings, setSettings] = useState({
    systemName: "Work Immersion Monitoring System",
    maxStudentsPerTeacher: 50,
    attendanceTimeoutHours: 4,
    emailNotifications: true,
    autoApproveTeachers: true,
    maintenanceMode: false
  });

  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    alert("Settings saved successfully!");
  };

  const handleReset = () => {
    // TODO: Implement reset functionality
    alert("Settings reset to defaults!");
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
          <h1 style={{ margin: 0 }}>System Configuration</h1>
          <p style={{ margin: "0.25rem 0 0 0", opacity: 0.9 }}>
            Configure system-wide settings
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

      {/* Settings Form */}
      <div style={{ padding: "2rem" }}>
        <div style={{
          maxWidth: "800px",
          margin: "0 auto",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          padding: "2rem"
        }}>
          <h2 style={{ marginTop: 0, color: "#58111f", borderBottom: "2px solid #e5e7eb", paddingBottom: "1rem" }}>
            General Settings
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* System Name */}
            <div>
              <label style={{ display: "block", fontSize: "1rem", fontWeight: "500", marginBottom: "0.5rem" }}>
                System Name
              </label>
              <input
                type="text"
                name="systemName"
                value={settings.systemName}
                onChange={handleSettingChange}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "1rem"
                }}
              />
              <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: "0.25rem 0 0 0" }}>
                The name displayed throughout the application
              </p>
            </div>

            {/* Max Students per Teacher */}
            <div>
              <label style={{ display: "block", fontSize: "1rem", fontWeight: "500", marginBottom: "0.5rem" }}>
                Maximum Students per Teacher
              </label>
              <input
                type="number"
                name="maxStudentsPerTeacher"
                value={settings.maxStudentsPerTeacher}
                onChange={handleSettingChange}
                min="1"
                max="200"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "1rem"
                }}
              />
              <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: "0.25rem 0 0 0" }}>
                Maximum number of students that can be assigned to a single teacher
              </p>
            </div>

            {/* Attendance Timeout */}
            <div>
              <label style={{ display: "block", fontSize: "1rem", fontWeight: "500", marginBottom: "0.5rem" }}>
                Attendance Session Timeout (Hours)
              </label>
              <input
                type="number"
                name="attendanceTimeoutHours"
                value={settings.attendanceTimeoutHours}
                onChange={handleSettingChange}
                min="1"
                max="12"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "1rem"
                }}
              />
              <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: "0.25rem 0 0 0" }}>
                How long attendance sessions remain active before auto-closing
              </p>
            </div>
          </div>

          <h2 style={{
            marginTop: "2rem",
            color: "#58111f",
            borderBottom: "2px solid #e5e7eb",
            paddingBottom: "1rem",
            marginBottom: "1.5rem"
          }}>
            Notification Settings
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Email Notifications */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <input
                type="checkbox"
                name="emailNotifications"
                checked={settings.emailNotifications}
                onChange={handleSettingChange}
                style={{ width: "1.25rem", height: "1.25rem" }}
              />
              <div>
                <label style={{ fontSize: "1rem", fontWeight: "500" }}>
                  Enable Email Notifications
                </label>
                <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: "0.25rem 0 0 0" }}>
                  Send email notifications for important system events
                </p>
              </div>
            </div>

            {/* Auto Approve Teachers */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <input
                type="checkbox"
                name="autoApproveTeachers"
                checked={settings.autoApproveTeachers}
                onChange={handleSettingChange}
                style={{ width: "1.25rem", height: "1.25rem" }}
              />
              <div>
                <label style={{ fontSize: "1rem", fontWeight: "500" }}>
                  Auto-Approve Teacher Registrations
                </label>
                <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: "0.25rem 0 0 0" }}>
                  Automatically approve new teacher registrations without manual review
                </p>
              </div>
            </div>

            {/* Maintenance Mode */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <input
                type="checkbox"
                name="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={handleSettingChange}
                style={{ width: "1.25rem", height: "1.25rem" }}
              />
              <div>
                <label style={{ fontSize: "1rem", fontWeight: "500" }}>
                  Maintenance Mode
                </label>
                <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: "0.25rem 0 0 0" }}>
                  Put the system in maintenance mode (students and teachers cannot access)
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            marginTop: "3rem",
            paddingTop: "2rem",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            gap: "1rem",
            justifyContent: "flex-end"
          }}>
            <Button
              onClick={handleReset}
              style={{
                backgroundColor: "#6b7280",
                border: "none"
              }}
            >
              Reset to Defaults
            </Button>
            <Button onClick={handleSave}>
              Save Configuration
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemConfiguration;