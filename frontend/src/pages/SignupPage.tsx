import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './SignupPage.css';

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3001/api/auth/register", {
        email,
        password,
        username,
        role: "user",
      });
      navigate("/");
    } catch (err) {
      setError("Signup failed. Try again.");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2 className="signup-title">Sign Up</h2>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        <form onSubmit={handleSignup}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="signup-button">
            Sign Up
          </button>
        </form>
        <p className="login-text">
          Already have an account? <a href="/" style={{ color: '#3b82f6' }}>Login</a>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;