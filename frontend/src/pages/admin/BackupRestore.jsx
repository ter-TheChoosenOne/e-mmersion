import { useState } from "react";
import Button from "../../components/common/Button.jsx";

const BackupRestore = () => {
  const [backups, setBackups] = useState([
    { id: 1, name: "Daily Backup 2024-01-15", size: "2.3 MB", date: "2024-01-15 02:00:00", type: "Automatic" },
    { id: 2, name: "Weekly Backup 2024-01-08", size: "5.7 MB", date: "2024-01-08 02:00:00", type: "Automatic" },
    { id: 3, name: "Manual Backup Pre-Update", size: "4.1 MB", date: "2024-01-10 14:30:00", type: "Manual" },
  ]);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    // Simulate backup creation
    setTimeout(() => {
      alert("Backup created successfully!");
      setIsCreatingBackup(false);
      // Add new backup to list
      const newBackup = {
        id: Date.now(),
        name: `Manual Backup ${new Date().toISOString().split('T')[0]}`,
        size: "3.2 MB",
        date: new Date().toLocaleString(),
        type: "Manual"
      };
      setBackups(prev => [newBackup, ...prev]);
    }, 3000);
  };

  const handleDownloadBackup = (backup) => {
    alert(`Downloading backup: ${backup.name}`);
    // TODO: Implement actual download
  };

  const handleRestoreBackup = (backup) => {
    if (window.confirm(`Are you sure you want to restore from backup: ${backup.name}? This will overwrite current data.`)) {
      alert(`Restoring from backup: ${backup.name}`);
      // TODO: Implement actual restore
    }
  };

  const handleDeleteBackup = (backupId) => {
    if (window.confirm("Are you sure you want to delete this backup?")) {
      setBackups(prev => prev.filter(backup => backup.id !== backupId));
    }
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
          <h1 style={{ margin: 0 }}>Backup & Restore</h1>
          <p style={{ margin: "0.25rem 0 0 0", opacity: 0.9 }}>
            Manage system backups and data restoration
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

      {/* Backup Controls */}
      <div style={{ padding: "2rem" }}>
        <div style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "2rem",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          marginBottom: "2rem"
        }}>
          <h2 style={{ marginTop: 0, color: "#58111f" }}>Create New Backup</h2>
          <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
            Create a backup of the current system data. This includes all users, attendance records, and system settings.
          </p>

          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <Button
              onClick={handleCreateBackup}
              disabled={isCreatingBackup}
              style={{
                backgroundColor: isCreatingBackup ? "#6b7280" : "#059669",
                border: "none"
              }}
            >
              {isCreatingBackup ? "Creating Backup..." : "Create Backup Now"}
            </Button>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input type="checkbox" id="includeFiles" style={{ width: "1rem", height: "1rem" }} />
              <label htmlFor="includeFiles" style={{ fontSize: "0.875rem" }}>
                Include uploaded files and documents
              </label>
            </div>
          </div>
        </div>

        {/* Backup List */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          overflow: "hidden"
        }}>
          <div style={{
            padding: "1.5rem",
            borderBottom: "1px solid #e5e7eb",
            backgroundColor: "#f9fafb"
          }}>
            <h2 style={{ margin: 0, color: "#58111f" }}>Available Backups</h2>
          </div>

          <div style={{ padding: "1.5rem" }}>
            {backups.length === 0 ? (
              <p style={{ textAlign: "center", color: "#6b7280" }}>No backups available</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {backups.map(backup => (
                  <div key={backup.id} style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <div>
                      <h3 style={{ margin: "0 0 0.5rem 0", color: "#58111f" }}>{backup.name}</h3>
                      <div style={{ display: "flex", gap: "1rem", fontSize: "0.875rem", color: "#6b7280" }}>
                        <span>Size: {backup.size}</span>
                        <span>Date: {backup.date}</span>
                        <span>Type: {backup.type}</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Button
                        onClick={() => handleDownloadBackup(backup)}
                        style={{ fontSize: "0.875rem", padding: "0.5rem 1rem" }}
                      >
                        Download
                      </Button>
                      <Button
                        onClick={() => handleRestoreBackup(backup)}
                        style={{
                          fontSize: "0.875rem",
                          padding: "0.5rem 1rem",
                          backgroundColor: "#059669",
                          border: "none"
                        }}
                      >
                        Restore
                      </Button>
                      <Button
                        onClick={() => handleDeleteBackup(backup.id)}
                        style={{
                          fontSize: "0.875rem",
                          padding: "0.5rem 1rem",
                          backgroundColor: "#ef4444"
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* System Information */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "2rem",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          marginTop: "2rem"
        }}>
          <h2 style={{ marginTop: 0, color: "#58111f" }}>System Information</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
            <div>
              <h4 style={{ margin: "0 0 0.5rem 0", color: "#374151" }}>Database Size</h4>
              <p style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>12.4 MB</p>
            </div>
            <div>
              <h4 style={{ margin: "0 0 0.5rem 0", color: "#374151" }}>Last Backup</h4>
              <p style={{ fontSize: "1rem", margin: 0 }}>2024-01-15 02:00:00</p>
            </div>
            <div>
              <h4 style={{ margin: "0 0 0.5rem 0", color: "#374151" }}>Backup Frequency</h4>
              <p style={{ fontSize: "1rem", margin: 0 }}>Daily at 2:00 AM</p>
            </div>
            <div>
              <h4 style={{ margin: "0 0 0.5rem 0", color: "#374151" }}>Retention Period</h4>
              <p style={{ fontSize: "1rem", margin: 0 }}>30 days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupRestore;