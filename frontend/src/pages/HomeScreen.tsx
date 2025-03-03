import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import "./HomeScreen.css";

const HomeScreen = () => {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            {/* Header Section with Logo and Navbar */}
            <header className="header">
                <div className="logo-container">
                    <img src="/Horizontal-Group-Logo.png" alt="TAMID Group Logo" className="logo" />
                </div>
                <nav className="nav-menu">
                    <ul>
                        <li><a href="#">About ▾</a></li>
                        <li><a href="#">Get Involved</a></li>
                        <li><a href="#">Our Programs ▾</a></li>
                        <li><a href="#">Company Partnerships ▾</a></li>
                        <li><a href="#">Contact Us ▾</a></li>
                    </ul>
                </nav>
                <div className="header-buttons">
                    <input type="text" placeholder="🔍" className="search-bar" />
                    <Button variant="contained" className="donate-button">Donate</Button>
                    <Button variant="outlined" className="login-button" onClick={() => navigate("/login")}>
    Login
</Button>

                </div>
            </header>

            <div className="overlay"></div>
            <div className="content">
                <h1 className="headline">Where tomorrow's leaders connect with innovation</h1>
                <p className="subtext">Empowering students with hands-on consulting experience in global industries.</p>
                <div className="button-group">
                    <Button variant="contained" color="primary" onClick={() => navigate("/find-chapter")}>
                        Find a Chapter
                    </Button>
                    <Button variant="outlined" color="primary" onClick={() => navigate("/donate")}>
                        Donate
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default HomeScreen;
