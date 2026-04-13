import { useEffect, useState } from "react";
import Button from "../../components/common/Button.jsx";
import { getAllUsers, updateUser, deleteUser } from "../../services/api";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const fetchUsers = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;

      const res = await getAllUsers(params);
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await deleteUser(userId);
      setUsers(users.filter(user => user._id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user._id);
    setEditForm({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status
    });
  };

  const handleUpdate = async () => {
    try {
      await updateUser(editingUser, editForm);
      setUsers(users.map(user =>
        user._id === editingUser ? { ...user, ...editForm } : user
      ));
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'disapproved': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
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
          <h1 style={{ margin: 0 }}>All Users</h1>
          <p style={{ margin: "0.25rem 0 0 0", opacity: 0.9 }}>
            Manage all system users
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
            type="text"
            placeholder="Search by name, email, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "0.5rem",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              flex: 1
            }}
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              padding: "0.5rem",
              border: "1px solid #d1d5db",
              borderRadius: "4px"
            }}
          >
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
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
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Name</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Email</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Role</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Status</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>ID</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "1rem" }}>
                    {editingUser === user._id ? (
                      <input
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                        style={{ width: "100%", padding: "0.25rem" }}
                      />
                    ) : (
                      user.fullName
                    )}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {editingUser === user._id ? (
                      <input
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        style={{ width: "100%", padding: "0.25rem" }}
                      />
                    ) : (
                      user.email
                    )}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {editingUser === user._id ? (
                      <select
                        value={editForm.role}
                        onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                        style={{ width: "100%", padding: "0.25rem" }}
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
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
                    )}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {editingUser === user._id ? (
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                        style={{ width: "100%", padding: "0.25rem" }}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="disapproved">Disapproved</option>
                      </select>
                    ) : (
                      <span style={{
                        color: getStatusColor(user.status),
                        fontWeight: '500'
                      }}>
                        {user.status}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "1rem", fontSize: "0.75rem", color: "#6b7280" }}>
                    {user.studentId || user.teacherId || 'N/A'}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {editingUser === user._id ? (
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <Button
                          onClick={handleUpdate}
                          style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => setEditingUser(null)}
                          style={{
                            fontSize: "0.75rem",
                            padding: "0.25rem 0.5rem",
                            backgroundColor: "#6b7280"
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <Button
                          onClick={() => handleEdit(user)}
                          style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(user._id)}
                          style={{
                            fontSize: "0.75rem",
                            padding: "0.25rem 0.5rem",
                            backgroundColor: "#ef4444"
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
              No users found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllUsers;