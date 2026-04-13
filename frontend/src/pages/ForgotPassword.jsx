import { Link } from "react-router-dom";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import "../styles/ForgotPassword.css";

const ForgotPassword = () => {

  return (
    <main className="auth-shell">
      <section className="auth-hero">
        <h1>Work Immersion System Monitoring System</h1>
      </section>

      <section className="auth-card">
        <div className="auth-card__header">
         
          <h2>Forgot Password</h2>
          <p style={{ marginTop: "0.5rem", color: "var(--ink-600)", fontSize: "0.9rem" }}>
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <div className="auth-form">
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="Enter email address"
            disabled
          />

          <Button disabled>
            Send Reset Email
          </Button>
        </div>

        <p className="auth-card__footer">
          Remember your password? <Link to="/login">Back to Login</Link>
        </p>
      </section>
    </main>
  );
};

export default ForgotPassword;