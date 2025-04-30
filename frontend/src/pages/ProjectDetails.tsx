import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './ProjectDetails.css';

interface Task {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  created_at: string;
}

interface Project {
  id: number;
  name: string;
  description: string | null;
  client: string;
  track: string;
  created_at: string;
  tasks: Task[];
}

interface User {
  user_id: number;
  username: string;
  email: string;
  role: string;
  track: string;
}

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch project details
        const projectResponse = await axios.get(`http://localhost:3001/api/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch user info
        const userResponse = await axios.get('http://localhost:3001/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setProject(projectResponse.data);
        setCurrentUser(userResponse.data.user);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching project details:', error);
        setError('Failed to load project details. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, navigate]);

  // Calculate project progress
  const calculateProgress = (project: Project) => {
    if (project.tasks.length === 0) return 0;
    
    const completedTasks = project.tasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="project-detail-container">
        <div className="loading-container">
          <p>Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="project-detail-container">
        <div className="error-container">
          <p className="error-message">{error || 'Project not found'}</p>
          <button 
            className="back-button"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const progress = calculateProgress(project);

  return (
    <div className="project-detail-container">
      <div className="project-detail-header">
        <div className="header-content">
          <h1>{project.name}</h1>
          <button 
            className="back-button"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
        <div className="project-info">
          <div className="info-item">
            <span className="info-label">Client:</span>
            <span className="info-value">{project.client}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Track:</span>
            <span className="info-value">{project.track}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Created:</span>
            <span className="info-value">{formatDate(project.created_at)}</span>
          </div>
        </div>
        {project.description && (
          <div className="project-description">
            <h3>Description</h3>
            <p>{project.description}</p>
          </div>
        )}
      </div>

      <div className="project-progress-section">
        <h2>Project Progress</h2>
        <div className="progress-container">
          <div className="progress-bar-bg">
            <div 
              className="progress-bar"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="progress-info">
            <span>{progress}%</span>
            <span>{project.tasks.filter(task => task.status === 'completed').length} of {project.tasks.length} tasks completed</span>
          </div>
        </div>
      </div>

      <div className="project-tasks-section">
        <div className="tasks-header">
          <h2>Tasks</h2>
          {currentUser?.role === 'admin' && (
            <button 
              className="add-task-button"
              onClick={() => navigate(`/project/${projectId}/add-task`)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Task
            </button>
          )}
        </div>

        {project.tasks.length === 0 ? (
          <div className="no-tasks-message">
            <p>No tasks found for this project.</p>
            {currentUser?.role === 'admin' && (
              <button 
                className="add-task-button"
                onClick={() => navigate(`/project/${projectId}/add-task`)}
              >
                Add First Task
              </button>
            )}
          </div>
        ) : (
          <div className="tasks-list">
            {project.tasks.map(task => (
              <div key={task.id} className={`task-card ${task.status}`}>
                <div className="task-header">
                  <h3 className="task-title">{task.title}</h3>
                  <span className={`task-status status-${task.status}`}>
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </span>
                </div>
                
                {task.description && (
                  <p className="task-description">{task.description}</p>
                )}
                
                <div className="task-footer">
                  {task.due_date && (
                    <div className="task-due-date">
                      <span className="due-label">Due:</span>
                      <span className="due-value">{formatDate(task.due_date)}</span>
                    </div>
                  )}
                  
                  {currentUser?.role === 'admin' && (
                    <div className="task-actions">
                      <button 
                        className="action-button edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/project/${projectId}/task/${task.id}/edit`);
                        }}
                      >
                        Edit
                      </button>
                      {task.status !== 'completed' ? (
                        <button 
                          className="action-button complete"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              const token = localStorage.getItem('token');
                              await axios.put(
                                `http://localhost:3001/api/projects/tasks/${task.id}`,
                                { status: 'completed' },
                                { headers: { Authorization: `Bearer ${token}` } }
                              );
                              // Refresh project data
                              const response = await axios.get(`http://localhost:3001/api/projects/${projectId}`, {
                                headers: { Authorization: `Bearer ${token}` }
                              });
                              setProject(response.data);
                            } catch (error) {
                              console.error('Error updating task:', error);
                            }
                          }}
                        >
                          Mark Complete
                        </button>
                      ) : (
                        <button 
                          className="action-button reopen"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              const token = localStorage.getItem('token');
                              await axios.put(
                                `http://localhost:3001/api/projects/tasks/${task.id}`,
                                { status: 'pending' },
                                { headers: { Authorization: `Bearer ${token}` } }
                              );
                              // Refresh project data
                              const response = await axios.get(`http://localhost:3001/api/projects/${projectId}`, {
                                headers: { Authorization: `Bearer ${token}` }
                              });
                              setProject(response.data);
                            } catch (error) {
                              console.error('Error updating task:', error);
                            }
                          }}
                        >
                          Reopen
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;