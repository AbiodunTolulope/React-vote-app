import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import "../styles/Auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { user, login } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch (error) {
      // Firebase error codes could be mapped to friendlier messages here
      setError("Invalid email or password. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        {/* Brand Section (Left) */}
        <div className="auth-brand-section">
          <div className="auth-brand-content">
            <h2>Welcome Back.</h2>
            <p>Log in to manage your polls, track results, and engage with your audience.</p>
          </div>
          <div className="auth-testimonial">
            "Poll Point makes decision making democratic and efficient."
          </div>
        </div>

        {/* Form Section (Right) */}
        <div className="auth-form-section">
          <div className="auth-header">
            <h2>Sign In</h2>
            <p>Enter your credentials to access your account</p>
          </div>

          <form className="auth-form" onSubmit={handleLogin}>
            <Input
              label="Email Address"
              type="email"
              id="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />

            <Input
              label="Password"
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isSubmitting}
            />

            {error && (
              <div className="input-error-msg" style={{ marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              isLoading={isSubmitting}
              size="lg"
            >
              Sign In
            </Button>
          </form>

          <div className="auth-footer">
            Don't have an account?
            <Link to="/signup" className="auth-link">Create one now</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;