// import React, { useState, useEffect } from 'react';
// import { Camera, Users, VideoOff, AlertOctagon, Volume2, VolumeX } from 'lucide-react';
// import './AdminCamera.css';

// export const AdminCamera = ({ results }) => {
//   const [activeUsers, setActiveUsers] = useState([]);
//   const [expandedUser, setExpandedUser] = useState(null);
  
//   // Simulate active test-takers - in a real app, this would be from Firebase
//   useEffect(() => {
//     // Mock data for active users taking the test
//     const mockActiveUsers = results
//       .filter((_, idx) => idx < 4) // Just use the first few results as "active" users
//       .map(result => ({
//         id: Math.random().toString(36).substring(2, 9),
//         name: result.user,
//         noiseViolations: Math.floor(Math.random() * 3),
//         cameraActive: true,
//         micActive: true,
//         noiseLevel: Math.random() * 100
//       }));
      
//     setActiveUsers(mockActiveUsers);
    
//     // Simulate updates to noise levels
//     const interval = setInterval(() => {
//       setActiveUsers(prev => prev.map(user => ({
//         ...user,
//         noiseLevel: Math.min(Math.random() * 100 + (user.noiseViolations * 10), 100)
//       })));
//     }, 5000);
    
//     return () => clearInterval(interval);
//   }, [results]);
  
//   const handleExpandUser = (userId) => {
//     setExpandedUser(expandedUser === userId ? null : userId);
//   };
  
//   const handleToggleCamera = (userId) => {
//     setActiveUsers(prev => 
//       prev.map(user => user.id === userId ? { ...user, cameraActive: !user.cameraActive } : user)
//     );
//   };
  
//   const handleToggleMic = (userId) => {
//     setActiveUsers(prev => 
//       prev.map(user => user.id === userId ? { ...user, micActive: !user.micActive } : user)
//     );
//   };
  
//   const handleTerminateUser = (userId) => {
//     if (window.confirm('Are you sure you want to terminate this user\'s test?')) {
//       setActiveUsers(prev => prev.filter(user => user.id !== userId));
//     }
//   };
  
//   const getNoiseStatusClass = (noiseLevel) => {
//     if (noiseLevel < 30) return 'noise-low';
//     if (noiseLevel < 70) return 'noise-medium';
//     return 'noise-high';
//   };

//   return (
//     <div className="admin-camera-container">
//       <div className="camera-header">
//         <h2 className="camera-title">
//           <Camera size={24} />
//           Live Monitoring
//         </h2>
//         <div className="active-count">
//           <Users size={18} />
//           <span>{activeUsers.length} Active Users</span>
//         </div>
//       </div>
      
//       <div className="camera-grid">
//         {activeUsers.length === 0 ? (
//           <div className="no-active-users">
//             <VideoOff size={48} />
//             <p>No active test-takers at the moment</p>
//           </div>
//         ) : (
//           activeUsers.map(user => (
//             <div 
//               key={user.id} 
//               className={`camera-card ${expandedUser === user.id ? 'expanded' : ''}`}
//               onClick={() => handleExpandUser(user.id)}
//             >
//               <div className="camera-feed">
//                 {user.cameraActive ? (
//                   <div className="camera-placeholder">
//                     <div className="user-initial">{user.name[0]}</div>
//                   </div>
//                 ) : (
//                   <div className="camera-disabled">
//                     <VideoOff size={32} />
//                     <span>Camera Disabled</span>
//                   </div>
//                 )}
//                 <div className={`noise-indicator ${getNoiseStatusClass(user.noiseLevel)}`}>
//                   <Volume2 size={16} />
//                   <div className="noise-level-bar">
//                     <div 
//                       className="noise-level-fill" 
//                       style={{ width: `${user.noiseLevel}%` }}
//                     ></div>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="camera-info">
//                 <div className="user-details">
//                   <h3>{user.name}</h3>
//                   {user.noiseViolations > 0 && (
//                     <span className="violations-badge">
//                       {user.noiseViolations} noise violations
//                     </span>
//                   )}
//                 </div>
                
//                 <div className="camera-controls">
//                   <button 
//                     className={`control-btn ${user.cameraActive ? 'active' : ''}`}
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleToggleCamera(user.id);
//                     }}
//                     title={user.cameraActive ? "Disable Camera" : "Enable Camera"}
//                   >
//                     <Camera size={16} />
//                   </button>
                  
//                   <button 
//                     className={`control-btn ${user.micActive ? 'active' : ''}`}
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleToggleMic(user.id);
//                     }}
//                     title={user.micActive ? "Mute Microphone" : "Unmute Microphone"}
//                   >
//                     {user.micActive ? <Volume2 size={16} /> : <VolumeX size={16} />}
//                   </button>
                  
//                   <button 
//                     className="control-btn terminate-btn"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleTerminateUser(user.id);
//                     }}
//                     title="Terminate Test"
//                   >
//                     <AlertOctagon size={16} />
//                   </button>
//                 </div>
//               </div>
              
//               {expandedUser === user.id && (
//                 <div className="expanded-details">
//                   <div className="detail-item">
//                     <span className="detail-label">Status:</span>
//                     <span className="detail-value">Taking Test</span>
//                   </div>
//                   <div className="detail-item">
//                     <span className="detail-label">Time Elapsed:</span>
//                     <span className="detail-value">24m 12s</span>
//                   </div>
//                   <div className="detail-item">
//                     <span className="detail-label">Current Section:</span>
//                     <span className="detail-value">Technical Knowledge</span>
//                   </div>
//                   <div className="detail-item">
//                     <span className="detail-label">Questions Completed:</span>
//                     <span className="detail-value">12/40</span>
//                   </div>
//                   <div className="detail-item">
//                     <span className="detail-label">Tab Violations:</span>
//                     <span className="detail-value violation-count">2</span>
//                   </div>
//                   <div className="detail-item">
//                     <span className="detail-label">Noise Violations:</span>
//                     <span className="detail-value violation-count">{user.noiseViolations}</span>
//                   </div>
//                 </div>
//               )}
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };


import React, { useState, useEffect, useRef } from 'react';
import { Camera, Users, VideoOff, AlertOctagon, Volume2, VolumeX, User } from 'lucide-react';
import rtcService from '../../services/RTCStreamingService';
import './AdminCamera.css';

export const AdminCamera = ({ results }) => {
  const [activeStreams, setActiveStreams] = useState({});
  const [expandedUser, setExpandedUser] = useState(null);
  
  // Initialize RTCService for admin
  useEffect(() => {
    // Initialize as admin
    rtcService.initializeAsAdmin((event) => {
      // This callback is called whenever a stream is added, updated, or removed
      if (event.type === 'add') {
        setActiveStreams(prev => ({
          ...prev,
          [event.userId]: event.data
        }));
      } else if (event.type === 'update') {
        setActiveStreams(prev => ({
          ...prev,
          [event.userId]: {
            ...prev[event.userId],
            ...event.data
          }
        }));
      } else if (event.type === 'remove') {
        setActiveStreams(prev => {
          const newStreams = { ...prev };
          delete newStreams[event.userId];
          return newStreams;
        });
      }
    });
    
    // Cleanup on unmount
    return () => {
      rtcService.cleanupAdminConnections();
    };
  }, []);
  
  const handleExpandUser = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };
  
  const handleToggleCamera = (userId) => {
    // In a real implementation, you would send a message to the student
    // to enable/disable their camera
    console.log(`Toggle camera for ${userId}`);
  };
  
  const handleToggleMic = (userId) => {
    // In a real implementation, you would send a message to the student
    // to enable/disable their microphone
    console.log(`Toggle microphone for ${userId}`);
  };
  
  const handleTerminateUser = (userId) => {
    if (window.confirm('Are you sure you want to terminate this user\'s test?')) {
      rtcService.terminateStudentTest(userId, 'Terminated by administrator');
    }
  };
  
  // Mock video source for testing (when no real camera feed is available)
  const createMockVideoStream = (userId) => {
    // Create a simple canvas to use as mock video source
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    
    // Draw a colored background with the user's initial
    ctx.fillStyle = getRandomColor();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(userId.charAt(0).toUpperCase(), canvas.width/2, canvas.height/2);
    
    // Create a stream from the canvas
    const stream = canvas.captureStream(10); // 10 fps
    return stream;
  };
  
  // Generate a random color for mock video
  const getRandomColor = () => {
    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  const getNoiseStatusClass = (level) => {
    if (level < 30) return 'noise-low';
    if (level < 70) return 'noise-medium';
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
          <span>{Object.keys(activeStreams).length} Active Users</span>
        </div>
      </div>
      
      <div className="camera-grid">
        {Object.keys(activeStreams).length === 0 ? (
          <div className="no-active-users">
            <VideoOff size={48} />
            <p>No active test-takers at the moment</p>
          </div>
        ) : (
          Object.entries(activeStreams).map(([userId, streamData]) => {
            const userDetails = getUserDetails(userId);
            const isExpanded = expandedUser === userId;
            const noiseLevel = Math.random() * 100; // Mock noise level - would come from streamData
            const tabViolations = streamData.violations?.tab || 0;
            const noiseViolations = streamData.violations?.noise || 0;
            
            return (
              <div 
                key={userId} 
                className={`camera-card ${isExpanded ? 'expanded' : ''}`}
                onClick={() => handleExpandUser(userId)}
              >
                <div className="camera-feed">
                  {streamData.stream ? (
                    <video
                      ref={el => {
                        // Set stream on video element when it's available
                        if (el && streamData.stream && el.srcObject !== streamData.stream) {
                          el.srcObject = streamData.stream;
                          el.play().catch(e => console.error('Error playing video:', e));
                        }
                      }}
                      className="video-feed"
                      autoPlay
                      playsInline
                      muted
                    />
                  ) : (
                    <video
                      ref={el => {
                        // Use mock stream when real stream is not available
                        if (el) {
                          const mockStream = getMockVideoStream(userId);
                          if (el.srcObject !== mockStream) {
                            el.srcObject = mockStream;
                            el.play().catch(e => console.error('Error playing mock video:', e));
                          }
                        }
                      }}
                      className="video-feed"
                      autoPlay
                      playsInline
                      muted
                    />
                  )}
                  <div className={`noise-indicator ${getNoiseStatusClass(noiseLevel)}`}>
                    <Volume2 size={16} />
                    <div className="noise-level-bar">
                      <div 
                        className="noise-level-fill" 
                        style={{ width: `${noiseLevel}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="camera-info">
                  <div className="user-details">
                    <h3>{userDetails.user}</h3>
                    {(tabViolations > 0 || noiseViolations > 0) && (
                      <span className="violations-badge">
                        {tabViolations + noiseViolations} violations
                      </span>
                    )}
                  </div>
                  
                  <div className="camera-controls">
                    <button 
                      className={`control-btn ${streamData.stream ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleCamera(userId);
                      }}
                      title={streamData.stream ? "Disable Camera" : "Enable Camera"}
                    >
                      <Camera size={16} />
                    </button>
                    
                    <button 
                      className={`control-btn active`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleMic(userId);
                      }}
                      title="Mute Microphone"
                    >
                      <Volume2 size={16} />
                    </button>
                    
                    <button 
                      className="control-btn terminate-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTerminateUser(userId);
                      }}
                      title="Terminate Test"
                    >
                      <AlertOctagon size={16} />
                    </button>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="expanded-details">
                    <div className="detail-item">
                      <span className="detail-label">Status:</span>
                      <span className="detail-value">Taking Test</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Tab Violations:</span>
                      <span className="detail-value violation-count">{tabViolations}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Noise Violations:</span>
                      <span className="detail-value violation-count">{noiseViolations}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};