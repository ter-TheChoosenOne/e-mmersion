import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { resetPasswordUser } from "../services/api";
import "../styles/auth.css";

const ResetPassword = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link");
    }
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    if (!newPassword || !confirmPassword) {
      setError("All fields are required");
      setIsSubmitting(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      setIsSubmitting(false);
      return;
    }

    try {
      await resetPasswordUser({
        token,
        newPassword,
        confirmPassword
      });
      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (requestError) {
      const serverError = requestError.response?.data?.error || "Failed to reset password. Please try again.";
      setError(serverError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <main className="auth-shell">
        <section className="auth-hero">
          <h1>Work Immersion</h1>
        </section>

        <section className="auth-card">
          <div className="auth-card__header">
            <h2>Invalid Reset Link</h2>
            <p>The password reset link is invalid or has expired.</p>
          </div>

          <p className="auth-card__footer">
            <Link to="/forgot-password">Request New Reset Link</Link>
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-shell">
      <section className="auth-hero">
        <h1>Work Immersion</h1>
      </section>

      <section className="auth-card">
        <div className="auth-card__header">
          <p className="auth-card__eyebrow">Reset Password</p>
          <h2>Set New Password</h2>
          <p style={{ marginTop: "0.5rem", color: "var(--ink-600)", fontSize: "0.9rem" }}>
            Enter your new password below.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <Input
            label="New Password"
            name="newPassword"
            type="password"
            placeholder="Enter new password (min. 6 characters)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {error && (
            <div className="error-popup">
              <p className="auth-feedback auth-feedback--error">
                {error}
              </p>
              <button type="button" onClick={() => setError("")} className="error-popup__close">&times;</button>
            </div>
          )}

          {success && (
            <div className="error-popup" style={{ background: "#d1fae5", borderColor: "#10b981", color: "#065f46" }}>
              <p className="auth-feedback" style={{ color: "#065f46", fontWeight: "500" }}>
                {success}
              </p>
            </div>
          )}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </Button>
        </form>

        <p className="auth-card__footer">
          Remember your password? <Link to="/login">Back to Login</Link>
        </p>
      </section>
    </main>
  );
};

export default ResetPassword;