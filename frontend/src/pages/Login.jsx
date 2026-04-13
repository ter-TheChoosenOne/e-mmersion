  import { useContext, useMemo, useState } from "react";
  import { Link, useLocation, useNavigate } from "react-router-dom";
  import { AuthContext } from "../context/AuthContext";
  import Button from "../components/common/Button";
  import { loginUser } from "../services/api";
  import "../styles/auth.css";

  const roleCopy = {
    student: {
      title: "Student Login",
      identifierLabel: "Student ID",
      identifierName: "studentId",
      identifierPlaceholder: "Enter student ID",
    },
    teacher: {
      title: "Teacher Login",
      identifierLabel: "Teacher ID",
      identifierName: "teacherId",
      identifierPlaceholder: "Enter teacher ID",
    },
  };

  const Login = () => {
    const [role, setRole] = useState("student");
    const [form, setForm] = useState({
      password: "",
      studentId: "",
      teacherId: "",
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const content = useMemo(() => roleCopy[role], [role]);

    const handleChange = (e) => {
      const { name, value } = e.target;

      setForm((prev) => ({ ...prev, [name]: value }));
      setErrors({});
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      const identifier = form[content.identifierName].trim();

      if (!identifier) {
        setErrors({ identifier: `${content.identifierLabel} is required` });
        return;
      }

      if (!form.password.trim()) {
        setErrors({ password: "Password is required" });
        return;
      }

      setIsSubmitting(true);

      const payload = {
        password: form.password,
        studentId: role === "student" ? identifier : undefined,
        teacherId: role === "teacher" ? identifier : undefined,
      };

      try {
        const res = await loginUser(payload);
        const user = res.data.user || res.data;
        const status = user.status || 'pending';

        if (user.role === 'teacher' || status === 'approved') {
          login(res.data);
          const redirect = location.state?.from?.pathname || "/dashboard";
          navigate(redirect, { replace: true });
        } else if (status === 'pending') {
          setErrors({ general: "Your account is pending approval from a teacher." });
        } else if (status === 'disapproved') {
          setErrors({ general: "Your account has been disapproved. Contact a teacher for more information." });
        } else {
          setErrors({ general: "Account status unknown. Please contact support." });
        }
      } catch (err) {
        const msg = err.response?.data?.error?.toLowerCase() || "";

        if (msg.includes("password")) {
          setErrors({ password: "Incorrect password" });
        } else if (msg.includes("not found") || msg.includes("invalid")) {
          setErrors({
            identifier:
              role === "student"
                ? "Student ID not found"
                : "Teacher ID not found",
          });
        } else {
          setErrors({ general: "Login failed. Please try again." });
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
            
          </div>
        </section>

        {/* CARD */}
        <section className="auth-card">
          <div className="auth-card__header">
          
            <h2>{content.title}</h2>
          </div>

          {/* ROLE SWITCH */}
          <div className="role-switch">
            <button
              type="button"
              className={role === "student" ? "is-active" : ""}
              onClick={() => setRole("student")}
            >
              Student
            </button>

            <button
              type="button"
              className={role === "teacher" ? "is-active" : ""}
              onClick={() => setRole("teacher")}
            >
              Teacher
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* GENERAL ERROR */}
            {errors.general && (
              <div className="error-popup">{errors.general}</div>
            )}

            {/* IDENTIFIER FIELD */}
            <div className="field">
              <label className="field__label">
                {content.identifierLabel}
              </label>

              {errors.identifier && (
                <div className="field__message field__message--error">
                  {errors.identifier}
                </div>
              )}

              <input
                className="field__control"
                name={content.identifierName}
                placeholder={content.identifierPlaceholder}
                value={form[content.identifierName]}
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
  {isSubmitting ? "Signing in..." : "Login"}
</Button>
          </form>

          {/* FOOTER */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Link to="/forgot-password" className="forgot-password-link">
              Forgot Password?
            </Link>
            <p className="auth-card__footer" style={{ margin: 0 }}>
              No account yet? <Link to="/register">Create one</Link>
            </p>
          </div>
        </section>
      </main>
    );
  };

  export default Login;