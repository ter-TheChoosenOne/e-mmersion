import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { registerUser } from "../services/api";


const roleMeta = {
  student: {
    title: "Student Signup",
    idField: "studentId",
    idLabel: "Student ID",
    idPlaceholder: "Enter student ID",
  },
  teacher: {
    title: "Teacher Signup",
    idField: "teacherId",
    idLabel: "Teacher ID",
    idPlaceholder: "Enter teacher ID",
  },
};

const Register = () => {
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    studentId: "",
    teacherId: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    numbers: false,
    special: false,
  });
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const passwordStrengthTimeoutRef = useRef(null);
  const errorTimeoutRef = useRef(null);
  const navigate = useNavigate();

  const currentMeta = roleMeta[role];

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (passwordStrengthTimeoutRef.current) {
        clearTimeout(passwordStrengthTimeoutRef.current);
      }
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  // Auto-hide error after 3 seconds
  useEffect(() => {
    if (error) {
      // Clear existing timeout
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }

      // Set new timeout to clear error after 3 seconds
      errorTimeoutRef.current = setTimeout(() => {
        setError("");
      }, 3000);
    }

    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, [error]);

  const validatePasswordStrength = (password) => {
    return {
      length: password.length >= 8 && password.length <= 12,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=[\]{};':"|,.<>/?]/.test(password),
    };
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));

    // Update password strength in real-time
    if (name === "password") {
      const strength = validatePasswordStrength(value);
      setPasswordStrength(strength);

      // Show password strength indicator
      setShowPasswordStrength(true);

      // Clear existing timeout
      if (passwordStrengthTimeoutRef.current) {
        clearTimeout(passwordStrengthTimeoutRef.current);
      }

      // Set new timeout to hide after 3 seconds
      passwordStrengthTimeoutRef.current = setTimeout(() => {
        setShowPasswordStrength(false);
      }, 3000);
    }
  };

  const handleRoleChange = (nextRole) => {
    setRole(nextRole);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    // Validation
    if (!form.firstName.trim()) {
      setError("First name is required");
      setIsSubmitting(false);
      return;
    }

    if (!form.lastName.trim()) {
      setError("Last name is required");
      setIsSubmitting(false);
      return;
    }

    if (!form.email.trim()) {
      setError("Email is required");
      setIsSubmitting(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setError("Please enter a valid email address");
      setIsSubmitting(false);
      return;
    }

    if (!form.password) {
      setError("Password is required");
      setIsSubmitting(false);
      return;
    }

    // Validate password strength
    const strength = validatePasswordStrength(form.password);
    const strengthErrors = [];

    if (!strength.length) {
      strengthErrors.push("Password must be 8-12 characters long");
    }
    if (!strength.uppercase || !strength.lowercase) {
      strengthErrors.push("Password must contain both uppercase and lowercase letters");
    }
    if (!strength.numbers) {
      strengthErrors.push("Password must contain at least one number");
    }
    if (!strength.special) {
      strengthErrors.push("Password must contain at least one special character");
    }

    if (strengthErrors.length > 0) {
      setError(strengthErrors.join(". "));
      setIsSubmitting(false);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    const id = role === "student" ? form.studentId.trim() : form.teacherId.trim();
    if (!id) {
      setError(`${role === "student" ? "Student ID" : "Teacher ID"} is required`);
      setIsSubmitting(false);
      return;
    }

    const payload = {
      fullName: `${form.firstName.trim()} ${form.lastName.trim()}`,
      email: form.email.trim(),
      password: form.password,
      confirmPassword: form.confirmPassword,
      role,
      studentId: role === "student" ? id : undefined,
      teacherId: role === "teacher" ? id : undefined,
    };

    try {
      await registerUser(payload);
      setShowPendingModal(true);
      setTimeout(() => {
        setShowPendingModal(false);
        navigate("/login");
      }, 5000);
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-shell auth-shell--register">
      <section className="auth-hero">
        <h1>Create Your Account</h1>
      </section>

      <section className="auth-card">
        <div className="auth-card__header">
          <h2>{currentMeta.title}</h2>
        </div>

        <div className="role-switch" aria-label="Select signup role">
          <button
            type="button"
            className={role === "student" ? "is-active" : ""}
            onClick={() => handleRoleChange("student")}
          >
            Student
          </button>
          <button
            type="button"
            className={role === "teacher" ? "is-active" : ""}
            onClick={() => handleRoleChange("teacher")}
          >
            Teacher
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form__split">
            <Input
              label="First Name"
              name="firstName"
              placeholder="Enter first name"
              value={form.firstName}
              onChange={handleChange}
            />

            <Input
              label="Last Name"
              name="lastName"
              placeholder="Enter last name"
              value={form.lastName}
              onChange={handleChange}
            />
          </div>

          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="Enter email"
            value={form.email}
            onChange={handleChange}
          />

          <Input
            label={currentMeta.idLabel}
            name={currentMeta.idField}
            placeholder={currentMeta.idPlaceholder}
            value={form[currentMeta.idField]}
            onChange={handleChange}
          />

          <div className="auth-form__split">
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
            />
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={handleChange}
            />
          </div>

          {showPasswordStrength && (
            <div className="password-strength">
              <div className="password-requirements">
                <div className={`requirement ${passwordStrength.length ? 'met' : ''}`}>
                  <span>8-12 characters</span>
                  <span className="indicator">{passwordStrength.length ? '✓' : '✗'}</span>
                </div>
                <div className={`requirement ${passwordStrength.uppercase && passwordStrength.lowercase ? 'met' : ''}`}>
                  <span>Upper & lowercase</span>
                  <span className="indicator">{passwordStrength.uppercase && passwordStrength.lowercase ? '✓' : '✗'}</span>
                </div>
                <div className={`requirement ${passwordStrength.numbers ? 'met' : ''}`}>
                  <span>Numbers</span>
                  <span className="indicator">{passwordStrength.numbers ? '✓' : '✗'}</span>
                </div>
                <div className={`requirement ${passwordStrength.special ? 'met' : ''}`}>
                  <span>Special characters</span>
                  <span className="indicator">{passwordStrength.special ? '✓' : '✗'}</span>
                </div>
              </div>
            </div>
          )}

          {error && <div className="error-popup">{error}</div>}
          {success && (
            <div className="error-popup" style={{ background: "#d1fae5", borderColor: "#10b981", color: "#065f46" }}>
              {success}
            </div>
          )}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <p className="auth-card__footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </section>

      {showPendingModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '2rem',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            maxWidth: '400px',
            width: '90%',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Registration Submitted</h3>
            <p style={{ margin: '0.5rem 0', color: '#666', lineHeight: '1.5' }}>
              Your account is pending approval from a teacher. You will be notified once approved.
            </p>
            <p style={{ margin: '0.5rem 0', color: '#666' }}>Redirecting to login...</p>
          </div>
        </div>
      )}
    </main>
  );
};

export default Register;
