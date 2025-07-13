// import React, { useState, useEffect, useRef } from 'react';
// import { Volume2, VolumeX, AlertTriangle } from 'lucide-react';
// import './NoiseMonitor.css';

// export const NoiseMonitor = ({ onNoiseViolation, isTestActive = false }) => {
//   const [isListening, setIsListening] = useState(false);
//   const [noiseLevel, setNoiseLevel] = useState(0);
//   const [micPermission, setMicPermission] = useState('pending'); // 'pending', 'granted', 'denied'
//   const [warning, setWarning] = useState(null);
  
//   const audioContextRef = useRef(null);
//   const analyserRef = useRef(null);
//   const microphoneStreamRef = useRef(null);
//   const warningTimeoutRef = useRef(null);
  
//   // Configuration for noise threshold
//   const NOISE_THRESHOLD = 0.3; // Value between 0 and 1
//   const HIGH_NOISE_THRESHOLD = 0.5; // Higher threshold for severe warnings
//   const WARNING_DURATION = 10000; // Warning display time in ms

//   useEffect(() => {
//     // Only start listening when the test is active
//     if (isTestActive && micPermission === 'granted') {
//       startListening();
//     } else if (!isTestActive && isListening) {
//       stopListening();
//     }
    
//     return () => {
//       stopListening();
//     };
//   }, [isTestActive, micPermission]);
  
//   const requestMicrophoneAccess = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
//       microphoneStreamRef.current = stream;
//       setMicPermission('granted');
//       return stream;
//     } catch (error) {
//       console.error('Error accessing microphone:', error);
//       setMicPermission('denied');
//       return null;
//     }
//   };
  
//   const startListening = async () => {
//     if (!microphoneStreamRef.current) {
//       const stream = await requestMicrophoneAccess();
//       if (!stream) return;
//     }
    
//     try {
//       // Create audio context
//       audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
//       analyserRef.current = audioContextRef.current.createAnalyser();
      
//       // Connect microphone to analyzer
//       const source = audioContextRef.current.createMediaStreamSource(microphoneStreamRef.current);
//       source.connect(analyserRef.current);
      
//       // Configure analyzer
//       analyserRef.current.fftSize = 256;
//       const bufferLength = analyserRef.current.frequencyBinCount;
//       const dataArray = new Uint8Array(bufferLength);
      
//       // Start monitoring
//       setIsListening(true);
      
//       const checkNoiseLevel = () => {
//         if (!analyserRef.current) return;
        
//         analyserRef.current.getByteFrequencyData(dataArray);
        
//         // Calculate average volume level
//         let sum = 0;
//         for (let i = 0; i < bufferLength; i++) {
//           sum += dataArray[i];
//         }
//         const average = sum / bufferLength;
//         const normalizedLevel = average / 255; // Normalize to 0-1
        
//         setNoiseLevel(normalizedLevel);
        
//         // Check if noise exceeds threshold
//         if (normalizedLevel > HIGH_NOISE_THRESHOLD) {
//           handleExcessiveNoise('high');
//         } else if (normalizedLevel > NOISE_THRESHOLD) {
//           handleExcessiveNoise('medium');
//         }
        
//         // Continue monitoring if still listening
//         if (isListening) {
//           requestAnimationFrame(checkNoiseLevel);
//         }
//       };
      
//       requestAnimationFrame(checkNoiseLevel);
      
//     } catch (error) {
//       console.error('Error starting noise monitoring:', error);
//       setIsListening(false);
//     }
//   };
  
//   const stopListening = () => {
//     setIsListening(false);
    
//     // Cleanup audio resources
//     if (analyserRef.current) {
//       analyserRef.current = null;
//     }
    
//     if (audioContextRef.current) {
//       audioContextRef.current.close().catch(console.error);
//       audioContextRef.current = null;
//     }
    
//     if (microphoneStreamRef.current) {
//       microphoneStreamRef.current.getTracks().forEach(track => track.stop());
//       microphoneStreamRef.current = null;
//     }
//   };
  
//   const handleExcessiveNoise = (level) => {
//     // Only create a new warning if there isn't an active one
//     // or if this is a high-level warning (which overrides medium warnings)
//     if (!warning || (level === 'high' && warning.level === 'medium')) {
      
//       // Clear any existing timeout
//       if (warningTimeoutRef.current) {
//         clearTimeout(warningTimeoutRef.current);
//       }
      
//       // Create new warning
//       const newWarning = {
//         id: Date.now(),
//         level,
//         message: level === 'high' 
//           ? 'Extremely loud noise detected! Please reduce background noise immediately.'
//           : 'Background noise detected. Please find a quieter environment.',
//       };
      
//       setWarning(newWarning);
      
//       // Notify parent component
//       if (onNoiseViolation) {
//         onNoiseViolation(level);
//       }
      
//       // Auto-clear warning after delay
//       warningTimeoutRef.current = setTimeout(() => {
//         setWarning(null);
//         warningTimeoutRef.current = null;
//       }, WARNING_DURATION);
//     }
//   };
  
//   const getNoiseLevelClass = () => {
//     if (noiseLevel < NOISE_THRESHOLD * 0.7) return 'low';
//     if (noiseLevel < NOISE_THRESHOLD) return 'moderate';
//     if (noiseLevel < HIGH_NOISE_THRESHOLD) return 'elevated';
//     return 'high';
//   };
  
//   // If microphone permission is still pending, show request button
//   if (micPermission === 'pending') {
//     return (
//       <div className="noise-monitor-container">
//         <p className="mic-request-message">
//           This test requires microphone access to monitor noise levels
//         </p>
//         <button 
//           className="mic-request-button"
//           onClick={requestMicrophoneAccess}
//         >
//           Allow Microphone Access
//         </button>
//       </div>
//     );
//   }
  
//   // If microphone permission is denied, show error
//   if (micPermission === 'denied') {
//     return (
//       <div className="noise-monitor-container error">
//         <AlertTriangle size={24} />
//         <div className="mic-error-message">
//           <p>Microphone access denied</p>
//           <p className="mic-error-detail">
//             You must allow microphone access to take this test. Please refresh the page and try again.
//           </p>
//         </div>
//       </div>
//     );
//   }
  
//   return (
//     <>
//       <div className="noise-monitor-container">
//         <div className="noise-monitor-icon">
//           {isListening ? <Volume2 size={18} /> : <VolumeX size={18} />}
//         </div>
//         <div className="noise-level-container">
//           <div className="noise-level-indicator">
//             <div 
//               className={`noise-level-bar ${getNoiseLevelClass()}`}
//               style={{ width: `${noiseLevel * 100}%` }}
//             ></div>
//           </div>
//           <div className="noise-status">
//             Noise {isListening ? 'Monitoring Active' : 'Monitor Inactive'}
//           </div>
//         </div>
//       </div>
      
//       {warning && (
//         <div className={`noise-warning ${warning.level}`}>
//           <AlertTriangle size={20} />
//           <span>{warning.message}</span>
//         </div>
//       )}
//     </>
//   );
// };




import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, AlertTriangle } from 'lucide-react';
import './NoiseMonitor.css';

export const NoiseMonitor = ({ onNoiseViolation, isTestActive = false, onMicEnabled = () => {} }) => {
  const [isListening, setIsListening] = useState(false);
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [micPermission, setMicPermission] = useState('pending'); // 'pending', 'granted', 'denied'
  const [warning, setWarning] = useState(null);
  
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneStreamRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  
  // Configuration for noise threshold
  const NOISE_THRESHOLD = 0.3; // Value between 0 and 1
  const HIGH_NOISE_THRESHOLD = 0.5; // Higher threshold for severe warnings
  const WARNING_DURATION = 10000; // Warning display time in ms

  useEffect(() => {
    // Only start listening when the test is active
    if (isTestActive && micPermission === 'granted') {
      startListening();
    } else if (!isTestActive && isListening) {
      stopListening();
    }
    
    return () => {
      stopListening();
    };
  }, [isTestActive, micPermission]);
  
  const requestMicrophoneAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      microphoneStreamRef.current = stream;
      setMicPermission('granted');
      onMicEnabled(true); // Notify parent that mic is enabled
      return stream;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setMicPermission('denied');
      onMicEnabled(false); // Notify parent that mic is disabled
      return null;
    }
  };
  
  const startListening = async () => {
    if (!microphoneStreamRef.current) {
      const stream = await requestMicrophoneAccess();
      if (!stream) return;
    }
    
    try {
      // Create audio context
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      // Connect microphone to analyzer
      const source = audioContextRef.current.createMediaStreamSource(microphoneStreamRef.current);
      source.connect(analyserRef.current);
      
      // Configure analyzer
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      // Start monitoring
      setIsListening(true);
      
      const checkNoiseLevel = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calculate average volume level
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalizedLevel = average / 255; // Normalize to 0-1
        
        setNoiseLevel(normalizedLevel);
        
        // Check if noise exceeds threshold
        if (normalizedLevel > HIGH_NOISE_THRESHOLD) {
          handleExcessiveNoise('high');
        } else if (normalizedLevel > NOISE_THRESHOLD) {
          handleExcessiveNoise('medium');
        }
        
        // Continue monitoring if still listening
        if (isListening) {
          requestAnimationFrame(checkNoiseLevel);
        }
      };
      
      requestAnimationFrame(checkNoiseLevel);
      
    } catch (error) {
      console.error('Error starting noise monitoring:', error);
      setIsListening(false);
    }
  };
  
  const stopListening = () => {
    setIsListening(false);
    
    // Cleanup audio resources
    if (analyserRef.current) {
      analyserRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
    
    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach(track => track.stop());
      microphoneStreamRef.current = null;
    }
  };
  
  const handleExcessiveNoise = (level) => {
    // Only create a new warning if there isn't an active one
    // or if this is a high-level warning (which overrides medium warnings)
    if (!warning || (level === 'high' && warning.level === 'medium')) {
      
      // Clear any existing timeout
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      
      // Create new warning
      const newWarning = {
        id: Date.now(),
        level,
        message: level === 'high' 
          ? 'Extremely loud noise detected! Please reduce background noise immediately.'
          : 'Background noise detected. Please find a quieter environment.',
      };
      
      setWarning(newWarning);
      
      // Notify parent component (after brief delay to skip initial mic setup)
      if (onNoiseViolation && isListening && microphoneStreamRef.current) {
        // If we've just started listening (first 5 seconds), don't count as violation
        const hasBeenListeningAWhile = audioContextRef.current && 
          (Date.now() - audioContextRef.current.currentTime * 1000 > 5000);
          
        if (hasBeenListeningAWhile) {
          onNoiseViolation(level);
        }
      }
      
      // Auto-clear warning after delay
      warningTimeoutRef.current = setTimeout(() => {
        setWarning(null);
        warningTimeoutRef.current = null;
      }, WARNING_DURATION);
    }
  };
  
  const getNoiseLevelClass = () => {
    if (noiseLevel < NOISE_THRESHOLD * 0.7) return 'low';
    if (noiseLevel < NOISE_THRESHOLD) return 'moderate';
    if (noiseLevel < HIGH_NOISE_THRESHOLD) return 'elevated';
    return 'high';
  };
  
  // If microphone permission is still pending, show request button
  if (micPermission === 'pending') {
    return (
      <div className="noise-monitor-container">
        <p className="mic-request-message">
          This test requires microphone access to monitor noise levels
        </p>
        <button 
          className="mic-request-button"
          onClick={requestMicrophoneAccess}
        >
          Allow Microphone Access
        </button>
      </div>
    );
  }
  
  // If microphone permission is denied, show error
  if (micPermission === 'denied') {
    return (
      <div className="noise-monitor-container error">
        <AlertTriangle size={24} />
        <div className="mic-error-message">
          <p>Microphone access denied</p>
          <p className="mic-error-detail">
            You must allow microphone access to take this test. Please refresh the page and try again.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="noise-monitor-container">
        <div className="noise-monitor-icon">
          {isListening ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </div>
        <div className="noise-level-container">
          <div className="noise-level-indicator">
            <div 
              className={`noise-level-bar ${getNoiseLevelClass()}`}
              style={{ width: `${noiseLevel * 100}%` }}
            ></div>
          </div>
          <div className="noise-status">
            Noise {isListening ? 'Monitoring Active' : 'Monitor Inactive'}
          </div>
        </div>
      </div>
      
      {warning && (
        <div className={`noise-warning ${warning.level}`}>
          <AlertTriangle size={20} />
          <span>{warning.message}</span>
        </div>
      )}
    </>
  );
};