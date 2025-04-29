import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import "./HomeScreen.css";

const HomeScreen = () => {
    const navigate = useNavigate();

    return (
        <div className="page-container">
            {/* Header Section with Logo and Navbar */}
            <header className="header">
                <div className="logo-container">
                    <img src="tamidlogo.png" alt="TAMID Group Logo" className="logo" />
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
                    <input type="text" placeholder="Search..." className="search-bar" />
                    <Button variant="contained" className="donate-button">Donate</Button>
                    <Button variant="outlined" className="login-button" onClick={() => navigate("/login")}>
                        Login
                    </Button>
                </div>
            </header>

            {/* Hero Section */}
            <div className="home-container">
                <div className="overlay"></div>
                <div className="content">
                    <h1 className="headline">Where tomorrow's leaders connect with innovation</h1>
                    <p className="subtext">Empowering students with hands-on consulting experience in global industries.</p>
                    <div className="button-group">
                        <Button variant="contained" color="primary" className="cta-button" onClick={() => navigate("/LoginPage")}>
                            Login
                        </Button>
                        <Button variant="outlined" color="primary" className="cta-button outline" onClick={() => navigate("/donate")}>
                            Donate
                        </Button>
                    </div>
                </div>
            </div>

            {/* Cards Section */}
            <div className="cards-section">
                <div className="card">
                    <div className="card-tag">College Students</div>
                    <img src="/join-students.jpg" alt="College Students" className="card-image" />
                    <h2>Join TAMID</h2>
                    <p>College Students — learn if your school has a chapter or start one yourself</p>
                    <Button variant="outlined" className="card-button" onClick={() => navigate("/join")}>
                        Join TAMID
                    </Button>
                </div>

                <div className="card">
                    <div className="card-tag">Israeli Companies</div>
                    <img src="/workwithTamid.jpg" alt="Israeli Companies" className="card-image" />
                    <h2>Work with TAMID</h2>
                    <p>Israeli Companies — work with students from around the world who can provide a unique perspective for your business</p>
                    <Button variant="outlined" className="card-button" onClick={() => navigate("/work")}>
                        Work with TAMID
                    </Button>
                </div>

                <div className="card">
                    <div className="card-tag">Donors</div>
                    <img src="/investintamid.jpg" alt="Donors" className="card-image" />
                    <h2>Invest in TAMID</h2>
                    <p>Donors — help us make connecting to Israel possible for emerging leaders around the world</p>
                    <Button variant="outlined" className="card-button" onClick={() => navigate("/invest")}>
                        Invest in TAMID
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default HomeScreen;
