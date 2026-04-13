import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/layout/ProtectedRoute";
import AdminProtectedRoute from "../components/layout/AdminProtectedRoute";
import Dashboard from "../pages/Dashboard";
import AdminDashboard from "../pages/AdminDashboard";
import AllUsers from "../pages/admin/AllUsers";
import ManageStudents from "../pages/admin/ManageStudents";
import ManageTeachers from "../pages/admin/ManageTeachers";
import UserStatistics from "../pages/admin/UserStatistics";
import AttendanceReports from "../pages/admin/AttendanceReports";
import SystemConfiguration from "../pages/admin/SystemConfiguration";
import BackupRestore from "../pages/admin/BackupRestore";
import AccessLogs from "../pages/admin/AccessLogs";
import SecuritySettings from "../pages/admin/SecuritySettings";
import Login from "../pages/Login";
import AdminLogin from "../pages/AdminLogin";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Splash from "../pages/Splash";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AllUsers />} />
          <Route path="/admin/students" element={<ManageStudents />} />
          <Route path="/admin/teachers" element={<ManageTeachers />} />
          <Route path="/admin/statistics" element={<UserStatistics />} />
          <Route path="/admin/attendance-reports" element={<AttendanceReports />} />
          <Route path="/admin/config" element={<SystemConfiguration />} />
          <Route path="/admin/backup" element={<BackupRestore />} />
          <Route path="/admin/logs" element={<AccessLogs />} />
          <Route path="/admin/security" element={<SecuritySettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
