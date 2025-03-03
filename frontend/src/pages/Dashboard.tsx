import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';
import { Link } from 'react-router-dom';

// Type definitions based on your Prisma schema
interface Project {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  tasks: Task[];
}

interface Task {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  created_at: string;
}

interface User {
  user_id: number;
  username: string;
  email: string;
  role: string;
  track: string;
}

const DashboardHeader = () => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Fetch current user info
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get('http://localhost:3001/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setCurrentUser(response.data.user);
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, []);

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!currentUser) return 'U';
    return currentUser.username.charAt(0).toUpperCase();
  };

  return (
    <header className="dashboard-header">
      <div className="header-container">
        <div className="header-content">
          {/* Logo and Brand */}
          <div className="brand">
            <h1 className="brand-title">Tamid Consulting CRM</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            <Link to="/profile" className="nav-link">Profile</Link>
            <Link to="/settings" className="nav-link">Settings</Link>
            <button onClick={handleLogout} className='nav-link logout-button'>Logout</button>
          </nav>

          {/* Profile dropdown - Desktop */}
          <div className="profile-container">
            <button
              type="button"
              className="profile-button"
              onClick={toggleProfileMenu}
            >
              <div className="profile-avatar">{getUserInitials()}</div>
            </button>

            {/* Profile dropdown menu */}
            {isProfileMenuOpen && (
              <div className="profile-dropdown">
                <Link to="/profile" className="dropdown-item">Your Profile</Link>
                <Link to="/settings" className="dropdown-item">Settings</Link>
                <button onClick={handleLogout} className="dropdown-item logout-button">
                  Sign out
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="mobile-menu-button-container">
            <button
              type="button"
              className="mobile-menu-button"
              onClick={toggleMobileMenu}
            >
              {!isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="menu-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="menu-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-nav-links">
            <Link to="/profile" className="mobile-nav-link">Profile</Link>
            <Link to="/settings" className="mobile-nav-link">Settings</Link>
            <button onClick={handleLogout} className="mobile-nav-link mobile-logout">Logout</button>
          </div>
          <div className="mobile-profile">
            <div className="mobile-profile-info">
              <div className="mobile-avatar">{getUserInitials()}</div>
              <div className="mobile-user-details">
                <div className="mobile-user-name">{currentUser?.username || 'User'}</div>
                <div className="mobile-user-email">{currentUser?.email || 'Loading...'}</div>
              </div>
            </div>
            <div className="mobile-profile-links">
              <Link to="/profile" className="mobile-profile-link">Your Profile</Link>
              <Link to="/settings" className="mobile-profile-link">Settings</Link>
              <button onClick={handleLogout} className="mobile-profile-link mobile-logout">
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch projects from API
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/login';
          return;
        }

        const response = await axios.get('http://localhost:3001/api/projects', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setProjects(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError('Failed to load projects. Please try again later.');
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Calculate project stats
  const activeProjects = projects.filter(project => 
    project.tasks.some(task => task.status !== 'completed')
  );
  
  const completedProjects = projects.filter(project => 
    project.tasks.length > 0 && project.tasks.every(task => task.status === 'completed')
  );

  // Get clients (unique project names for simplicity)
  const clients = [...new Set(projects.map(project => project.name.split(' ')[0]))];

  // Calculate project progress
  const calculateProgress = (project: Project) => {
    if (project.tasks.length === 0) return 0;
    
    const completedTasks = project.tasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  };

  // Find the closest due date for a project
  const getProjectDueDate = (project: Project) => {
    const dueDates = project.tasks
      .filter(task => task.due_date)
      .map(task => new Date(task.due_date as string));
    
    if (dueDates.length === 0) return 'No due date';
    
    const nextDueDate = new Date(Math.min(...dueDates.map(date => date.getTime())));
    return nextDueDate.toLocaleDateString();
  };

  // Get project status
  const getProjectStatus = (project: Project) => {
    const progress = calculateProgress(project);
    return progress === 100 ? 'Completed' : 'Active';
  };

  const statCards = [
    {
      title: 'Active Clients',
      count: clients.length,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="stat-icon client-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      title: 'Active Projects',
      count: activeProjects.length,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="stat-icon project-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    {
      title: 'Completed Projects',
      count: completedProjects.length,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="stat-icon completed-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      )
    }
  ];

  if (loading) {
    return (
      <div className="dashboard">
        <DashboardHeader />
        <main className="dashboard-main">
          <div className="dashboard-container">
            <div className="loading-container">
              <p>Loading dashboard data...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <DashboardHeader />
        <main className="dashboard-main">
          <div className="dashboard-container">
            <div className="error-container">
              <p className="error-message">{error}</p>
              <button 
                className="retry-button"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <DashboardHeader />
      
      <main className="dashboard-main">
        <div className="dashboard-container">
          <div className="welcome-section">
            <h2 className="welcome-title">Welcome to Tamid Consulting CRM</h2>
            <p className="welcome-subtitle">Track your client projects and relationships</p>
          </div>

          {/* Stat Cards */}
          <div className="stat-cards">
            {statCards.map((card, index) => (
              <div key={index} className={`stat-card ${card.title.toLowerCase().replace(' ', '-')}`}>
                <div className="stat-content">
                  <div className="stat-icon-container">
                    {card.icon}
                  </div>
                  <div className="stat-details">
                    <p className="stat-title">{card.title}</p>
                    <p className="stat-count">{card.count}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="dashboard-tabs">
            <button
              className={`tab-button ${activeTab === 'Projects' ? 'active-tab' : ''}`}
              onClick={() => setActiveTab('Projects')}
            >
              Projects
            </button>
            <button
              className={`tab-button ${activeTab === 'Clients' ? 'active-tab' : ''}`}
              onClick={() => setActiveTab('Clients')}
            >
              Clients
            </button>
          </div>

          {/* Project List */}
          {activeTab === 'Projects' && (
            <div className="projects-section">
              <h2 className="section-title">Active Projects</h2>
              {activeProjects.length === 0 ? (
                <p className="no-data-message">No active projects found.</p>
              ) : (
                <div className="project-cards">
                  {activeProjects.map((project) => {
                    const progress = calculateProgress(project);
                    const status = getProjectStatus(project);
                    const dueDate = getProjectDueDate(project);
                    
                    return (
                      <div key={project.id} className={`project-card ${status.toLowerCase()}`}>
                        <div className="project-header">
                          <div>
                            <h3 className="project-name">{project.name}</h3>
                            <p className="project-client">{project.description || 'No description'}</p>
                          </div>
                          <span className={`project-status ${status.toLowerCase()}-status`}>
                            {status}
                          </span>
                        </div>
                        
                        <div className="project-progress">
                          <div className="progress-details">
                            <span>Progress: {progress}%</span>
                            <span>Due: {dueDate}</span>
                          </div>
                          <div className="progress-bar-bg">
                            <div 
                              className={`progress-bar ${status.toLowerCase()}-progress`} 
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="project-team">
                          Tasks: {project.tasks.length}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <h2 className="section-title mt-6">Completed Projects</h2>
              {completedProjects.length === 0 ? (
                <p className="no-data-message">No completed projects found.</p>
              ) : (
                <div className="project-cards">
                  {completedProjects.map((project) => {
                    const progress = calculateProgress(project);
                    const status = getProjectStatus(project);
                    const dueDate = getProjectDueDate(project);
                    
                    return (
                      <div key={project.id} className={`project-card ${status.toLowerCase()}`}>
                        <div className="project-header">
                          <div>
                            <h3 className="project-name">{project.name}</h3>
                            <p className="project-client">{project.description || 'No description'}</p>
                          </div>
                          <span className={`project-status ${status.toLowerCase()}-status`}>
                            {status}
                          </span>
                        </div>
                        
                        <div className="project-progress">
                          <div className="progress-details">
                            <span>Progress: {progress}%</span>
                            <span>Due: {dueDate}</span>
                          </div>
                          <div className="progress-bar-bg">
                            <div 
                              className={`progress-bar ${status.toLowerCase()}-progress`} 
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="project-team">
                          Tasks: {project.tasks.length}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Clients Tab */}
          {activeTab === 'Clients' && (
            <div className="clients-section">
              <h2 className="section-title">Clients</h2>
              {clients.length === 0 ? (
                <p className="no-data-message">No clients found.</p>
              ) : (
                <div className="client-list">
                  {clients.map((client, index) => {
                    const clientProjects = projects.filter(project => 
                      project.name.split(' ')[0] === client
                    );
                    
                    return (
                      <div key={index} className="client-card">
                        <h3 className="client-name">{client}</h3>
                        <p className="client-details">
                          Active client • {clientProjects.length} project{clientProjects.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;