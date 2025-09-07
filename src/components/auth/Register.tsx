import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Auth.module.css";

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    try {
      setError("");
      setLoading(true);
      const { error: authError } = await register(email, password);

      if (authError) {
        setError(authError.message);
      } else {
        setSuccess(true);
        // In the success state, update the timeout:
        setTimeout(() => {
          navigate("/dashboard"); // Go to dashboard after successful registration
        }, 2000);
      }
    } catch (error: any) {
      setError("Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <h2 className={styles.authTitle}>Account Created Successfully!</h2>
          <p style={{ textAlign: "center", color: "#059669" }}>
            Welcome! You can now start reporting civic issues.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h2 className={styles.authTitle}>Create Account</h2>
        <p className={styles.subtitle}>
          Join our community and help improve your city
        </p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <span className="spinner"></span>
            ) : (
              "Create Account & Start Reporting"
            )}
          </button>
        </form>

        <p className={styles.authLink}>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
