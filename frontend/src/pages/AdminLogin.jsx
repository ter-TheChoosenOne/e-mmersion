import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Button from "../components/common/Button";
import { adminLoginUser } from "../services/api";
import "../styles/auth.css";

const AdminLogin = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { adminLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.trim()) {
      setErrors({ email: "Email is required" });
      return;
    }

    if (!form.password.trim()) {
      setErrors({ password: "Password is required" });
      return;
    }

    setIsSubmitting(true);

    const payload = {
      email: form.email,
      password: form.password,
    };

    try {
      const res = await adminLoginUser(payload);
      adminLogin(res.data);
      const redirect = location.state?.from?.pathname || "/admin/dashboard";
      navigate(redirect, { replace: true });
    } catch (err) {
      console.error("Admin login error:", err.response?.data || err);
      const errorMsg = err.response?.data?.error || "Login failed. Please try again.";
      
      if (errorMsg.includes("password") || errorMsg.includes("Wrong password")) {
        setErrors({ password: "Incorrect password" });
      } else if (errorMsg.includes("not found") || errorMsg.includes("User not found")) {
        setErrors({ email: "Admin email not found" });
      } else if (errorMsg.includes("Unauthorized access")) {
        setErrors({ email: "Access denied - not an admin account" });
      } else if (errorMsg.includes("required")) {
        setErrors({ general: errorMsg });
      } else {
        setErrors({ general: errorMsg });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-shell">
      {/* HERO */}
      <section className="auth-hero">
        <div>
          <h1>Work Immersion Monitoring System</h1>
          <p>Admin Portal</p>
        </div>
      </section>

      {/* CARD */}
      <section className="auth-card">
        <div className="auth-card__header">
          <h2>Admin Login</h2>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* GENERAL ERROR */}
          {errors.general && (
            <div className="error-popup">{errors.general}</div>
          )}

          {/* EMAIL FIELD */}
          <div className="field">
            <label className="field__label">Email</label>

            {errors.email && (
              <div className="field__message field__message--error">
                {errors.email}
              </div>
            )}

            <input
              className="field__control"
              type="email"
              name="email"
              placeholder="Enter admin email"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          {/* PASSWORD FIELD */}
          <div className="field">
            <label className="field__label">Password</label>

            {errors.password && (
              <div className="field__message field__message--error">
                {errors.password}
              </div>
            )}

            <input
              className="field__control"
              type="password"
              name="password"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          {/* BUTTON */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className={`button button--primary button--login ${
              isSubmitting ? "button--loading" : ""
            }`}
          >
            {isSubmitting ? "Signing in..." : "Admin Login"}
          </Button>
        </form>

        {/* FOOTER */}
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <p className="auth-card__footer">
            <a href="/" style={{ color: "#58111f", textDecoration: "none" }}>
              ← Back to main site
            </a>
          </p>
        </div>
      </section>
    </main>
  );
};

export default AdminLogin;