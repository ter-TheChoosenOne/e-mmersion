import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import StudentDashboard from "./StudentDashboard";
import TeacherDashboard from "./TeacherDashboard";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const role = user?.role || "student";

  if (role === "teacher") {
    return <TeacherDashboard />;
  }

  return <StudentDashboard />;
};

export default Dashboard;
