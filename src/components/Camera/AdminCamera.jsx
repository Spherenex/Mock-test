import React, { useState, useEffect } from 'react';
import { Camera, Users, VideoOff, AlertOctagon, Volume2, VolumeX } from 'lucide-react';
import './AdminCamera.css';

export const AdminCamera = ({ results }) => {
  const [activeUsers, setActiveUsers] = useState([]);
  const [expandedUser, setExpandedUser] = useState(null);
  
  // Simulate active test-takers - in a real app, this would be from Firebase
  useEffect(() => {
    // Mock data for active users taking the test
    const mockActiveUsers = results
      .filter((_, idx) => idx < 4) // Just use the first few results as "active" users
      .map(result => ({
        id: Math.random().toString(36).substring(2, 9),
        name: result.user,
        noiseViolations: Math.floor(Math.random() * 3),
        cameraActive: true,
        micActive: true,
        noiseLevel: Math.random() * 100
      }));
      
    setActiveUsers(mockActiveUsers);
    
    // Simulate updates to noise levels
    const interval = setInterval(() => {
      setActiveUsers(prev => prev.map(user => ({
        ...user,
        noiseLevel: Math.min(Math.random() * 100 + (user.noiseViolations * 10), 100)
      })));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [results]);
  
  const handleExpandUser = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };
  
  const handleToggleCamera = (userId) => {
    setActiveUsers(prev => 
      prev.map(user => user.id === userId ? { ...user, cameraActive: !user.cameraActive } : user)
    );
  };
  
  const handleToggleMic = (userId) => {
    setActiveUsers(prev => 
      prev.map(user => user.id === userId ? { ...user, micActive: !user.micActive } : user)
    );
  };
  
  const handleTerminateUser = (userId) => {
    if (window.confirm('Are you sure you want to terminate this user\'s test?')) {
      setActiveUsers(prev => prev.filter(user => user.id !== userId));
    }
  };
  
  const getNoiseStatusClass = (noiseLevel) => {
    if (noiseLevel < 30) return 'noise-low';
    if (noiseLevel < 70) return 'noise-medium';
    return 'noise-high';
  };

  return (
    <div className="admin-camera-container">
      <div className="camera-header">
        <h2 className="camera-title">
          <Camera size={24} />
          Live Monitoring
        </h2>
        <div className="active-count">
          <Users size={18} />
          <span>{activeUsers.length} Active Users</span>
        </div>
      </div>
      
      <div className="camera-grid">
        {activeUsers.length === 0 ? (
          <div className="no-active-users">
            <VideoOff size={48} />
            <p>No active test-takers at the moment</p>
          </div>
        ) : (
          activeUsers.map(user => (
            <div 
              key={user.id} 
              className={`camera-card ${expandedUser === user.id ? 'expanded' : ''}`}
              onClick={() => handleExpandUser(user.id)}
            >
              <div className="camera-feed">
                {user.cameraActive ? (
                  <div className="camera-placeholder">
                    <div className="user-initial">{user.name[0]}</div>
                  </div>
                ) : (
                  <div className="camera-disabled">
                    <VideoOff size={32} />
                    <span>Camera Disabled</span>
                  </div>
                )}
                <div className={`noise-indicator ${getNoiseStatusClass(user.noiseLevel)}`}>
                  <Volume2 size={16} />
                  <div className="noise-level-bar">
                    <div 
                      className="noise-level-fill" 
                      style={{ width: `${user.noiseLevel}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="camera-info">
                <div className="user-details">
                  <h3>{user.name}</h3>
                  {user.noiseViolations > 0 && (
                    <span className="violations-badge">
                      {user.noiseViolations} noise violations
                    </span>
                  )}
                </div>
                
                <div className="camera-controls">
                  <button 
                    className={`control-btn ${user.cameraActive ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleCamera(user.id);
                    }}
                    title={user.cameraActive ? "Disable Camera" : "Enable Camera"}
                  >
                    <Camera size={16} />
                  </button>
                  
                  <button 
                    className={`control-btn ${user.micActive ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleMic(user.id);
                    }}
                    title={user.micActive ? "Mute Microphone" : "Unmute Microphone"}
                  >
                    {user.micActive ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  </button>
                  
                  <button 
                    className="control-btn terminate-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTerminateUser(user.id);
                    }}
                    title="Terminate Test"
                  >
                    <AlertOctagon size={16} />
                  </button>
                </div>
              </div>
              
              {expandedUser === user.id && (
                <div className="expanded-details">
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value">Taking Test</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Time Elapsed:</span>
                    <span className="detail-value">24m 12s</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Current Section:</span>
                    <span className="detail-value">Technical Knowledge</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Questions Completed:</span>
                    <span className="detail-value">12/40</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Tab Violations:</span>
                    <span className="detail-value violation-count">2</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Noise Violations:</span>
                    <span className="detail-value violation-count">{user.noiseViolations}</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};