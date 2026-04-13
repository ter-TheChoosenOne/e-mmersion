
import Button from "../../components/common/Button.jsx";

const AccessLogs = () => {

  // Mock data for demonstration
  const logs = [
    { id: 1, user: "John Doe (Student)", action: "Login", timestamp: "2024-01-15 09:30:00", ip: "192.168.1.100", status: "Success" },
    { id: 2, user: "Jane Smith (Teacher)", action: "Start Attendance", timestamp: "2024-01-15 08:45:00", ip: "192.168.1.101", status: "Success" },
    { id: 3, user: "Bob Admin", action: "Delete User", timestamp: "2024-01-15 10:15:00", ip: "192.168.1.102", status: "Success" },
    { id: 4, user: "Alice Student", action: "Failed Login", timestamp: "2024-01-15 11:20:00", ip: "192.168.1.103", status: "Failed" },
    { id: 5, user: "Mike Teacher", action: "Update Profile", timestamp: "2024-01-15 14:30:00", ip: "192.168.1.104", status: "Success" },
  ];

  const getStatusColor = (status) => {
    return status === 'Success' ? '#10b981' : '#ef4444';
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
          <h1 style={{ margin: 0 }}>Access Logs</h1>
          <p style={{ margin: "0.25rem 0 0 0", opacity: 0.9 }}>
            Monitor system access and security events
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
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <input
            type="date"
            style={{
              padding: "0.5rem",
              border: "1px solid #d1d5db",
              borderRadius: "4px"
            }}
          />
          <select style={{
            padding: "0.5rem",
            border: "1px solid #d1d5db",
            borderRadius: "4px"
          }}>
            <option>All Actions</option>
            <option>Login</option>
            <option>Logout</option>
            <option>Update Profile</option>
            <option>Delete User</option>
          </select>
          <select style={{
            padding: "0.5rem",
            border: "1px solid #d1d5db",
            borderRadius: "4px"
          }}>
            <option>All Status</option>
            <option>Success</option>
            <option>Failed</option>
          </select>
          <Button>Filter Logs</Button>
          <Button style={{ backgroundColor: "#059669", border: "none" }}>Export Logs</Button>
        </div>
      </div>

      {/* Logs Table */}
      <div style={{ padding: "2rem" }}>
        <div style={{
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          overflow: "hidden"
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>User</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Action</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Timestamp</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>IP Address</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "1rem" }}>{log.user}</td>
                  <td style={{ padding: "1rem" }}>{log.action}</td>
                  <td style={{ padding: "1rem", fontSize: "0.875rem", color: "#6b7280" }}>{log.timestamp}</td>
                  <td style={{ padding: "1rem", fontSize: "0.875rem", color: "#6b7280" }}>{log.ip}</td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{
                      color: getStatusColor(log.status),
                      fontWeight: '500'
                    }}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccessLogs;
