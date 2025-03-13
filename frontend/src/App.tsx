import { Routes, Route } from "react-router-dom";
import HomeScreen from "./pages/HomeScreen";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";

function App() {
  console.log("App component rendering");
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </div>
  );
}

export default App;
