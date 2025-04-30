import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './CreateProject.css';

interface User {
  user_id: number;
  username: string;
  email: string;
  role: string;
  track: string;
}

// Define available tracks
const AVAILABLE_TRACKS = [
  'education',
  'consulting',
  'technology',
  'finance',
];

const CreateProject: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [client, setClient] = useState('');
  const [track, setTrack] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:3001/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setCurrentUser(response.data.user);
        
        // Set default track to user's track
        if (response.data.user.track) {
          setTrack(response.data.user.track);
        }
        
        // Redirect if not admin
        if (response.data.user.role !== 'admin') {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        navigate('/dashboard');
      }
    };

    fetchUserInfo();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !client.trim() || !track) {
      setError('Project name, client, and track are required fields');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      await axios.post(
        'http://localhost:3001/api/projects',
        { 
          name, 
          description,
          client,
          track
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error creating project:', error);
      setError(error.response?.data?.error || 'Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="create-project-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  // Only render for admins
  if (currentUser.role !== 'admin') {
    return (
      <div className="create-project-container">
        <div className="error-message">
          You don't have permission to access this page.
        </div>
        <Link to="/dashboard" className="back-button">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="create-project-container">
      <div className="create-project-card">
        <div className="create-project-header">
          <h1>Create New Project</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="create-project-form">
          <div className="form-group">
            <label htmlFor="name">Project Name <span className="required">*</span></label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter project name"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="client">Client <span className="required">*</span></label>
            <input
              type="text"
              id="client"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              required
              placeholder="Enter client name"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="track">Track <span className="required">*</span></label>
            <select
              id="track"
              value={track}
              onChange={(e) => setTrack(e.target.value)}
              required
              disabled={loading}
            >
              <option value="" disabled>Select a track</option>
              {AVAILABLE_TRACKS.map((trackOption) => (
                <option key={trackOption} value={trackOption}>
                  {trackOption.charAt(0).toUpperCase() + trackOption.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description"
              rows={4}
              disabled={loading}
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => navigate('/dashboard')}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading || !name.trim() || !client.trim() || !track}
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;