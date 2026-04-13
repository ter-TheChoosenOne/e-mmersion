import { useEffect, useState } from "react";
import Button from "../../components/common/Button.jsx";
import { getAllTeachers, updateUser, deleteUser } from "../../services/api";

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchTeachers();
  }, [search]);

  const fetchTeachers = async () => {
    try {
      const params = {};
      if (search) params.search = search;

      const res = await getAllTeachers();
      let filteredTeachers = res.data;

      if (search) {
        filteredTeachers = filteredTeachers.filter(teacher =>
          teacher.teacherId?.toLowerCase().includes(search.toLowerCase()) ||
          teacher.fullName?.toLowerCase().includes(search.toLowerCase()) ||
          teacher.email?.toLowerCase().includes(search.toLowerCase())
        );
      }

      setTeachers(filteredTeachers);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (teacherId) => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) return;

    try {
      await deleteUser(teacherId);
      setTeachers(teachers.filter(teacher => teacher._id !== teacherId));
    } catch (error) {
      console.error("Error deleting teacher:", error);
      alert("Failed to delete teacher");
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher._id);
    setEditForm({
      fullName: teacher.fullName,
      email: teacher.email,
      teacherId: teacher.teacherId,
      status: teacher.status
    });
  };

  const handleUpdate = async () => {
    try {
      await updateUser(editingTeacher, editForm);
      setTeachers(teachers.map(teacher =>
        teacher._id === editingTeacher ? { ...teacher, ...editForm } : teacher
      ));
      setEditingTeacher(null);
    } catch (error) {
      console.error("Error updating teacher:", error);
      alert("Failed to update teacher");
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
          <h1 style={{ margin: 0 }}>Manage Teachers</h1>
          <p style={{ margin: "0.25rem 0 0 0", opacity: 0.9 }}>
            View and manage all teacher accounts
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

      {/* Search */}
      <div style={{ padding: "1rem 2rem", backgroundColor: "white", borderBottom: "1px solid #e5e7eb" }}>
        <input
          type="text"
          placeholder="Search by teacher ID, name, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "0.75rem",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            fontSize: "1rem"
          }}
        />
      </div>

      {/* Teachers Table */}
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
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Teacher ID</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Name</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Email</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Status</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Joined</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map(teacher => (
                <tr key={teacher._id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "1rem" }}>
                    {editingTeacher === teacher._id ? (
                      <input
                        value={editForm.teacherId}
                        onChange={(e) => setEditForm({...editForm, teacherId: e.target.value})}
                        style={{ width: "100%", padding: "0.25rem" }}
                      />
                    ) : (
                      teacher.teacherId
                    )}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {editingTeacher === teacher._id ? (
                      <input
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                        style={{ width: "100%", padding: "0.25rem" }}
                      />
                    ) : (
                      teacher.fullName
                    )}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {editingTeacher === teacher._id ? (
                      <input
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        style={{ width: "100%", padding: "0.25rem" }}
                      />
                    ) : (
                      teacher.email
                    )}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {editingTeacher === teacher._id ? (
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
                        color: getStatusColor(teacher.status),
                        fontWeight: '500'
                      }}>
                        {teacher.status}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "1rem", fontSize: "0.875rem", color: "#6b7280" }}>
                    {new Date(teacher.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {editingTeacher === teacher._id ? (
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <Button
                          onClick={handleUpdate}
                          style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => setEditingTeacher(null)}
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
                          onClick={() => handleEdit(teacher)}
                          style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(teacher._id)}
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
          {teachers.length === 0 && (
            <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
              No teachers found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageTeachers;