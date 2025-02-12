import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
    <div className="flex h-screen items-center justify-center">
      <form onSubmit={handleSignup} className="bg-white p-8 shadow-md rounded">
        <h2 className="text-xl font-bold mb-4">Signup</h2>
        {error && <p className="text-red-500">{error}</p>}
        <input
          type="text"
          placeholder="Username"
          className="border p-2 w-full mb-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full mb-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="bg-green-500 text-white p-2 w-full">Signup</button>
      </form>
    </div>
  );
};

export default SignupPage;
