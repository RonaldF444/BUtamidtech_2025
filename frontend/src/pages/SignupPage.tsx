import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import './SignupPage.css';

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("member"); // Default to member role
  const [track, setTrack] = useState("education"); // Default track
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      console.log("Attempting signup with:", { email, username, role, track });
      
      const response = await axios.post("http://localhost:3001/api/auth/register", {
        email,
        password,
        username,
        role,
        track
      });
      
      console.log("Signup response:", response.data);
      navigate("/"); // Redirect to login page after successful signup
    } catch (err: any) {
      console.error("Signup error:", err);
      
      if (err.response && err.response.data) {
        setError(err.response.data.error || err.response.data.details || "Signup failed. Please try again.");
      } else {
        setError("Network error. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1>Create Account</h1>
        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="member">Member</option>
              <option value="client">Client</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="track">Track</label>
            <select
              id="track"
              value={track}
              onChange={(e) => setTrack(e.target.value)}
              required
            >
              <option value="education">Education</option>
              <option value="consulting">Consulting</option>
              <option value="technology">Technology</option>
              <option value="finance">Finance</option>
            </select>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="signup-button" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
        
        <p className="login-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;