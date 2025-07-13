// import React, { useState, useEffect, useRef } from 'react';
// import { Camera, CameraOff, RefreshCw } from 'lucide-react';
// import './CameraCapture.css';

// export const CameraCapture = ({ isTestActive = false, onCameraStream = () => {} }) => {
//   const [cameraPermission, setCameraPermission] = useState('pending'); // 'pending', 'granted', 'denied'
//   const [isCameraActive, setIsCameraActive] = useState(false);
//   const [cameraError, setCameraError] = useState(null);
  
//   const videoRef = useRef(null);
//   const streamRef = useRef(null);
  
//   // Start camera when test becomes active
//   useEffect(() => {
//     if (isTestActive && cameraPermission === 'granted' && !isCameraActive) {
//       startCamera();
//     } else if (!isTestActive && isCameraActive) {
//       stopCamera();
//     }
    
//     return () => {
//       stopCamera();
//     };
//   }, [isTestActive, cameraPermission]);
  
//   const requestCameraAccess = async () => {
//     setCameraError(null);
    
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ 
//         video: { 
//           width: { ideal: 640 },
//           height: { ideal: 480 },
//           facingMode: "user"
//         }
//       });
      
//       streamRef.current = stream;
//       setCameraPermission('granted');
//       return stream;
//     } catch (error) {
//       console.error('Error accessing camera:', error);
//       setCameraPermission('denied');
//       setCameraError(error.message || 'Could not access camera');
//       return null;
//     }
//   };
  
//   const startCamera = async () => {
//     if (!streamRef.current) {
//       const stream = await requestCameraAccess();
//       if (!stream) return;
//     }
    
//     try {
//       if (videoRef.current) {
//         videoRef.current.srcObject = streamRef.current;
//         videoRef.current.onloadedmetadata = () => {
//           videoRef.current.play().catch(error => {
//             console.error('Error playing video:', error);
//           });
//         };
        
//         setIsCameraActive(true);
//         onCameraStream(streamRef.current);
//       }
//     } catch (error) {
//       console.error('Error starting camera:', error);
//       setCameraError(error.message || 'Failed to start camera');
//     }
//   };
  
//   const stopCamera = () => {
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach(track => track.stop());
//       streamRef.current = null;
//     }
    
//     if (videoRef.current) {
//       videoRef.current.srcObject = null;
//     }
    
//     setIsCameraActive(false);
//     onCameraStream(null);
//   };
  
//   const retryCamera = () => {
//     stopCamera();
//     setCameraPermission('pending');
//     setCameraError(null);
//     requestCameraAccess();
//   };
  
//   // If camera permission is still pending, show request button
//   if (cameraPermission === 'pending') {
//     return (
//       <div className="camera-capture-container">
//         <div className="camera-placeholder">
//           <Camera size={48} />
//           <p>This test requires camera access for proctoring</p>
//           <button 
//             className="camera-request-button"
//             onClick={requestCameraAccess}
//           >
//             Enable Camera
//           </button>
//         </div>
//       </div>
//     );
//   }
  
//   // If camera permission is denied, show error
//   if (cameraPermission === 'denied') {
//     return (
//       <div className="camera-capture-container">
//         <div className="camera-error">
//           <CameraOff size={48} />
//           <h3>Camera Access Denied</h3>
//           <p>{cameraError || 'You must allow camera access to take this test'}</p>
//           <button className="camera-retry-button" onClick={retryCamera}>
//             <RefreshCw size={16} />
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }
  
//   return (
//     <div className="camera-capture-container">
//       <div className="camera-header">
//         <div className="camera-status">
//           <Camera size={16} />
//           <span>Camera {isCameraActive ? 'Active' : 'Inactive'}</span>
//         </div>
//       </div>
      
//       <div className="camera-preview">
//         <video
//           ref={videoRef}
//           className="camera-video"
//           autoPlay
//           playsInline
//           muted
//         />
        
//         {!isCameraActive && (
//           <div className="camera-overlay">
//             <CameraOff size={32} />
//             <p>Camera is not active</p>
//           </div>
//         )}
//       </div>
      
//       <div className="camera-footer">
//         <p className="camera-notice">
//           Your camera feed is being monitored for test integrity
//         </p>
//       </div>
//     </div>
//   );
// };



import React, { useState, useEffect, useRef } from 'react';
import { Camera, CameraOff, RefreshCw } from 'lucide-react';
import './CameraCapture.css';

export const CameraCapture = ({ isTestActive = false, onCameraStream = () => {} }) => {
  const [cameraPermission, setCameraPermission] = useState('pending'); // 'pending', 'granted', 'denied'
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  
  // Start camera when test becomes active
  useEffect(() => {
    if (isTestActive && cameraPermission === 'granted' && !isCameraActive) {
      startCamera();
    } else if (!isTestActive && isCameraActive) {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isTestActive, cameraPermission]);
  
  const requestCameraAccess = async () => {
    setCameraError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        }
      });
      
      streamRef.current = stream;
      setCameraPermission('granted');
      return stream;
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraPermission('denied');
      setCameraError(error.message || 'Could not access camera');
      return null;
    }
  };
  
  const startCamera = async () => {
    if (!streamRef.current) {
      const stream = await requestCameraAccess();
      if (!stream) return;
    }
    
    try {
      if (videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(error => {
            console.error('Error playing video:', error);
          });
        };
        
        setIsCameraActive(true);
        onCameraStream(streamRef.current); // Only send stream to parent once active
      }
    } catch (error) {
      console.error('Error starting camera:', error);
      setCameraError(error.message || 'Failed to start camera');
    }
  };
  
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraActive(false);
    onCameraStream(null);
  };
  
  const retryCamera = () => {
    stopCamera();
    setCameraPermission('pending');
    setCameraError(null);
    requestCameraAccess();
  };
  
  // If camera permission is still pending, show request button
  if (cameraPermission === 'pending') {
    return (
      <div className="camera-capture-container">
        <div className="camera-placeholder">
          <Camera size={48} />
          <p>This test requires camera access for proctoring</p>
          <button 
            className="camera-request-button"
            onClick={requestCameraAccess}
          >
            Enable Camera
          </button>
        </div>
      </div>
    );
  }
  
  // If camera permission is denied, show error
  if (cameraPermission === 'denied') {
    return (
      <div className="camera-capture-container">
        <div className="camera-error">
          <CameraOff size={48} />
          <h3>Camera Access Denied</h3>
          <p>{cameraError || 'You must allow camera access to take this test'}</p>
          <button className="camera-retry-button" onClick={retryCamera}>
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="camera-capture-container">
      <div className="camera-header">
        <div className="camera-status">
          <Camera size={16} />
          <span>Camera {isCameraActive ? 'Active' : 'Inactive'}</span>
        </div>
      </div>
      
      <div className="camera-preview">
        <video
          ref={videoRef}
          className="camera-video"
          autoPlay
          playsInline
          muted
        />
        
        {!isCameraActive && (
          <div className="camera-overlay">
            <CameraOff size={32} />
            <p>Camera is not active</p>
          </div>
        )}
      </div>
      
      <div className="camera-footer">
        <p className="camera-notice">
          Your camera feed is being monitored for test integrity
        </p>
      </div>
    </div>
  );
};