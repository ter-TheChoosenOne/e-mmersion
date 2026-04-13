import { useState } from "react";
import Button from "../../components/common/Button.jsx";

const SecuritySettings = () => {
  const [settings, setSettings] = useState({
    passwordMinLength: 6,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    twoFactorAuth: false,
    ipWhitelist: false,
    auditLogging: true
  });

  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    alert("Security settings saved successfully!");
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
          <h1 style={{ margin: 0 }}>Security Settings</h1>
          <p style={{ margin: "0.25rem 0 0 0", opacity: 0.9 }}>
            Configure system security policies
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
            Password Policy
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "1rem", fontWeight: "500", marginBottom: "0.5rem" }}>
                Minimum Password Length
              </label>
              <input
                type="number"
                name="passwordMinLength"
                value={settings.passwordMinLength}
                onChange={handleSettingChange}
                min="6"
                max="32"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "1rem"
                }}
              />
            </div>
          </div>

          <h2 style={{
            marginTop: "2rem",
            color: "#58111f",
            borderBottom: "2px solid #e5e7eb",
            paddingBottom: "1rem",
            marginBottom: "1.5rem"
          }}>
            Session Management
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "1rem", fontWeight: "500", marginBottom: "0.5rem" }}>
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                name="sessionTimeout"
                value={settings.sessionTimeout}
                onChange={handleSettingChange}
                min="15"
                max="480"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "1rem"
                }}
              />
              <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: "0.25rem 0 0 0" }}>
                Users will be automatically logged out after this period of inactivity
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
            Account Lockout
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "1rem", fontWeight: "500", marginBottom: "0.5rem" }}>
                Maximum Login Attempts
              </label>
              <input
                type="number"
                name="maxLoginAttempts"
                value={settings.maxLoginAttempts}
                onChange={handleSettingChange}
                min="3"
                max="10"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "1rem"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "1rem", fontWeight: "500", marginBottom: "0.5rem" }}>
                Lockout Duration (minutes)
              </label>
              <input
                type="number"
                name="lockoutDuration"
                value={settings.lockoutDuration}
                onChange={handleSettingChange}
                min="5"
                max="1440"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "1rem"
                }}
              />
              <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: "0.25rem 0 0 0" }}>
                Account will be locked after failed login attempts
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
            Advanced Security
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <input
                type="checkbox"
                name="twoFactorAuth"
                checked={settings.twoFactorAuth}
                onChange={handleSettingChange}
                style={{ width: "1.25rem", height: "1.25rem" }}
              />
              <div>
                <label style={{ fontSize: "1rem", fontWeight: "500" }}>
                  Require Two-Factor Authentication
                </label>
                <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: "0.25rem 0 0 0" }}>
                  Users must provide a second form of authentication
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <input
                type="checkbox"
                name="ipWhitelist"
                checked={settings.ipWhitelist}
                onChange={handleSettingChange}
                style={{ width: "1.25rem", height: "1.25rem" }}
              />
              <div>
                <label style={{ fontSize: "1rem", fontWeight: "500" }}>
                  Enable IP Whitelisting
                </label>
                <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: "0.25rem 0 0 0" }}>
                  Only allow access from specified IP addresses
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <input
                type="checkbox"
                name="auditLogging"
                checked={settings.auditLogging}
                onChange={handleSettingChange}
                style={{ width: "1.25rem", height: "1.25rem" }}
              />
              <div>
                <label style={{ fontSize: "1rem", fontWeight: "500" }}>
                  Enable Audit Logging
                </label>
                <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: "0.25rem 0 0 0" }}>
                  Log all administrative actions for compliance
                </p>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: "3rem",
            paddingTop: "2rem",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            gap: "1rem",
            justifyContent: "flex-end"
          }}>
            <Button onClick={handleSave}>
              Save Security Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
