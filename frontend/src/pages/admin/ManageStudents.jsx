import { useEffect, useState } from "react";
import Button from "../../components/common/Button.jsx";
import { getAllStudents, updateUser, deleteUser } from "../../services/api";

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchStudents();
  }, [search]);

  const fetchStudents = async () => {
    try {
      const params = {};
      if (search) params.search = search;

      const res = await getAllStudents();
      let filteredStudents = res.data;

      if (search) {
        filteredStudents = filteredStudents.filter(student =>
          student.studentId?.toLowerCase().includes(search.toLowerCase()) ||
          student.fullName?.toLowerCase().includes(search.toLowerCase()) ||
          student.email?.toLowerCase().includes(search.toLowerCase())
        );
      }

      setStudents(filteredStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;

    try {
      await deleteUser(studentId);
      setStudents(students.filter(student => student._id !== studentId));
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Failed to delete student");
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student._id);
    setEditForm({
      fullName: student.fullName,
      email: student.email,
      studentId: student.studentId,
      status: student.status
    });
  };

  const handleUpdate = async () => {
    try {
      await updateUser(editingStudent, editForm);
      setStudents(students.map(student =>
        student._id === editingStudent ? { ...student, ...editForm } : student
      ));
      setEditingStudent(null);
    } catch (error) {
      console.error("Error updating student:", error);
      alert("Failed to update student");
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
          <h1 style={{ margin: 0 }}>Manage Students</h1>
          <p style={{ margin: "0.25rem 0 0 0", opacity: 0.9 }}>
            View and manage all student accounts
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
          placeholder="Search by student ID, name, or email..."
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

      {/* Students Table */}
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
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Student ID</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Name</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Email</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Status</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Joined</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student._id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "1rem" }}>
                    {editingStudent === student._id ? (
                      <input
                        value={editForm.studentId}
                        onChange={(e) => setEditForm({...editForm, studentId: e.target.value})}
                        style={{ width: "100%", padding: "0.25rem" }}
                      />
                    ) : (
                      student.studentId
                    )}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {editingStudent === student._id ? (
                      <input
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                        style={{ width: "100%", padding: "0.25rem" }}
                      />
                    ) : (
                      student.fullName
                    )}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {editingStudent === student._id ? (
                      <input
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        style={{ width: "100%", padding: "0.25rem" }}
                      />
                    ) : (
                      student.email
                    )}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {editingStudent === student._id ? (
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
                        color: getStatusColor(student.status),
                        fontWeight: '500'
                      }}>
                        {student.status}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "1rem", fontSize: "0.875rem", color: "#6b7280" }}>
                    {new Date(student.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {editingStudent === student._id ? (
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <Button
                          onClick={handleUpdate}
                          style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => setEditingStudent(null)}
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
                          onClick={() => handleEdit(student)}
                          style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(student._id)}
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
          {students.length === 0 && (
            <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
              No students found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageStudents;