import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Dashboard.css';
import { Link } from 'react-router-dom';

// Type definitions based on your Prisma schema
interface Project {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  track: string;
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
  weight: number;
}

interface User {
  user_id: number;
  username: string;
  email: string;
  role: string;
  track: string;
}

// Helper function to check user permissions
const hasPermission = (user: User | null, permission: string): boolean => {
  if (!user) return false;
  
  switch (user.role) {
    case 'president':
      return true; // President has all permissions
    case 'director':
      return permission !== 'manageRoles';
    case 'pm':
      return permission !== 'manageRoles' && permission !== 'completeProjects';
    case 'member':
      return permission === 'view';
    case 'client':
      return permission === 'view';
    default:
      return false;
  }
};

// Helper function to check if user can manage project
const canManageProject = (user: User | null, projectTrack: string): boolean => {
  if (!user) return false;
  
  switch (user.role) {
    case 'president':
      return true;
    case 'director':
    case 'pm':
      return user.track === projectTrack;
    default:
      return false;
  }
};

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
    window.location.href = '/';
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
            <Link to="/" className="nav-link">Home</Link>
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
            <Link to="/" className="mobile-nav-link">Home</Link>
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [newProject, setNewProject] = useState({ 
    name: '', 
    description: '',
    track: '' 
  });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    due_date: ''
  });
  const [modalError, setModalError] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
  const [showTaskWeightModal, setShowTaskWeightModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskWeight, setTaskWeight] = useState<number>(1);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [selectedProjectForTrack, setSelectedProjectForTrack] = useState<Project | null>(null);
  const [newTrack, setNewTrack] = useState('');

  useEffect(() => {
    // Fetch current user info
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/login';
          return;
        }

        const response = await axios.get('http://localhost:3001/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('User info received:', response.data.user);
        setCurrentUser(response.data.user);
      } catch (error) {
        console.error('Error fetching user info:', error);
        setError('Failed to load user information.');
      }
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    // Log whenever the active tab changes
    console.log('Active tab:', activeTab);
  }, [activeTab]);

  useEffect(() => {
    // Log whenever the current user changes
    console.log('Current user:', currentUser);
  }, [currentUser]);

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
    project.tasks.length === 0 || project.tasks.some(task => task.status !== 'completed')
  );
  
  const completedProjects = projects.filter(project => 
    project.tasks.length > 0 && project.tasks.every(task => task.status === 'completed')
  );

  // Get clients (unique project names for simplicity)
  const clients = [...new Set(projects.map(project => project.name.split(' ')[0]))];

  // Calculate project progress
  const calculateProgress = (project: Project) => {
    if (project.tasks.length === 0) return 0;
    
    const totalWeight = project.tasks.reduce((sum, task) => sum + (task.weight || 1), 0);
    const completedWeight = project.tasks
      .filter(task => task.status === 'completed')
      .reduce((sum, task) => sum + (task.weight || 1), 0);
    
    return Math.round((completedWeight / totalWeight) * 100);
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

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    
    try {
      if (!currentUser || !hasPermission(currentUser, 'manageProjects')) {
        setModalError('You do not have permission to create projects.');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }
      
      const response = await axios.post('http://localhost:3001/api/projects', {
        ...newProject,
        track: currentUser.role === 'president' ? newProject.track : currentUser.track // Use selected track for president, user's track for others
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Immediately close the modal and reset form
      setShowCreateModal(false);
      setNewProject({ name: '', description: '', track: '' });
      setModalError('');

      // Update the projects list
      const projectsResponse = await axios.get('http://localhost:3001/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(projectsResponse.data);
      
      // Ensure we're on the Projects tab
      setActiveTab('Projects');

    } catch (error: any) {
      console.error('Error creating project:', error);
      setModalError(
        error.response?.data?.error || 
        error.response?.data?.details || 
        error.message || 
        'Failed to create project. Please try again.'
      );
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(''); // Clear any previous errors
    
    try {
      if (!selectedProjectId) {
        setModalError('No project selected for task creation.');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      console.log('Creating task:', {
        projectId: selectedProjectId,
        task: newTask
      });
      
      const response = await axios.post(
        `http://localhost:3001/api/projects/${selectedProjectId}/tasks`,
        newTask,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Task creation response:', response.data);
      
      // Update the projects state to include the new task
      setProjects(projects.map(project => 
        project.id === selectedProjectId
          ? { ...project, tasks: [...project.tasks, response.data] }
          : project
      ));
      
      setShowCreateTaskModal(false);
      setNewTask({ title: '', description: '', due_date: '' });
      setSelectedProjectId(null);
    } catch (error: any) {
      console.error('Error creating task:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setModalError(
        error.response?.data?.error || 
        error.response?.data?.details || 
        error.message || 
        'Failed to create task. Please try again.'
      );
    }
  };

  const handleDeleteClick = (projectId: number) => {
    setProjectToDelete(projectId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (projectToDelete === null) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/api/projects/${projectToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Remove the project from state
      setProjects(projects.filter(project => project.id !== projectToDelete));
      setShowDeleteModal(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setProjectToDelete(null);
  };

  const handleUpdateTaskWeight = async (taskId: number, projectId: number, weight: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      // Find the current task to get its existing data
      const currentProject = projects.find(p => p.id === projectId);
      const currentTask = currentProject?.tasks.find(t => t.id === taskId);

      if (!currentProject || !currentTask) {
        console.error('Project or task not found');
        return;
      }

      console.log(`Updating task ${taskId} weight to ${weight}`);

      const response = await axios.put(
        `http://localhost:3001/api/projects/${projectId}/tasks/${taskId}`,
        {
          title: currentTask.title,
          description: currentTask.description,
          status: currentTask.status,
          due_date: currentTask.due_date,
          weight: weight
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        // Update the projects state with the new weight
        setProjects(prevProjects => 
          prevProjects.map(project => {
            if (project.id === projectId) {
              return {
                ...project,
                tasks: project.tasks.map(task => 
                  task.id === taskId 
                    ? { ...task, weight: weight }
                    : task
                )
              };
            }
            return project;
          })
        );

        // Close the modal and reset the form
        setShowTaskWeightModal(false);
        setSelectedTask(null);
        setTaskWeight(1);
      }
    } catch (error) {
      console.error('Error updating task weight:', error);
    }
  };

  const handleToggleTaskStatus = async (taskId: number, projectId: number, currentStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      // Find the current project and task
      const currentProject = projects.find(p => p.id === projectId);
      const currentTask = currentProject?.tasks.find(t => t.id === taskId);

      if (!currentProject || !currentTask) {
        console.error('Project or task not found');
        return;
      }

      // Check if user has permission to complete tasks
      if (!currentUser || !hasPermission(currentUser, 'completeTasks')) {
        console.error('User does not have permission to complete tasks');
        return;
      }

      // Handle both 'active' and 'pending' statuses
      const newStatus = (currentStatus === 'completed' || currentStatus === 'active') ? 'pending' : 'completed';
      
      console.log('Task update request:', {
        taskId,
        projectId,
        currentStatus,
        newStatus,
        taskDetails: {
          title: currentTask.title,
          description: currentTask.description,
          due_date: currentTask.due_date
        }
      });

      const response = await axios.patch(
        `http://localhost:3001/api/projects/${projectId}/tasks/${taskId}`,
        { 
          status: newStatus,
          title: currentTask.title,
          description: currentTask.description,
          due_date: currentTask.due_date,
          weight: currentTask.weight
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Server response:', response.data);

      if (response.data) {
        // Update the projects state with the new task status
        setProjects(prevProjects => 
          prevProjects.map(project => {
            if (project.id === projectId) {
              return {
                ...project,
                tasks: project.tasks.map(task => 
                  task.id === taskId 
                    ? { ...task, status: newStatus }
                    : task
                )
              };
            }
            return project;
          })
        );
      }
    } catch (error: any) {
      console.error('Error updating task status:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Full error details:', {
        message: error.message,
        response: error.response,
        request: error.request
      });
    }
  };

  const handleCompleteProject = async (projectId: number) => {
    try {
      if (!currentUser || !hasPermission(currentUser, 'completeProjects')) {
        setError('You do not have permission to complete projects.');
        return;
      }

      // ... rest of the complete project logic ...
    } catch (error) {
      // ... error handling ...
    }
  };

  const handleTrackChange = async (projectId: number, newTrack: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await axios.patch(
        `http://localhost:3001/api/projects/${projectId}`,
        { track: newTrack },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update the projects state with the new track
      setProjects(prevProjects =>
        prevProjects.map(project =>
          project.id === projectId
            ? { ...project, track: newTrack }
            : project
        )
      );

      setShowTrackModal(false);
      setSelectedProjectForTrack(null);
      setNewTrack('');
    } catch (error) {
      console.error('Error updating project track:', error);
      setModalError('Failed to update project track. Please try again.');
    }
  };

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

          {/* Projects Section */}
          <div className="projects-section">
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

            {/* Project Content */}
          {activeTab === 'Projects' && (
              <>
                <div className="section-header">
              <h2 className="section-title">Active Projects</h2>
                  {currentUser && hasPermission(currentUser, 'manageProjects') && (
                    <button 
                      className="create-project-button"
                      onClick={() => setShowCreateModal(true)}
                    >
                      Create Project
                    </button>
                  )}
                </div>

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
                          <div className="project-info">
                            <h3 className="project-name">{project.name}</h3>
                            <p className="project-client">{project.description}</p>
                          </div>
                          <div className="project-actions">
                            <span className={`project-status ${status.toLowerCase()}-status`}>
                              {status}
                            </span>
                            {currentUser?.role === 'president' ? (
                              <button
                                className={`project-track track-${project.track.toLowerCase()} clickable`}
                                onClick={() => {
                                  setSelectedProjectForTrack(project);
                                  setNewTrack(project.track);
                                  setShowTrackModal(true);
                                }}
                              >
                                {project.track.charAt(0).toUpperCase() + project.track.slice(1)}
                              </button>
                            ) : (
                              <span className={`project-track track-${project.track.toLowerCase()}`}>
                                {project.track.charAt(0).toUpperCase() + project.track.slice(1)}
                              </span>
                            )}
                            <button
                              className="delete-project-button"
                              onClick={() => handleDeleteClick(project.id)}
                            >
                              Delete
                            </button>
                          </div>
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
                        
                          <div className="project-footer">
                        <div className="project-team">
                          Tasks: {project.tasks.length}
                            </div>
                            <button 
                              className="create-task-button"
                              onClick={() => {
                                setSelectedProjectId(project.id);
                                setShowCreateTaskModal(true);
                              }}
                            >
                              Add Task
                            </button>
                          </div>

                          <div className="project-tasks">
                            <div className="active-tasks">
                              <h4 className="tasks-title">Active Tasks</h4>
                              {project.tasks
                                .filter(task => task.status === 'pending' || task.status === 'active')
                                .map(task => (
                                  <div key={task.id} className="task-item">
                                    <div className="task-header">
                                      <div className="task-info">
                                        <input
                                          type="checkbox"
                                          checked={task.status === 'completed'}
                                          onChange={() => handleToggleTaskStatus(task.id, project.id, task.status)}
                                          className="task-checkbox"
                                        />
                                        <span className="task-title">{task.title}</span>
                                      </div>
                                      <div className="task-actions">
                                        <button
                                          className="weight-button"
                                          onClick={() => {
                                            setSelectedTask(task);
                                            setTaskWeight(task.weight || 1);
                                            setShowTaskWeightModal(true);
                                          }}
                                        >
                                          Weight: {task.weight || 1}
                                        </button>
                                      </div>
                                    </div>
                                    {task.description && (
                                      <p className="task-description">{task.description}</p>
                                    )}
                                    {task.due_date && (
                                      <p className="task-due-date">Due: {new Date(task.due_date).toLocaleDateString()}</p>
                                    )}
                                  </div>
                                ))}
                              {project.tasks.filter(task => task.status === 'pending' || task.status === 'active').length === 0 && (
                                <p className="no-tasks-message">No active tasks</p>
                              )}
                            </div>

                            <div className="completed-tasks">
                              <h4 className="tasks-title">Completed Tasks</h4>
                              {project.tasks
                                .filter(task => task.status === 'completed')
                                .map(task => (
                                  <div key={task.id} className="task-item completed">
                                    <div className="task-header">
                                      <div className="task-info">
                                        <input
                                          type="checkbox"
                                          checked={true}
                                          onChange={() => handleToggleTaskStatus(task.id, project.id, task.status)}
                                          className="task-checkbox"
                                        />
                                        <span className="task-title">{task.title}</span>
                                      </div>
                                      <div className="task-actions">
                                        <span className="task-weight">Weight: {task.weight || 1}</span>
                                      </div>
                                    </div>
                                    {task.description && (
                                      <p className="task-description">{task.description}</p>
                                    )}
                                    {task.due_date && (
                                      <p className="task-due-date">Completed on: {new Date().toLocaleDateString()}</p>
                                    )}
                                  </div>
                                ))}
                              {project.tasks.filter(task => task.status === 'completed').length === 0 && (
                                <p className="no-tasks-message">No completed tasks yet</p>
                              )}
                            </div>
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
              </>
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

          {/* Create Project Modal */}
          {showCreateModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Create New Project</h3>
                {modalError && (
                  <div className="error-message">
                    {modalError}
                  </div>
                )}
                <form onSubmit={handleCreateProject}>
                  <div className="form-group">
                    <label>Project Name</label>
                    <input
                      type="text"
                      value={newProject.name}
                      onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={newProject.description}
                      onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    />
                  </div>
                  {currentUser?.role === 'president' && (
                    <div className="form-group">
                      <label>Track</label>
                      <select
                        value={newProject.track}
                        onChange={(e) => setNewProject({...newProject, track: e.target.value})}
                        required
                      >
                        <option value="">Select a track</option>
                        <option value="education">Education</option>
                        <option value="consulting">Consulting</option>
                        <option value="tech">Tech</option>
                        <option value="fund">Fund</option>
                      </select>
                    </div>
                  )}
                  <div className="modal-buttons">
                    <button type="submit" className="submit-button">Create</button>
                    <button 
                      type="button" 
                      className="cancel-button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setModalError('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Create Task Modal */}
          {showCreateTaskModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Create New Task</h3>
                {modalError && (
                  <div className="error-message">
                    {modalError}
                  </div>
                )}
                <form onSubmit={handleCreateTask}>
                  <div className="form-group">
                    <label>Task Title</label>
                    <input
                      type="text"
                      value={newTask.title}
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={newTask.description}
                      onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Due Date</label>
                    <input
                      type="date"
                      value={newTask.due_date}
                      onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                    />
                  </div>
                  <div className="modal-buttons">
                    <button type="submit" className="submit-button">Create Task</button>
                    <button 
                      type="button" 
                      className="cancel-button"
                      onClick={() => {
                        setShowCreateTaskModal(false);
                        setModalError('');
                        setSelectedProjectId(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="modal-overlay">
              <div className="confirmation-modal">
                <h3>Delete Project</h3>
                <p>Are you sure you want to delete this project? This action cannot be undone.</p>
                <div className="confirmation-buttons">
                  <button className="confirm-delete-button" onClick={handleDeleteConfirm}>
                    Delete
                  </button>
                  <button className="cancel-delete-button" onClick={handleDeleteCancel}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Task Weight Modal */}
          {showTaskWeightModal && selectedTask && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Set Task Weight</h3>
                <p className="weight-description">
                  Set the relative importance of this task. A higher weight means the task contributes more to the overall project progress.
                </p>
                <div className="form-group">
                  <label>Weight (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={taskWeight}
                    onChange={(e) => setTaskWeight(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                    className="weight-input"
                  />
                </div>
                <div className="modal-buttons">
                  <button
                    className="submit-button"
                    onClick={() => handleUpdateTaskWeight(selectedTask.id, selectedTask.project_id, taskWeight)}
                  >
                    Save
                  </button>
                  <button
                    className="cancel-button"
                    onClick={() => {
                      setShowTaskWeightModal(false);
                      setSelectedTask(null);
                      setTaskWeight(1);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Track Change Modal */}
          {showTrackModal && selectedProjectForTrack && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Change Project Track</h3>
                <div className="form-group">
                  <label>Select New Track</label>
                  <select
                    value={newTrack}
                    onChange={(e) => setNewTrack(e.target.value)}
                    className="track-select"
                  >
                    <option value="education">Education</option>
                    <option value="consulting">Consulting</option>
                    <option value="tech">Tech</option>
                    <option value="fund">Fund</option>
                  </select>
                </div>
                <div className="modal-buttons">
                  <button
                    className="submit-button"
                    onClick={() => handleTrackChange(selectedProjectForTrack.id, newTrack)}
                  >
                    Update Track
                  </button>
                  <button
                    className="cancel-button"
                    onClick={() => {
                      setShowTrackModal(false);
                      setSelectedProjectForTrack(null);
                      setNewTrack('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;