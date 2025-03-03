import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './SignupPage.css';

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      console.log("Attempting signup with:", { email, username });
      
      const response = await axios.post("http://localhost:3001/api/auth/register", {
        email,
        password,
        username,
        role: "user",
        track: "education" // Explicitly set the default track
      });
      
      console.log("Signup response:", response.data);
      navigate("/"); // Redirect to login page after successful signup
    } catch (err: any) {
      console.error("Signup error:", err);
      
      // Display more specific error messages from the server if available
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
        <h2 className="signup-title">Sign Up</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </div>
          <button type="submit" className="signup-button" disabled={loading}>
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
        <p className="login-text">
          Already have an account? <a href="/login" style={{ color: '#3b82f6' }}>Login</a>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;