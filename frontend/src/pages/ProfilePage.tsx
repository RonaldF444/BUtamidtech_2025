import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProfilePage.css';
import { Link } from 'react-router-dom';

interface User {
  user_id: number;
  username: string;
  email: string;
  role: string;
  track: string;
  created_at: string;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  console.log("ProfilePage rendering - Initial state:", { loading, error, user });

  useEffect(() => {
    console.log("ProfilePage useEffect running");
    
    const fetchUserProfile = async () => {
      try {
        console.log("Starting to fetch user profile");
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.log("No token found, redirecting to login");
          window.location.href = '/login';
          return;
        }

        console.log("Fetching profile with token:", token.substring(0, 10) + "...");
        
        const response = await axios.get('http://localhost:3001/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log("Profile data received:", response.data);
        setUser(response.data.user);
        setLoading(false);
        console.log("State updated: loading=false, user=", response.data.user);
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Response data:', error.response.data);
          console.error('Status code:', error.response.status);
          setError(
            error.response.data.message || 
            error.response.data.error || 
            `Server error: ${error.response.status}`
          );
        } else if (error.request) {
          // The request was made but no response was received
          console.error('No response received:', error.request);
          setError('No response from server. Please check if the backend is running.');
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Request error:', error.message);
          setError(`Request error: ${error.message}`);
        }
        
        setLoading(false);
        console.log("State updated after error: loading=false, error=", error);
      }
    };

    fetchUserProfile();
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  console.log("ProfilePage before render conditions:", { loading, error, user });

  if (loading) {
    console.log("Rendering loading state");
    return (
      <div className="user-profile-container">
        <div className="loading-spinner">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    console.log("Rendering error state:", error);
    return (
      <div className="user-profile-container">
        <div className="error-message">{error}</div>
        <div className="profile-actions">
          <button 
            className="action-button primary"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
          <Link to="/dashboard" className="action-button secondary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log("User is null, rendering fallback");
    return (
      <div className="user-profile-container">
        <div className="error-message">No user data available. Please try again.</div>
        <div className="profile-actions">
          <button 
            className="action-button primary"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
          <Link to="/dashboard" className="action-button secondary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  console.log("Rendering profile content for user:", user);
  return (
    <div className="user-profile-container">
      <header className="profile-header">
        <h1>Profile</h1>
      </header>
      
      <div className="profile-card">
        <div className="profile-avatar">
          {user.username.charAt(0).toUpperCase()}
        </div>
        
        <div className="profile-details">
          <h2 className="profile-name">{user.username}</h2>
          <p className="profile-email">{user.email}</p>
          
          <div className="profile-info-grid">
            <div className="profile-info-row">
              <div className="info-label">Track</div>
              <div className="info-value">{user.track || 'Not specified'}</div>
            </div>
            
            <div className="profile-info-row">
              <div className="info-label">Role</div>
              <div className="info-value">
                <span className={`role-badge ${user.role}`}>
                  {user.role || 'Member'}
                </span>
              </div>
            </div>
            
            <div className="profile-info-row">
              <div className="info-label">Member Since</div>
              <div className="info-value">
                {user.created_at ? formatDate(user.created_at) : 'Unknown'}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="profile-actions">
        <button className="action-button primary">Edit Profile</button>
        <Link to="/dashboard" className="action-button secondary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default ProfilePage;