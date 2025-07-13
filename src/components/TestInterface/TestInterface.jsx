// import React, { useState, useEffect, useRef } from 'react';
// import { Clock, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
// import { QUESTIONS } from '../../data/constants';
// import { NoiseMonitor } from '../Noise/NoiseMonitor';
// import { CameraCapture } from '../Camera/CameraCapture';
// import './TestInterface.css';

// const TEST_STAGES = {
//     INSTRUCTIONS: 'instructions',
//     CONFIRMATION: 'confirmation',
//     DEVICE_SETUP: 'device_setup',  // New stage for camera/mic setup
//     TEST: 'test',
//     REVIEW: 'review',
//     SUBMIT_CONFIRMATION: 'submit_confirmation',
//     COMPLETED: 'completed',
//     TERMINATED: 'terminated'
// };

// // Helper function to shuffle array using Fisher-Yates algorithm
// const shuffleArray = (array) => {
//     const shuffled = [...array];
//     for (let i = shuffled.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
//     }
//     return shuffled;
// };

// export const TestInterface = ({ user, onComplete }) => {
//     const [stage, setStage] = useState(TEST_STAGES.INSTRUCTIONS);
//     const [currentQuestion, setCurrentQuestion] = useState(0);
//     const [answers, setAnswers] = useState({});
//     const [timeRemaining, setTimeRemaining] = useState(60 * 60);
//     const [hasReadInstructions, setHasReadInstructions] = useState(false);
//     const [sectionProgress, setSectionProgress] = useState({
//         technical: 0,
//         aptitude: 0,
//         logical: 0,
//         personality: 0
//     });
//     const [tabViolationCount, setTabViolationCount] = useState(0);
//     const [noiseViolationCount, setNoiseViolationCount] = useState(0);
//     const [showWarning, setShowWarning] = useState(false);
//     const [warningType, setWarningType] = useState('tab'); // 'tab' or 'noise'
//     const [isTerminated, setIsTerminated] = useState(false);
//     const [terminationReason, setTerminationReason] = useState('');
    
//     // Device setup state - these were missing
//     const [cameraEnabled, setCameraEnabled] = useState(false);
//     const [micEnabled, setMicEnabled] = useState(false);
    
//     const warningTimeoutRef = useRef(null);
//     const cameraStreamRef = useRef(null);
    
//     // State for shuffled questions
//     const [shuffledQuestions, setShuffledQuestions] = useState([]);
    
//     // Track original section for each question
//     const [questionSections, setQuestionSections] = useState({});

//     // Initialize shuffled questions when component mounts
//     useEffect(() => {
//         // Group questions by section (each section has 10 questions)
//         const sections = {
//             technical: QUESTIONS.slice(0, 10),
//             aptitude: QUESTIONS.slice(10, 20),
//             logical: QUESTIONS.slice(20, 30),
//             personality: QUESTIONS.slice(30, 40)
//         };
        
//         // Create mapping of question IDs to their sections
//         const sectionMap = {};
//         Object.entries(sections).forEach(([sectionName, questions]) => {
//             questions.forEach(q => {
//                 sectionMap[q.id] = sectionName;
//             });
//         });
//         setQuestionSections(sectionMap);
        
//         // Shuffle each section separately
//         const shuffledSections = {
//             technical: shuffleArray(sections.technical),
//             aptitude: shuffleArray(sections.aptitude),
//             logical: shuffleArray(sections.logical),
//             personality: shuffleArray(sections.personality)
//         };
        
//         // Combine all shuffled sections
//         const allShuffled = [
//             ...shuffledSections.technical,
//             ...shuffledSections.aptitude,
//             ...shuffledSections.logical,
//             ...shuffledSections.personality
//         ];
        
//         setShuffledQuestions(allShuffled);
//     }, []);

//     const playAlertSound = () => {
//         const audio = new Audio('https://www.soundjay.com/buttons/beep-01a.mp3');
//         audio.play().catch(error => console.log('Audio playback failed:', error));
//     };

//     // Track if we're in permission granting phase
//     const [isPermissionPhase, setIsPermissionPhase] = useState(false);
    
//     // Set permission phase when test stage changes
//     useEffect(() => {
//         if (stage === TEST_STAGES.TEST) {
//             // Initially in permission phase when test starts
//             setIsPermissionPhase(true);
            
//             // After 5 seconds, we assume permission phase is done
//             const timer = setTimeout(() => {
//                 setIsPermissionPhase(false);
//             }, 5000);
            
//             return () => clearTimeout(timer);
//         }
//     }, [stage]);
    
//     // Update when camera stream is available (permissions granted)
//     const handleCameraStream = (stream) => {
//         cameraStreamRef.current = stream;
//         if (stream) {
//             // When camera stream is available, permission phase is done
//             setIsPermissionPhase(false);
//         }
//     };
    
//     useEffect(() => {
//         const handleFocus = () => {
//             // Only clear warning when returning if timer is done
//             if (!warningTimeoutRef.current) {
//                 setShowWarning(false);
//             }
//         };

//         const handleBlur = () => {
//             // Don't count violations during permission phase
//             if (stage === TEST_STAGES.TEST && !isPermissionPhase) {
//                 setTabViolationCount(prev => prev + 1);
//                 setWarningType('tab');
//                 setShowWarning(true);
//                 playAlertSound();

//                 // Clear any existing timeout
//                 if (warningTimeoutRef.current) {
//                     clearTimeout(warningTimeoutRef.current);
//                 }

//                 // Set new 10-second timeout
//                 warningTimeoutRef.current = setTimeout(() => {
//                     setShowWarning(false);
//                     warningTimeoutRef.current = null;
//                 }, 10000);
                
//                 // Terminate test after 3 tab violations
//                 if (tabViolationCount >= 2) {
//                     handleTerminate('tab');
//                 }
//             }
//         };

//         window.addEventListener('focus', handleFocus);
//         window.addEventListener('blur', handleBlur);

//         const handleContextMenu = (e) => {
//             if (stage === TEST_STAGES.TEST) e.preventDefault();
//         };

//         const handleKeyDown = (e) => {
//             // Don't count violations during permission phase
//             if (stage === TEST_STAGES.TEST && !isPermissionPhase) {
//                 if ((e.ctrlKey && (e.key === 't' || e.key === 'n' || e.key === 'w')) ||
//                     e.key === 'F11' ||
//                     (e.altKey && e.key === 'Tab')) {
//                     e.preventDefault();
//                     setTabViolationCount(prev => prev + 1);
//                     setWarningType('tab');
//                     setShowWarning(true);
//                     playAlertSound();

//                     if (warningTimeoutRef.current) {
//                         clearTimeout(warningTimeoutRef.current);
//                     }

//                     warningTimeoutRef.current = setTimeout(() => {
//                         setShowWarning(false);
//                         warningTimeoutRef.current = null;
//                     }, 10000);
                    
//                     // Terminate test after 3 tab violations
//                     if (tabViolationCount >= 2) {
//                         handleTerminate('tab');
//                     }
//                 }
//             }
//         };

//         document.addEventListener('contextmenu', handleContextMenu);
//         document.addEventListener('keydown', handleKeyDown);

//         return () => {
//             window.removeEventListener('focus', handleFocus);
//             window.removeEventListener('blur', handleBlur);
//             document.removeEventListener('contextmenu', handleContextMenu);
//             document.removeEventListener('keydown', handleKeyDown);
//             if (warningTimeoutRef.current) {
//                 clearTimeout(warningTimeoutRef.current);
//             }
//         };
//     }, [stage, tabViolationCount, isPermissionPhase]);

//     useEffect(() => {
//         if (stage === TEST_STAGES.TEST) {
//             const timer = setInterval(() => {
//                 setTimeRemaining(prev => {
//                     if (prev <= 0) {
//                         clearInterval(timer);
//                         handleTimeUp();
//                         return 0;
//                     }
//                     return prev - 1;
//                 });
//             }, 1000);
//             return () => clearInterval(timer);
//         }
//     }, [stage]);

//     const formatTime = (seconds) => {
//         const minutes = Math.floor(seconds / 60);
//         const remainingSeconds = seconds % 60;
//         return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
//     };

//     const handleTimeUp = () => {
//         handleSubmit(true);
//     };
    
//     const handleNoiseViolation = (level) => {
//         // Track noise violations
//         setNoiseViolationCount(prev => prev + 1);
//         setWarningType('noise');
//         setShowWarning(true);
        
//         // Clear any existing timeout
//         if (warningTimeoutRef.current) {
//             clearTimeout(warningTimeoutRef.current);
//         }
        
//         // Set new 10-second timeout for the warning
//         warningTimeoutRef.current = setTimeout(() => {
//             setShowWarning(false);
//             warningTimeoutRef.current = null;
//         }, 10000);
        
//         // Terminate test after 3 high noise violations
//         if (level === 'high' && noiseViolationCount >= 2) {
//             handleTerminate('noise');
//         }
//     };
    
//     const handleTerminate = (reason) => {
//         // Cleanup any media streams
//         if (cameraStreamRef.current) {
//             cameraStreamRef.current.getTracks().forEach(track => track.stop());
//         }
        
//         // Set termination reason
//         let reasonText = '';
//         switch(reason) {
//             case 'tab':
//                 reasonText = 'Excessive tab violations detected';
//                 break;
//             case 'noise':
//                 reasonText = 'Excessive noise violations detected';
//                 break;
//             default:
//                 reasonText = 'Test integrity violation detected';
//         }
        
//         setTerminationReason(reasonText);
//         setIsTerminated(true);
//         setStage(TEST_STAGES.TERMINATED);
        
//         // Submit the test with termination status
//         const result = {
//             user: user.name,
//             score: 0,
//             timeSpent: 3600 - timeRemaining,
//             answers,
//             sections: {
//                 technical: 0,
//                 aptitude: 0, 
//                 logical: 0,
//                 personality: 0
//             },
//             submittedBy: 'terminated',
//             violations: tabViolationCount,
//             noiseViolations: noiseViolationCount,
//             terminationReason: reasonText
//         };
        
//         onComplete(result);
//     };

//     const handleAnswer = (questionId, selectedOption) => {
//         setAnswers(prevAnswers => {
//             const newAnswers = {
//                 ...prevAnswers,
//                 [questionId]: selectedOption
//             };
            
//             // Get the section for this question from our mapping
//             const questionSection = questionSections[questionId];
            
//             // Count answered questions for each section
//             const sectionCounts = {
//                 technical: 0,
//                 aptitude: 0,
//                 logical: 0,
//                 personality: 0
//             };
            
//             // Count how many questions have been answered in each section
//             Object.keys(newAnswers).forEach(qId => {
//                 const section = questionSections[qId];
//                 if (section) {
//                     sectionCounts[section]++;
//                 }
//             });
            
//             // Update progress for each section
//             const updatedProgress = {
//                 technical: (sectionCounts.technical / 10) * 100,
//                 aptitude: (sectionCounts.aptitude / 10) * 100,
//                 logical: (sectionCounts.logical / 10) * 100,
//                 personality: (sectionCounts.personality / 10) * 100
//             };
            
//             setSectionProgress(updatedProgress);
//             return newAnswers;
//         });
//     };

//     const handleSubmit = (isTimeUp = false) => {
//         // Cleanup any media streams
//         if (cameraStreamRef.current) {
//             cameraStreamRef.current.getTracks().forEach(track => track.stop());
//         }
        
//         const score = Object.entries(answers).reduce((acc, [questionId, answer]) => {
//           const question = QUESTIONS.find(q => q.id.toString() === questionId);
//           if (!question) return acc;
          
//           if (question.isFreeText) {
//             // For free-text, compare the trimmed and normalized answer
//             const normalizedAnswer = answer.trim().replace(/\s+/g, ' ');
//             const normalizedCorrect = question.correctAnswer.trim().replace(/\s+/g, ' ');
//             return acc + (normalizedAnswer === normalizedCorrect ? 1 : 0);
//           }
//           // For multiple-choice
//           return acc + (question.correctAnswer === answer ? 1 : 0);
//         }, 0);
      
//         // Calculate section scores
//         const sectionScores = {
//             technical: calculateSectionScore('technical'),
//             aptitude: calculateSectionScore('aptitude'),
//             logical: calculateSectionScore('logical'),
//             personality: calculateSectionScore('personality'),
//         };
      
//         const result = {
//           user: user.name,
//           score: (score / QUESTIONS.length) * 100,
//           timeSpent: 3600 - timeRemaining,
//           answers,
//           sections: sectionScores,
//           submittedBy: isTimeUp ? 'timeout' : 'user',
//           violations: tabViolationCount,
//           noiseViolations: noiseViolationCount,
//         };
      
//         onComplete(result);
//         setStage(TEST_STAGES.COMPLETED);
//     };

//     const calculateSectionScore = (sectionName) => {
//         // Get all question IDs for this section
//         const sectionQuestionIds = Object.entries(questionSections)
//             .filter(([_, section]) => section === sectionName)
//             .map(([id]) => id);
        
//         // Count how many of these questions were answered
//         const answeredCount = sectionQuestionIds.filter(id => answers[id] !== undefined).length;
        
//         // Calculate percentage
//         return (answeredCount / 10) * 100;
//     };

//     // Get current question based on shuffled array
//     const getCurrentQuestion = () => {
//         if (shuffledQuestions.length === 0) return null;
//         return shuffledQuestions[currentQuestion];
//     };

//     // Get current section name based on the current question
//     const getCurrentSectionName = () => {
//         const question = getCurrentQuestion();
//         if (!question) return '';
        
//         return questionSections[question.id];
//     };

//     // Format section name for display
//     const formatSectionName = (section) => {
//         switch(section) {
//             case 'technical': return 'Technical Knowledge';
//             case 'aptitude': return 'Aptitude Assessment';
//             case 'logical': return 'Logical Reasoning';
//             case 'personality': return 'Personality Assessment';
//             default: return '';
//         }
//     };

//     const renderInstructions = () => (
//         <div className="instructions-container">
//             <h2 className="instructions-title">Test Instructions</h2>
//             <div className="instruction-section">
//                 <h3>Test Structure</h3>
//                 <ul>
//                     <li>The test consists of 40 questions divided into 4 sections:</li>
//                     <li>Technical Knowledge (10 questions)</li>
//                     <li>Aptitude Assessment (10 questions)</li>
//                     <li>Logical Reasoning (10 questions)</li>
//                     <li>Personality Assessment (10 questions)</li>
//                 </ul>
//             </div>
//             <div className="instruction-section">
//                 <h3>Time Limit</h3>
//                 <ul>
//                     <li>Total duration: 60 minutes</li>
//                     <li>Recommended time per section: 15 minutes</li>
//                     <li>Timer will be visible throughout the test</li>
//                     <li>Test auto-submits when time expires</li>
//                 </ul>
//             </div>
//             <div className="instruction-section">
//                 <h3>Important Rules</h3>
//                 <ul>
//                     <li>Questions are randomized within each section</li>
//                     <li>All questions are mandatory</li>
//                     <li>You can review your answers before final submission</li>
//                     <li>Ensure stable internet connection throughout the test</li>
//                     <li>Window switching is monitored and recorded</li>
//                     <li>Your camera and microphone will be monitored for test integrity</li>
//                     <li>Excessive noise or tab violations will result in test termination</li>
//                 </ul>
//             </div>
//             <div className="confirmation-checkbox">
//                 <input
//                     type="checkbox"
//                     id="instructions-confirmation"
//                     checked={hasReadInstructions}
//                     onChange={(e) => setHasReadInstructions(e.target.checked)}
//                 />
//                 <label htmlFor="instructions-confirmation">
//                     I have read and understood all instructions
//                 </label>
//             </div>
//             <button
//                 className="start-button"
//                 disabled={!hasReadInstructions}
//                 onClick={() => setStage(TEST_STAGES.CONFIRMATION)}
//             >
//                 Start Test
//             </button>
//         </div>
//     );

//     const renderConfirmation = () => (
//         <div className="confirmation-container">
//             <AlertCircle size={48} className="confirmation-icon" />
//             <h2>Ready to Begin?</h2>
//             <p>Please ensure:</p>
//             <ul>
//                 <li>You are in a quiet environment</li>
//                 <li>You have stable internet connection</li>
//                 <li>You have 60 minutes available</li>
//                 <li>You won't be interrupted</li>
//                 <li>You remain in this window during the test</li>
//                 <li>You have a working camera and microphone</li>
//                 <li>You understand that excessive noise or tab switching will terminate your test</li>
//             </ul>
//             <div className="confirmation-buttons">
//                 <button
//                     className="back-button"
//                     onClick={() => setStage(TEST_STAGES.INSTRUCTIONS)}
//                 >
//                     Back to Instructions
//                 </button>
//                 <button
//                     className="confirm-button"
//                     onClick={() => setStage(TEST_STAGES.DEVICE_SETUP)}
//                 >
//                     Next: Setup Devices
//                 </button>
//             </div>
//         </div>
//     );
    
//     // New render function for device setup stage
//     const renderDeviceSetup = () => (
//         <div className="device-setup-container">
//             <h2 className="device-setup-title">Camera & Microphone Setup</h2>
//             <p className="device-setup-instructions">
//                 Please enable your camera and microphone. Both are required to take the test.
//             </p>
            
//             <div className="device-setup-grid">
//                 <div className="device-setup-item">
//                     <h3>Camera</h3>
//                     <div className="device-preview">
//                         <CameraCapture 
//                             isTestActive={true}
//                             onCameraStream={(stream) => {
//                                 cameraStreamRef.current = stream;
//                                 setCameraEnabled(!!stream);
//                             }}
//                         />
//                     </div>
//                     <div className="device-status">
//                         {cameraEnabled ? (
//                             <span className="status-enabled">Camera enabled ✓</span>
//                         ) : (
//                             <span className="status-disabled">Camera not enabled</span>
//                         )}
//                     </div>
//                 </div>
                
//                 <div className="device-setup-item">
//                     <h3>Microphone</h3>
//                     <div className="device-preview">
//                         <NoiseMonitor 
//                             isTestActive={true}
//                             onNoiseViolation={() => {}}
//                             onMicEnabled={(enabled) => setMicEnabled(enabled)}
//                         />
//                     </div>
//                     <div className="device-status">
//                         {micEnabled ? (
//                             <span className="status-enabled">Microphone enabled ✓</span>
//                         ) : (
//                             <span className="status-disabled">Microphone not enabled</span>
//                         )}
//                     </div>
//                 </div>
//             </div>
            
//             <div className="device-setup-footer">
//                 <p className="device-setup-note">
//                     Both camera and microphone are required for test integrity. The test cannot 
//                     start until both devices are enabled.
//                 </p>
                
//                 <div className="device-setup-buttons">
//                     <button
//                         className="back-button"
//                         onClick={() => setStage(TEST_STAGES.CONFIRMATION)}
//                     >
//                         Back
//                     </button>
//                     <button
//                         className="start-test-button"
//                         disabled={!cameraEnabled || !micEnabled}
//                         onClick={() => setStage(TEST_STAGES.TEST)}
//                     >
//                         Start Test
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );

//     const renderTest = () => {
//         const question = getCurrentQuestion();
//         if (!question) return <div>Loading questions...</div>;
        
//         const currentSection = getCurrentSectionName();
//         const isTestActive = stage === TEST_STAGES.TEST;
        
//         return (
//             <div className="test-container">
//                 {showWarning && (
//                     <div className="caught-notification animate__animated animate__bounceIn">
//                         <div className="caught-header">
//                             <AlertTriangle className="caught-icon" size={32} />
//                             <h3>
//                                 {warningType === 'tab' ? 'Tab Violation Detected!' : 'Noise Violation Detected!'}
//                             </h3>
//                         </div>
//                         <div className="caught-content">
//                             <p className="caught-message">
//                                 {warningType === 'tab'
//                                     ? 'Please stay focused on the test window to maintain integrity.'
//                                     : 'Please maintain a quiet environment during the test.'}
//                             </p>
//                             <div className="violation-info">
//                                 <span className="violation-label">
//                                     {warningType === 'tab' ? 'Tab Violations:' : 'Noise Violations:'}
//                                 </span>
//                                 <span className="violation-number">
//                                     {warningType === 'tab' ? tabViolationCount : noiseViolationCount}
//                                 </span>
//                             </div>
//                         </div>
//                         <div className="caught-progress">
//                             <div
//                                 className="progress-fill"
//                                 style={{ 
//                                     width: `${Math.min(
//                                         (warningType === 'tab' ? tabViolationCount : noiseViolationCount) * 33, 
//                                         100
//                                     )}%` 
//                                 }}
//                             />
//                         </div>
//                     </div>
//                 )}
                
//                 {/* Hidden camera component for admin monitoring */}
//                 <div style={{ display: 'none' }}>
//                     <CameraCapture 
//                         isTestActive={isTestActive}
//                         onCameraStream={(stream) => {
//                             cameraStreamRef.current = stream;
//                         }}
//                     />
//                 </div>
                
//                 {/* Hidden microphone monitoring */}
//                 <div style={{ display: 'none' }}>
//                     <NoiseMonitor 
//                         isTestActive={isTestActive} 
//                         onNoiseViolation={handleNoiseViolation}
//                     />
//                 </div>
                
//                 {/* Display minimized camera feed indicator to student */}
//                 <div className="camera-minimized">
//                     <div className="camera-status">
//                         <div className="status-indicator active"></div>
//                         <span>Camera active and monitored by proctor</span>
//                     </div>
                    
//                     <div className="noise-status">
//                         <div className="status-indicator active"></div>
//                         <span>Microphone active and monitored by proctor</span>
//                     </div>
//                 </div>
                
//                 <div className="test-header">
//                     <div className="section-info">
//                         <h2>{formatSectionName(currentSection)}</h2>
//                         <p>Question {currentQuestion + 1} of 40</p>
//                     </div>
//                     <div className="timer">
//                         <Clock size={20} />
//                         <span className={timeRemaining < 300 ? 'time-warning' : ''}>
//                             {formatTime(timeRemaining)}
//                         </span>
//                     </div>
//                 </div>
//                 <div className="progress-sections">
//                     {Object.entries(sectionProgress).map(([section, progress]) => (
//                         <div key={section} className="section-progress">
//                             <span className="section-label">{section}</span>
//                             <div className="progress-bar">
//                                 <div
//                                     className="progress-fill"
//                                     style={{ width: `${progress}%` }}
//                                 />
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//                 <div className="question-section">
//                     <p className="question-text">
//                         {question.question}
//                     </p>
//                     {question.isFreeText ? (
//                         <textarea
//                             className="free-text-input"
//                             value={answers[question.id] || ''}
//                             onChange={(e) => handleAnswer(question.id, e.target.value)}
//                             placeholder="Enter your code here..."
//                             rows={6}
//                         />
//                     ) : (
//                         <div className="options-list">
//                             {question.options.map((option, idx) => {
//                                 const isSelected = answers[question.id] === idx;
                                
//                                 return (
//                                     <button
//                                         key={idx}
//                                         className={`option-button ${isSelected ? 'selected' : ''}`}
//                                         onClick={() => handleAnswer(question.id, idx)}
//                                     >
//                                         {option}
//                                     </button>
//                                 );
//                             })}
//                         </div>
//                     )}
//                 </div>
                
//                 <div className="navigation">
//                     {currentQuestion === shuffledQuestions.length - 1 ? (
//                         <button
//                             className="review-button"
//                             onClick={() => setStage(TEST_STAGES.REVIEW)}
//                         >
//                             Review Answers
//                         </button>
//                     ) : (
//                         <button
//                             className="next-button"
//                             onClick={() => setCurrentQuestion(prev => prev + 1)}
//                             disabled={!question || answers[question.id] === undefined}
//                         >
//                             Next Question
//                         </button>
//                     )}
//                 </div>
//             </div>
//         );
//     };

//     const renderReview = () => (
//         <div className="review-container">
//             <h2>Review Your Answers</h2>
//             <div className="section-summary">
//                 {Object.entries(sectionProgress).map(([section, progress]) => (
//                     <div key={section} className="section-status">
//                         <h3>{section}</h3>
//                         <p>{progress}% Complete</p>
//                     </div>
//                 ))}
//             </div>
//             <div className="time-remaining">
//                 <Clock size={20} />
//                 <span>{formatTime(timeRemaining)}</span>
//             </div>
//             <div className="violations-summary">
//                 <div className="violation-item">
//                     <p>Tab Violations: <span className="violation-count">{tabViolationCount}</span></p>
//                 </div>
//                 <div className="violation-item">
//                     <p>Noise Violations: <span className="violation-count">{noiseViolationCount}</span></p>
//                 </div>
//             </div>
//             <button
//                 className="submit-button"
//                 onClick={() => setStage(TEST_STAGES.SUBMIT_CONFIRMATION)}
//                 disabled={Object.keys(answers).length < shuffledQuestions.length}
//             >
//                 Submit Test
//             </button>
//         </div>
//     );

//     const renderSubmitConfirmation = () => (
//         <div className="submit-confirmation">
//             <AlertTriangle size={48} className="warning-icon" />
//             <h2>Confirm Submission</h2>
//             <p>Are you sure you want to submit your test?</p>
//             <p>Tab violations recorded: {tabViolationCount}</p>
//             <p>Noise violations recorded: {noiseViolationCount}</p>
//             <p>This action cannot be undone.</p>
//             <div className="confirmation-buttons">
//                 <button
//                     className="back-button"
//                     onClick={() => setStage(TEST_STAGES.REVIEW)}
//                 >
//                     Return to Review
//                 </button>
//                 <button
//                     className="submit-button"
//                     onClick={() => handleSubmit()}
//                 >
//                     Confirm Submission
//                 </button>
//             </div>
//         </div>
//     );

//     const renderCompleted = () => (
//         <div className="completion-container">
//             <CheckCircle size={48} className="success-icon" />
//             <h2>Test Completed</h2>
//             <p>Your responses have been recorded successfully.</p>
//             <p>Tab violations recorded: {tabViolationCount}</p>
//             <p>Noise violations recorded: {noiseViolationCount}</p>
//             <p>You may now close this window.</p>
//         </div>
//     );
    
//     const renderTerminated = () => (
//         <div className="terminated-container">
//             <AlertTriangle size={48} className="terminated-icon" />
//             <h2>Test Terminated</h2>
//             <p className="termination-reason">{terminationReason}</p>
//             <div className="violation-summary">
//                 <p>Tab violations: <span className="violation-count">{tabViolationCount}</span></p>
//                 <p>Noise violations: <span className="violation-count">{noiseViolationCount}</span></p>
//             </div>
//             <p className="termination-message">
//                 Your test has been terminated due to integrity violations. 
//                 Please contact your administrator for more information.
//             </p>
//             <p className="termination-note">
//                 You will not be able to log in again to retake this test.
//             </p>
//         </div>
//     );

//     const renderStage = () => {
//         switch (stage) {
//             case TEST_STAGES.INSTRUCTIONS:
//                 return renderInstructions();
//             case TEST_STAGES.CONFIRMATION:
//                 return renderConfirmation();
//             case TEST_STAGES.DEVICE_SETUP:
//                 return renderDeviceSetup();
//             case TEST_STAGES.TEST:
//                 return renderTest();
//             case TEST_STAGES.REVIEW:
//                 return renderReview();
//             case TEST_STAGES.SUBMIT_CONFIRMATION:
//                 return renderSubmitConfirmation();
//             case TEST_STAGES.COMPLETED:
//                 return renderCompleted();
//             case TEST_STAGES.TERMINATED:
//                 return renderTerminated();
//             default:
//                 return null;
//         }
//     };

//     return (
//         <div className="test-wrapper">
//             {renderStage()}
//         </div>
//     );
// };



// import React, { useState, useEffect, useRef } from 'react';
// import { Clock, AlertCircle, CheckCircle, AlertTriangle, Video, Mic } from 'lucide-react';
// import { QUESTIONS } from '../../data/constants';
// import { NoiseMonitor } from '../Noise/NoiseMonitor';
// import { CameraCapture } from '../Camera/CameraCapture';
// import rtcService from '../../services/RTCStreamingService';
// import './TestInterface.css';

// const TEST_STAGES = {
//     INSTRUCTIONS: 'instructions',
//     CONFIRMATION: 'confirmation',
//     DEVICE_SETUP: 'device_setup',  // New stage for camera/mic setup
//     TEST: 'test',
//     REVIEW: 'review',
//     SUBMIT_CONFIRMATION: 'submit_confirmation',
//     COMPLETED: 'completed',
//     TERMINATED: 'terminated'
// };

// // Helper function to shuffle array using Fisher-Yates algorithm
// const shuffleArray = (array) => {
//     const shuffled = [...array];
//     for (let i = shuffled.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
//     }
//     return shuffled;
// };

// export const TestInterface = ({ user, onComplete }) => {
//     const [stage, setStage] = useState(TEST_STAGES.INSTRUCTIONS);
//     const [currentQuestion, setCurrentQuestion] = useState(0);
//     const [answers, setAnswers] = useState({});
//     const [timeRemaining, setTimeRemaining] = useState(60 * 60);
//     const [hasReadInstructions, setHasReadInstructions] = useState(false);
//     const [sectionProgress, setSectionProgress] = useState({
//         technical: 0,
//         aptitude: 0,
//         logical: 0,
//         personality: 0
//     });
//     const [tabViolationCount, setTabViolationCount] = useState(0);
//     const [noiseViolationCount, setNoiseViolationCount] = useState(0);
//     const [showWarning, setShowWarning] = useState(false);
//     const [warningType, setWarningType] = useState('tab'); // 'tab' or 'noise'
//     const [isTerminated, setIsTerminated] = useState(false);
//     const [terminationReason, setTerminationReason] = useState('');
    
//     // Device setup state - these were missing
//     const [cameraEnabled, setCameraEnabled] = useState(false);
//     const [micEnabled, setMicEnabled] = useState(false);
    
//     const warningTimeoutRef = useRef(null);
//     const cameraStreamRef = useRef(null);
    
//     // State for shuffled questions
//     const [shuffledQuestions, setShuffledQuestions] = useState([]);
    
//     // Track original section for each question
//     const [questionSections, setQuestionSections] = useState({});

//     // Initialize shuffled questions when component mounts
//     useEffect(() => {
//         // Group questions by section (each section has 10 questions)
//         const sections = {
//             technical: QUESTIONS.slice(0, 10),
//             aptitude: QUESTIONS.slice(10, 20),
//             logical: QUESTIONS.slice(20, 30),
//             personality: QUESTIONS.slice(30, 40)
//         };
        
//         // Create mapping of question IDs to their sections
//         const sectionMap = {};
//         Object.entries(sections).forEach(([sectionName, questions]) => {
//             questions.forEach(q => {
//                 sectionMap[q.id] = sectionName;
//             });
//         });
//         setQuestionSections(sectionMap);
        
//         // Shuffle each section separately
//         const shuffledSections = {
//             technical: shuffleArray(sections.technical),
//             aptitude: shuffleArray(sections.aptitude),
//             logical: shuffleArray(sections.logical),
//             personality: shuffleArray(sections.personality)
//         };
        
//         // Combine all shuffled sections
//         const allShuffled = [
//             ...shuffledSections.technical,
//             ...shuffledSections.aptitude,
//             ...shuffledSections.logical,
//             ...shuffledSections.personality
//         ];
        
//         setShuffledQuestions(allShuffled);
//     }, []);

//     const playAlertSound = () => {
//         const audio = new Audio('https://www.soundjay.com/buttons/beep-01a.mp3');
//         audio.play().catch(error => console.log('Audio playback failed:', error));
//     };

//     // Track if we're in permission granting phase
//     const [isPermissionPhase, setIsPermissionPhase] = useState(false);
    
//     // Set permission phase when test stage changes
//     useEffect(() => {
//         if (stage === TEST_STAGES.TEST) {
//             // Initially in permission phase when test starts
//             setIsPermissionPhase(true);
            
//             // After 5 seconds, we assume permission phase is done
//             const timer = setTimeout(() => {
//                 setIsPermissionPhase(false);
//             }, 5000);
            
//             return () => clearTimeout(timer);
//         }
//     }, [stage]);
    
//     // Timer effect
//     useEffect(() => {
//         if (stage === TEST_STAGES.TEST) {
//             const timer = setInterval(() => {
//                 setTimeRemaining(prev => {
//                     if (prev <= 0) {
//                         clearInterval(timer);
//                         handleTimeUp();
//                         return 0;
//                     }
//                     return prev - 1;
//                 });
//             }, 1000);
//             return () => clearInterval(timer);
//         }
//     }, [stage]);
    
//     useEffect(() => {
//         const handleFocus = () => {
//             // Only clear warning when returning if timer is done
//             if (!warningTimeoutRef.current) {
//                 setShowWarning(false);
//             }
//         };

//         const handleBlur = () => {
//             // Don't count violations during permission phase
//             if (stage === TEST_STAGES.TEST && !isPermissionPhase) {
//                 setTabViolationCount(prev => prev + 1);
//                 setWarningType('tab');
//                 setShowWarning(true);
//                 playAlertSound();

//                 // Clear any existing timeout
//                 if (warningTimeoutRef.current) {
//                     clearTimeout(warningTimeoutRef.current);
//                 }

//                 // Set new 10-second timeout
//                 warningTimeoutRef.current = setTimeout(() => {
//                     setShowWarning(false);
//                     warningTimeoutRef.current = null;
//                 }, 10000);
                
//                 // Terminate test after 3 tab violations
//                 if (tabViolationCount >= 2) {
//                     handleTerminate('tab');
//                 }
//             }
//         };

//         window.addEventListener('focus', handleFocus);
//         window.addEventListener('blur', handleBlur);

//         const handleContextMenu = (e) => {
//             if (stage === TEST_STAGES.TEST) e.preventDefault();
//         };

//         const handleKeyDown = (e) => {
//             // Don't count violations during permission phase
//             if (stage === TEST_STAGES.TEST && !isPermissionPhase) {
//                 if ((e.ctrlKey && (e.key === 't' || e.key === 'n' || e.key === 'w')) ||
//                     e.key === 'F11' ||
//                     (e.altKey && e.key === 'Tab')) {
//                     e.preventDefault();
//                     setTabViolationCount(prev => prev + 1);
//                     setWarningType('tab');
//                     setShowWarning(true);
//                     playAlertSound();

//                     if (warningTimeoutRef.current) {
//                         clearTimeout(warningTimeoutRef.current);
//                     }

//                     warningTimeoutRef.current = setTimeout(() => {
//                         setShowWarning(false);
//                         warningTimeoutRef.current = null;
//                     }, 10000);
                    
//                     // Terminate test after 3 tab violations
//                     if (tabViolationCount >= 2) {
//                         handleTerminate('tab');
//                     }
//                 }
//             }
//         };

//         document.addEventListener('contextmenu', handleContextMenu);
//         document.addEventListener('keydown', handleKeyDown);

//         return () => {
//             window.removeEventListener('focus', handleFocus);
//             window.removeEventListener('blur', handleBlur);
//             document.removeEventListener('contextmenu', handleContextMenu);
//             document.removeEventListener('keydown', handleKeyDown);
//             if (warningTimeoutRef.current) {
//                 clearTimeout(warningTimeoutRef.current);
//             }
//         };
//     }, [stage, tabViolationCount, isPermissionPhase]);

//     // Update violation counts in the service when they change
//     useEffect(() => {
//         // Only update if we're in test mode and service is initialized
//         if (stage === TEST_STAGES.TEST && cameraStreamRef.current) {
//             rtcService.updateViolationCount('tab', tabViolationCount);
//         }
//     }, [tabViolationCount, stage]);
    
//     useEffect(() => {
//         // Only update if we're in test mode and service is initialized
//         if (stage === TEST_STAGES.TEST && cameraStreamRef.current) {
//             rtcService.updateViolationCount('noise', noiseViolationCount);
//         }
//     }, [noiseViolationCount, stage]);
    
//     // Cleanup streams when component unmounts
//     useEffect(() => {
//         return () => {
//             // Cleanup any media streams
//             if (cameraStreamRef.current) {
//                 cameraStreamRef.current.getTracks().forEach(track => track.stop());
//             }
            
//             // Cleanup WebRTC connections
//             rtcService.cleanupStudentConnection();
//         };
//     }, []);

//     const formatTime = (seconds) => {
//         const minutes = Math.floor(seconds / 60);
//         const remainingSeconds = seconds % 60;
//         return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
//     };

//     const handleTimeUp = () => {
//         handleSubmit(true);
//     };
    
//     const handleNoiseViolation = (level) => {
//         // Track noise violations
//         setNoiseViolationCount(prev => prev + 1);
//         setWarningType('noise');
//         setShowWarning(true);
        
//         // Clear any existing timeout
//         if (warningTimeoutRef.current) {
//             clearTimeout(warningTimeoutRef.current);
//         }
        
//         // Set new 10-second timeout for the warning
//         warningTimeoutRef.current = setTimeout(() => {
//             setShowWarning(false);
//             warningTimeoutRef.current = null;
//         }, 10000);
        
//         // Terminate test after 3 high noise violations
//         if (level === 'high' && noiseViolationCount >= 2) {
//             handleTerminate('noise');
//         }
//     };
    
//     const handleTerminate = (reason) => {
//         // Cleanup any media streams
//         if (cameraStreamRef.current) {
//             cameraStreamRef.current.getTracks().forEach(track => track.stop());
//         }
        
//         // Set termination reason
//         let reasonText = '';
//         switch(reason) {
//             case 'tab':
//                 reasonText = 'Excessive tab violations detected';
//                 break;
//             case 'noise':
//                 reasonText = 'Excessive noise violations detected';
//                 break;
//             default:
//                 reasonText = 'Test integrity violation detected';
//         }
        
//         setTerminationReason(reasonText);
//         setIsTerminated(true);
//         setStage(TEST_STAGES.TERMINATED);
        
//         // Submit the test with termination status
//         const result = {
//             user: user.name,
//             score: 0,
//             timeSpent: 3600 - timeRemaining,
//             answers,
//             sections: {
//                 technical: 0,
//                 aptitude: 0, 
//                 logical: 0,
//                 personality: 0
//             },
//             submittedBy: 'terminated',
//             violations: tabViolationCount,
//             noiseViolations: noiseViolationCount,
//             terminationReason: reasonText
//         };
        
//         onComplete(result);
//     };

//     const handleAnswer = (questionId, selectedOption) => {
//         setAnswers(prevAnswers => {
//             const newAnswers = {
//                 ...prevAnswers,
//                 [questionId]: selectedOption
//             };
            
//             // Get the section for this question from our mapping
//             const questionSection = questionSections[questionId];
            
//             // Count answered questions for each section
//             const sectionCounts = {
//                 technical: 0,
//                 aptitude: 0,
//                 logical: 0,
//                 personality: 0
//             };
            
//             // Count how many questions have been answered in each section
//             Object.keys(newAnswers).forEach(qId => {
//                 const section = questionSections[qId];
//                 if (section) {
//                     sectionCounts[section]++;
//                 }
//             });
            
//             // Update progress for each section
//             const updatedProgress = {
//                 technical: (sectionCounts.technical / 10) * 100,
//                 aptitude: (sectionCounts.aptitude / 10) * 100,
//                 logical: (sectionCounts.logical / 10) * 100,
//                 personality: (sectionCounts.personality / 10) * 100
//             };
            
//             setSectionProgress(updatedProgress);
//             return newAnswers;
//         });
//     };

//     const handleSubmit = (isTimeUp = false) => {
//         // Cleanup any media streams
//         if (cameraStreamRef.current) {
//             cameraStreamRef.current.getTracks().forEach(track => track.stop());
//         }
        
//         const score = Object.entries(answers).reduce((acc, [questionId, answer]) => {
//           const question = QUESTIONS.find(q => q.id.toString() === questionId);
//           if (!question) return acc;
          
//           if (question.isFreeText) {
//             // For free-text, compare the trimmed and normalized answer
//             const normalizedAnswer = answer.trim().replace(/\s+/g, ' ');
//             const normalizedCorrect = question.correctAnswer.trim().replace(/\s+/g, ' ');
//             return acc + (normalizedAnswer === normalizedCorrect ? 1 : 0);
//           }
//           // For multiple-choice
//           return acc + (question.correctAnswer === answer ? 1 : 0);
//         }, 0);
      
//         // Calculate section scores
//         const sectionScores = {
//             technical: calculateSectionScore('technical'),
//             aptitude: calculateSectionScore('aptitude'),
//             logical: calculateSectionScore('logical'),
//             personality: calculateSectionScore('personality'),
//         };
      
//         const result = {
//           user: user.name,
//           score: (score / QUESTIONS.length) * 100,
//           timeSpent: 3600 - timeRemaining,
//           answers,
//           sections: sectionScores,
//           submittedBy: isTimeUp ? 'timeout' : 'user',
//           violations: tabViolationCount,
//           noiseViolations: noiseViolationCount,
//         };
      
//         onComplete(result);
//         setStage(TEST_STAGES.COMPLETED);
//     };

//     const calculateSectionScore = (sectionName) => {
//         // Get all question IDs for this section
//         const sectionQuestionIds = Object.entries(questionSections)
//             .filter(([_, section]) => section === sectionName)
//             .map(([id]) => id);
        
//         // Count how many of these questions were answered
//         const answeredCount = sectionQuestionIds.filter(id => answers[id] !== undefined).length;
        
//         // Calculate percentage
//         return (answeredCount / 10) * 100;
//     };

//     // Get current question based on shuffled array
//     const getCurrentQuestion = () => {
//         if (shuffledQuestions.length === 0) return null;
//         return shuffledQuestions[currentQuestion];
//     };

//     // Get current section name based on the current question
//     const getCurrentSectionName = () => {
//         const question = getCurrentQuestion();
//         if (!question) return '';
        
//         return questionSections[question.id];
//     };

//     // Format section name for display
//     const formatSectionName = (section) => {
//         switch(section) {
//             case 'technical': return 'Technical Knowledge';
//             case 'aptitude': return 'Aptitude Assessment';
//             case 'logical': return 'Logical Reasoning';
//             case 'personality': return 'Personality Assessment';
//             default: return '';
//         }
//     };

// const renderInstructions = () => (
//   <div className="instructions-container">
//     <h2 className="instructions-title">Test Instructions</h2>
//     <div className="instruction-section">
//       <h3>Test Structure</h3>
//       <ul>
//         <li>The test consists of 40 questions divided into 4 sections:</li>
//         <li>Technical Knowledge (10 questions)</li>
//         <li>Aptitude Assessment (10 questions)</li>
//         <li>Logical Reasoning (10 questions)</li>
//         <li>Personality Assessment (10 questions)</li>
//       </ul>
//     </div>
//     <div className="instruction-section">
//       <h3>Time Limit</h3>
//       <ul>
//         <li>Total duration: 60 minutes</li>
//         <li>Recommended time per section: 15 minutes</li>
//         <li>Timer will be visible throughout the test</li>
//         <li>Test auto-submits when time expires</li>
//       </ul>
//     </div>
//     <div className="instruction-section">
//       <h3>Important Rules</h3>
//       <ul>
//         <li>Questions are randomized within each section</li>
//         <li>All questions are mandatory</li>
//         <li>You can review your answers before final submission</li>
//         <li>Ensure stable internet connection throughout the test</li>
//         <li>Window switching is monitored and recorded</li>
//         <li>Your camera and microphone will be monitored for test integrity</li>
//         <li>Excessive noise or tab violations will result in test termination</li>
//       </ul>
//     </div>
//     <div className="confirmation-checkbox">
//       <input
//         type="checkbox"
//         id="instructions-confirmation"
//         checked={hasReadInstructions}
//         onChange={(e) => setHasReadInstructions(e.target.checked)}
//       />
//       <label htmlFor="instructions-confirmation">
//         I have read and understood all instructions
//       </label>
//     </div>
//     <button
//       className="start-button"
//       disabled={!hasReadInstructions}
//       onClick={() => setStage(TEST_STAGES.CONFIRMATION)}
//     >
//       Start Test
//     </button>
//   </div>
// );

//     const renderConfirmation = () => (
//         <div className="confirmation-container">
//             <AlertCircle size={48} className="confirmation-icon" />
//             <h2>Ready to Begin?</h2>
//             <p>Please ensure:</p>
//             <ul>
//                 <li>You are in a quiet environment</li>
//                 <li>You have stable internet connection</li>
//                 <li>You have 60 minutes available</li>
//                 <li>You won't be interrupted</li>
//                 <li>You remain in this window during the test</li>
//                 <li>You have a working camera and microphone</li>
//                 <li>You understand that excessive noise or tab switching will terminate your test</li>
//             </ul>
//             <div className="confirmation-buttons">
//                 <button
//                     className="back-button"
//                     onClick={() => setStage(TEST_STAGES.INSTRUCTIONS)}
//                 >
//                     Back to Instructions
//                 </button>
//                 <button
//                     className="confirm-button"
//                     onClick={() => setStage(TEST_STAGES.DEVICE_SETUP)}
//                 >
//                     Next: Setup Devices
//                 </button>
//             </div>
//         </div>
//     );
    
//     const renderDeviceSetup = () => (
//         <div className="device-setup-container">
//             <h2 className="device-setup-title">Camera & Microphone Setup</h2>
//             <p className="device-setup-instructions">
//                 Please enable your camera and microphone. Both are required to take the test.
//                 Your video and audio will be streamed to the test administrator for monitoring.
//             </p>
            
//             <div className="device-setup-grid">
//                 <div className="device-setup-item">
//                     <h3>Camera</h3>
//                     <div className="device-preview">
//                         <CameraCapture 
//                             isTestActive={true}
//                             onCameraStream={(stream) => {
//                                 cameraStreamRef.current = stream;
//                                 setCameraEnabled(!!stream);
//                             }}
//                         />
//                     </div>
//                     <div className="device-status">
//                         {cameraEnabled ? (
//                             <span className="status-enabled">Camera enabled ✓</span>
//                         ) : (
//                             <span className="status-disabled">Camera not enabled</span>
//                         )}
//                     </div>
//                 </div>
                
//                 <div className="device-setup-item">
//                     <h3>Microphone</h3>
//                     <div className="device-preview">
//                         <NoiseMonitor 
//                             isTestActive={true}
//                             onNoiseViolation={() => {}}
//                             onMicEnabled={(enabled) => setMicEnabled(enabled)}
//                         />
//                     </div>
//                     <div className="device-status">
//                         {micEnabled ? (
//                             <span className="status-enabled">Microphone enabled ✓</span>
//                         ) : (
//                             <span className="status-disabled">Microphone not enabled</span>
//                         )}
//                     </div>
//                 </div>
//             </div>
            
//             <div className="device-setup-footer">
//                 <p className="device-setup-note">
//                     Both camera and microphone are required for test integrity. The test cannot 
//                     start until both devices are enabled. Your video and audio will be monitored
//                     by the test administrator throughout the test.
//                 </p>
                
//                 <div className="device-setup-buttons">
//                     <button
//                         className="back-button"
//                         onClick={() => setStage(TEST_STAGES.CONFIRMATION)}
//                     >
//                         Back
//                     </button>
//                     <button
//                         className="start-test-button"
//                         disabled={!cameraEnabled || !micEnabled}
//                         onClick={() => {
//                             // Initialize WebRTC streaming to admin
//                             if (cameraStreamRef.current) {
//                                 rtcService.initializeAsStudent(
//                                     cameraStreamRef.current,
//                                     user.username,
//                                     Date.now().toString()
//                                 );
//                             }
//                             setStage(TEST_STAGES.TEST);
//                         }}
//                     >
//                         Start Test
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );

//     const renderTest = () => {
//         const question = getCurrentQuestion();
//         if (!question) return <div>Loading questions...</div>;
        
//         const currentSection = getCurrentSectionName();
//         const isTestActive = stage === TEST_STAGES.TEST;
        
//         return (
//             <div className="test-container">
//                 {showWarning && (
//                     <div className="caught-notification animate__animated animate__bounceIn">
//                         <div className="caught-header">
//                             <AlertTriangle className="caught-icon" size={32} />
//                             <h3>
//                                 {warningType === 'tab' ? 'Tab Violation Detected!' : 'Noise Violation Detected!'}
//                             </h3>
//                         </div>
//                         <div className="caught-content">
//                             <p className="caught-message">
//                                 {warningType === 'tab'
//                                     ? 'Please stay focused on the test window to maintain integrity.'
//                                     : 'Please maintain a quiet environment during the test.'}
//                             </p>
//                             <div className="violation-info">
//                                 <span className="violation-label">
//                                     {warningType === 'tab' ? 'Tab Violations:' : 'Noise Violations:'}
//                                 </span>
//                                 <span className="violation-number">
//                                     {warningType === 'tab' ? tabViolationCount : noiseViolationCount}
//                                 </span>
//                             </div>
//                         </div>
//                         <div className="caught-progress">
//                             <div
//                                 className="progress-fill"
//                                 style={{ 
//                                     width: `${Math.min(
//                                         (warningType === 'tab' ? tabViolationCount : noiseViolationCount) * 33, 
//                                         100
//                                     )}%` 
//                                 }}
//                             />
//                         </div>
//                     </div>
//                 )}
                
//                 {/* Display minimized camera feed indicator to student */}
//                 <div className="camera-minimized">
//                     <div className="camera-status">
//                         <div className="status-indicator active"></div>
//                         <Video size={16} />
//                         <span>Live camera stream active</span>
//                     </div>
                    
//                     <div className="noise-status">
//                         <div className="status-indicator active"></div>
//                         <Mic size={16} />
//                         <span>Live microphone active</span>
//                     </div>
//                 </div>
                
//                 <div className="test-header">
//                     <div className="section-info">
//                         <h2>{formatSectionName(currentSection)}</h2>
//                         <p>Question {currentQuestion + 1} of 40</p>
//                     </div>
//                     <div className="timer">
//                         <Clock size={20} />
//                         <span className={timeRemaining < 300 ? 'time-warning' : ''}>
//                             {formatTime(timeRemaining)}
//                         </span>
//                     </div>
//                 </div>
//                 <div className="progress-sections">
//                     {Object.entries(sectionProgress).map(([section, progress]) => (
//                         <div key={section} className="section-progress">
//                             <span className="section-label">{section}</span>
//                             <div className="progress-bar">
//                                 <div
//                                     className="progress-fill"
//                                     style={{ width: `${progress}%` }}
//                                 />
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//                 <div className="question-section">
//                     <p className="question-text">
//                         {question.question}
//                     </p>
//                     {question.isFreeText ? (
//                         <textarea
//                             className="free-text-input"
//                             value={answers[question.id] || ''}
//                             onChange={(e) => handleAnswer(question.id, e.target.value)}
//                             placeholder="Enter your code here..."
//                             rows={6}
//                         />
//                     ) : (
//                         <div className="options-list">
//                             {question.options.map((option, idx) => {
//                                 const isSelected = answers[question.id] === idx;
                                
//                                 return (
//                                     <button
//                                         key={idx}
//                                         className={`option-button ${isSelected ? 'selected' : ''}`}
//                                         onClick={() => handleAnswer(question.id, idx)}
//                                     >
//                                         {option}
//                                     </button>
//                                 );
//                             })}
//                         </div>
//                     )}
//                 </div>
                
//                 <div className="navigation">
//                     {currentQuestion === shuffledQuestions.length - 1 ? (
//                         <button
//                             className="review-button"
//                             onClick={() => setStage(TEST_STAGES.REVIEW)}
//                         >
//                             Review Answers
//                         </button>
//                     ) : (
//                         <button
//                             className="next-button"
//                             onClick={() => setCurrentQuestion(prev => prev + 1)}
//                             disabled={!question || answers[question.id] === undefined}
//                         >
//                             Next Question
//                         </button>
//                     )}
//                 </div>
//             </div>
//         );
//     };

//     const renderReview = () => (
//         <div className="review-container">
//             <h2>Review Your Answers</h2>
//             <div className="section-summary">
//                 {Object.entries(sectionProgress).map(([section, progress]) => (
//                     <div key={section} className="section-status">
//                         <h3>{section}</h3>
//                         <p>{progress}% Complete</p>
//                     </div>
//                 ))}
//             </div>
//             <div className="time-remaining">
//                 <Clock size={20} />
//                 <span>{formatTime(timeRemaining)}</span>
//             </div>
//             <div className="violations-summary">
//                 <div className="violation-item">
//                     <p>Tab Violations: <span className="violation-count">{tabViolationCount}</span></p>
//                 </div>
//                 <div className="violation-item">
//                     <p>Noise Violations: <span className="violation-count">{noiseViolationCount}</span></p>
//                 </div>
//             </div>
//             <button
//                 className="submit-button"
//                 onClick={() => setStage(TEST_STAGES.SUBMIT_CONFIRMATION)}
//                 disabled={Object.keys(answers).length < shuffledQuestions.length}
//             >
//                 Submit Test
//             </button>
//         </div>
//     );

//     const renderSubmitConfirmation = () => (
//         <div className="submit-confirmation">
//             <AlertTriangle size={48} className="warning-icon" />
//             <h2>Confirm Submission</h2>
//             <p>Are you sure you want to submit your test?</p>
//             <p>Tab violations recorded: {tabViolationCount}</p>
//             <p>Noise violations recorded: {noiseViolationCount}</p>
//             <p>This action cannot be undone.</p>
//             <div className="confirmation-buttons">
//                 <button
//                     className="back-button"
//                     onClick={() => setStage(TEST_STAGES.REVIEW)}
//                 >
//                     Return to Review
//                 </button>
//                 <button
//                     className="submit-button"
//                     onClick={() => handleSubmit()}
//                 >
//                     Confirm Submission
//                 </button>
//             </div>
//         </div>
//     );

//     const renderCompleted = () => (
//         <div className="completion-container">
//             <CheckCircle size={48} className="success-icon" />
//             <h2>Test Completed</h2>
//             <p>Your responses have been recorded successfully.</p>
//             <p>Tab violations recorded: {tabViolationCount}</p>
//             <p>Noise violations recorded: {noiseViolationCount}</p>
//             <p>You may now close this window.</p>
//         </div>
//     );
    
//     const renderTerminated = () => (
//         <div className="terminated-container">
//             <AlertTriangle size={48} className="terminated-icon" />
//             <h2>Test Terminated</h2>
//             <p className="termination-reason">{terminationReason}</p>
//             <div className="violation-summary">
//                 <p>Tab violations: <span className="violation-count">{tabViolationCount}</span></p>
//                 <p>Noise violations: <span className="violation-count">{noiseViolationCount}</span></p>
//             </div>
//             <p className="termination-message">
//                 Your test has been terminated due to integrity violations. 
//                 Please contact your administrator for more information.
//             </p>
//             <p className="termination-note">
//                 You will not be able to log in again to retake this test.
//             </p>
//         </div>
//     );

//     const renderStage = () => {
//         switch (stage) {
//             case TEST_STAGES.INSTRUCTIONS:
//                 return renderInstructions();
//             case TEST_STAGES.CONFIRMATION:
//                 return renderConfirmation();
//             case TEST_STAGES.DEVICE_SETUP:
//                 return renderDeviceSetup();
//             case TEST_STAGES.TEST:
//                 return renderTest();
//             case TEST_STAGES.REVIEW:
//                 return renderReview();
//             case TEST_STAGES.SUBMIT_CONFIRMATION:
//                 return renderSubmitConfirmation();
//             case TEST_STAGES.COMPLETED:
//                 return renderCompleted();
//             case TEST_STAGES.TERMINATED:
//                 return renderTerminated();
//             default:
//                 return null;
//         }
//     };

//     return (
//         <div className="test-wrapper">
//             {renderStage()}
//         </div>
//     );
// };


// import React, { useState, useEffect, useRef } from 'react';
// import { Clock, AlertCircle, CheckCircle, AlertTriangle, Video, Mic, X, Minimize2, Maximize2 } from 'lucide-react';
// import { QUESTIONS } from '../../data/constants';
// import { NoiseMonitor } from '../Noise/NoiseMonitor';
// import { CameraCapture } from '../Camera/CameraCapture';
// import rtcService from '../../services/RTCStreamingService';
// import './TestInterface.css';

// const TEST_STAGES = {
//     INSTRUCTIONS: 'instructions',
//     CONFIRMATION: 'confirmation',
//     DEVICE_SETUP: 'device_setup',
//     TEST: 'test',
//     REVIEW: 'review',
//     SUBMIT_CONFIRMATION: 'submit_confirmation',
//     COMPLETED: 'completed',
//     TERMINATED: 'terminated'
// };

// // Helper function to shuffle array using Fisher-Yates algorithm
// const shuffleArray = (array) => {
//     const shuffled = [...array];
//     for (let i = shuffled.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
//     }
//     return shuffled;
// };

// export const TestInterface = ({ user, onComplete }) => {
//     const [stage, setStage] = useState(TEST_STAGES.INSTRUCTIONS);
//     const [currentQuestion, setCurrentQuestion] = useState(0);
//     const [answers, setAnswers] = useState({});
//     const [timeRemaining, setTimeRemaining] = useState(60 * 60);
//     const [hasReadInstructions, setHasReadInstructions] = useState(false);
//     const [sectionProgress, setSectionProgress] = useState({
//         technical: 0,
//         aptitude: 0,
//         logical: 0,
//         personality: 0
//     });
//     const [tabViolationCount, setTabViolationCount] = useState(0);
//     const [noiseViolationCount, setNoiseViolationCount] = useState(0);
//     const [showWarning, setShowWarning] = useState(false);
//     const [warningType, setWarningType] = useState('tab');
//     const [isTerminated, setIsTerminated] = useState(false);
//     const [terminationReason, setTerminationReason] = useState('');
    
//     // Device setup state
//     const [cameraEnabled, setCameraEnabled] = useState(false);
//     const [micEnabled, setMicEnabled] = useState(false);
//     const [activeStream, setActiveStream] = useState(null); // Store the active stream
    
//     // Camera preview state
//     const [showCameraPreview, setShowCameraPreview] = useState(false);
//     const [cameraPreviewMinimized, setCameraPreviewMinimized] = useState(false);
//     const [cameraPreviewPosition, setCameraPreviewPosition] = useState({ x: 20, y: 20 });
    
//     const warningTimeoutRef = useRef(null);
//     const cameraStreamRef = useRef(null);
//     const cameraPreviewRef = useRef(null);
//     const [shuffledQuestions, setShuffledQuestions] = useState([]);
//     const [questionSections, setQuestionSections] = useState({});

//     // Initialize shuffled questions when component mounts
//     useEffect(() => {
//         const sections = {
//             technical: QUESTIONS.slice(0, 10),
//             aptitude: QUESTIONS.slice(10, 20),
//             logical: QUESTIONS.slice(20, 30),
//             personality: QUESTIONS.slice(30, 40)
//         };
        
//         const sectionMap = {};
//         Object.entries(sections).forEach(([sectionName, questions]) => {
//             questions.forEach(q => {
//                 sectionMap[q.id] = sectionName;
//             });
//         });
//         setQuestionSections(sectionMap);
        
//         const shuffledSections = {
//             technical: shuffleArray(sections.technical),
//             aptitude: shuffleArray(sections.aptitude),
//             logical: shuffleArray(sections.logical),
//             personality: shuffleArray(sections.personality)
//         };
        
//         const allShuffled = [
//             ...shuffledSections.technical,
//             ...shuffledSections.aptitude,
//             ...shuffledSections.logical,
//             ...shuffledSections.personality
//         ];
        
//         setShuffledQuestions(allShuffled);
//     }, []);

//     const playAlertSound = () => {
//         const audio = new Audio('https://www.soundjay.com/buttons/beep-01a.mp3');
//         audio.play().catch(error => console.log('Audio playback failed:', error));
//     };

//     const [isPermissionPhase, setIsPermissionPhase] = useState(false);
    
//     useEffect(() => {
//         if (stage === TEST_STAGES.TEST) {
//             setIsPermissionPhase(true);
//             const timer = setTimeout(() => {
//                 setIsPermissionPhase(false);
//             }, 5000);
//             return () => clearTimeout(timer);
//         }
//     }, [stage]);
    
//     // Timer effect
//     useEffect(() => {
//         if (stage === TEST_STAGES.TEST) {
//             const timer = setInterval(() => {
//                 setTimeRemaining(prev => {
//                     if (prev <= 0) {
//                         clearInterval(timer);
//                         handleTimeUp();
//                         return 0;
//                     }
//                     return prev - 1;
//                 });
//             }, 1000);
//             return () => clearInterval(timer);
//         }
//     }, [stage]);
    
//     // Tab switching and keyboard monitoring
//     useEffect(() => {
//         const handleFocus = () => {
//             if (!warningTimeoutRef.current) {
//                 setShowWarning(false);
//             }
//         };

//         const handleBlur = () => {
//             if (stage === TEST_STAGES.TEST && !isPermissionPhase) {
//                 setTabViolationCount(prev => prev + 1);
//                 setWarningType('tab');
//                 setShowWarning(true);
//                 playAlertSound();

//                 if (warningTimeoutRef.current) {
//                     clearTimeout(warningTimeoutRef.current);
//                 }

//                 warningTimeoutRef.current = setTimeout(() => {
//                     setShowWarning(false);
//                     warningTimeoutRef.current = null;
//                 }, 10000);
                
//                 if (tabViolationCount >= 2) {
//                     handleTerminate('tab');
//                 }
//             }
//         };

//         window.addEventListener('focus', handleFocus);
//         window.addEventListener('blur', handleBlur);

//         const handleContextMenu = (e) => {
//             if (stage === TEST_STAGES.TEST) e.preventDefault();
//         };

//         const handleKeyDown = (e) => {
//             if (stage === TEST_STAGES.TEST && !isPermissionPhase) {
//                 if ((e.ctrlKey && (e.key === 't' || e.key === 'n' || e.key === 'w')) ||
//                     e.key === 'F11' ||
//                     (e.altKey && e.key === 'Tab')) {
//                     e.preventDefault();
//                     setTabViolationCount(prev => prev + 1);
//                     setWarningType('tab');
//                     setShowWarning(true);
//                     playAlertSound();

//                     if (warningTimeoutRef.current) {
//                         clearTimeout(warningTimeoutRef.current);
//                     }

//                     warningTimeoutRef.current = setTimeout(() => {
//                         setShowWarning(false);
//                         warningTimeoutRef.current = null;
//                     }, 10000);
                    
//                     if (tabViolationCount >= 2) {
//                         handleTerminate('tab');
//                     }
//                 }
//             }
//         };

//         document.addEventListener('contextmenu', handleContextMenu);
//         document.addEventListener('keydown', handleKeyDown);

//         return () => {
//             window.removeEventListener('focus', handleFocus);
//             window.removeEventListener('blur', handleBlur);
//             document.removeEventListener('contextmenu', handleContextMenu);
//             document.removeEventListener('keydown', handleKeyDown);
//             if (warningTimeoutRef.current) {
//                 clearTimeout(warningTimeoutRef.current);
//             }
//         };
//     }, [stage, tabViolationCount, isPermissionPhase]);

//     // Update violation counts in the service
//     useEffect(() => {
//         if (stage === TEST_STAGES.TEST && cameraStreamRef.current) {
//             rtcService.updateViolationCount('tab', tabViolationCount);
//         }
//     }, [tabViolationCount, stage]);
    
//     useEffect(() => {
//         if (stage === TEST_STAGES.TEST && cameraStreamRef.current) {
//             rtcService.updateViolationCount('noise', noiseViolationCount);
//         }
//     }, [noiseViolationCount, stage]);
    
//     // Cleanup on unmount
//     useEffect(() => {
//         return () => {
//             if (cameraStreamRef.current) {
//                 cameraStreamRef.current.getTracks().forEach(track => track.stop());
//             }
//             rtcService.cleanupStudentConnection();
//         };
//     }, []);

//     const formatTime = (seconds) => {
//         const minutes = Math.floor(seconds / 60);
//         const remainingSeconds = seconds % 60;
//         return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
//     };

//     const handleTimeUp = () => {
//         handleSubmit(true);
//     };
    
//     const handleNoiseViolation = (level) => {
//         setNoiseViolationCount(prev => prev + 1);
//         setWarningType('noise');
//         setShowWarning(true);
        
//         if (warningTimeoutRef.current) {
//             clearTimeout(warningTimeoutRef.current);
//         }
        
//         warningTimeoutRef.current = setTimeout(() => {
//             setShowWarning(false);
//             warningTimeoutRef.current = null;
//         }, 10000);
        
//         if (level === 'high' && noiseViolationCount >= 2) {
//             handleTerminate('noise');
//         }
//     };
    
//     const handleTerminate = (reason) => {
//         if (cameraStreamRef.current) {
//             cameraStreamRef.current.getTracks().forEach(track => track.stop());
//         }
        
//         let reasonText = '';
//         switch(reason) {
//             case 'tab':
//                 reasonText = 'Excessive tab violations detected';
//                 break;
//             case 'noise':
//                 reasonText = 'Excessive noise violations detected';
//                 break;
//             default:
//                 reasonText = 'Test integrity violation detected';
//         }
        
//         setTerminationReason(reasonText);
//         setIsTerminated(true);
//         setStage(TEST_STAGES.TERMINATED);
        
//         const result = {
//             user: user.name,
//             score: 0,
//             timeSpent: 3600 - timeRemaining,
//             answers,
//             sections: {
//                 technical: 0,
//                 aptitude: 0, 
//                 logical: 0,
//                 personality: 0
//             },
//             submittedBy: 'terminated',
//             violations: tabViolationCount,
//             noiseViolations: noiseViolationCount,
//             terminationReason: reasonText
//         };
        
//         onComplete(result);
//     };

//     const handleAnswer = (questionId, selectedOption) => {
//         setAnswers(prevAnswers => {
//             const newAnswers = {
//                 ...prevAnswers,
//                 [questionId]: selectedOption
//             };
            
//             const questionSection = questionSections[questionId];
            
//             const sectionCounts = {
//                 technical: 0,
//                 aptitude: 0,
//                 logical: 0,
//                 personality: 0
//             };
            
//             Object.keys(newAnswers).forEach(qId => {
//                 const section = questionSections[qId];
//                 if (section) {
//                     sectionCounts[section]++;
//                 }
//             });
            
//             const updatedProgress = {
//                 technical: (sectionCounts.technical / 10) * 100,
//                 aptitude: (sectionCounts.aptitude / 10) * 100,
//                 logical: (sectionCounts.logical / 10) * 100,
//                 personality: (sectionCounts.personality / 10) * 100
//             };
            
//             setSectionProgress(updatedProgress);
//             return newAnswers;
//         });
//     };

//     const handleSubmit = (isTimeUp = false) => {
//         if (cameraStreamRef.current) {
//             cameraStreamRef.current.getTracks().forEach(track => track.stop());
//         }
        
//         const score = Object.entries(answers).reduce((acc, [questionId, answer]) => {
//           const question = QUESTIONS.find(q => q.id.toString() === questionId);
//           if (!question) return acc;
          
//           if (question.isFreeText) {
//             const normalizedAnswer = answer.trim().replace(/\s+/g, ' ');
//             const normalizedCorrect = question.correctAnswer.trim().replace(/\s+/g, ' ');
//             return acc + (normalizedAnswer === normalizedCorrect ? 1 : 0);
//           }
//           return acc + (question.correctAnswer === answer ? 1 : 0);
//         }, 0);
      
//         const sectionScores = {
//             technical: calculateSectionScore('technical'),
//             aptitude: calculateSectionScore('aptitude'),
//             logical: calculateSectionScore('logical'),
//             personality: calculateSectionScore('personality'),
//         };
      
//         const result = {
//           user: user.name,
//           score: (score / QUESTIONS.length) * 100,
//           timeSpent: 3600 - timeRemaining,
//           answers,
//           sections: sectionScores,
//           submittedBy: isTimeUp ? 'timeout' : 'user',
//           violations: tabViolationCount,
//           noiseViolations: noiseViolationCount,
//         };
      
//         onComplete(result);
//         setStage(TEST_STAGES.COMPLETED);
//     };

//     const calculateSectionScore = (sectionName) => {
//         const sectionQuestionIds = Object.entries(questionSections)
//             .filter(([_, section]) => section === sectionName)
//             .map(([id]) => id);
        
//         const answeredCount = sectionQuestionIds.filter(id => answers[id] !== undefined).length;
//         return (answeredCount / 10) * 100;
//     };

//     const getCurrentQuestion = () => {
//         if (shuffledQuestions.length === 0) return null;
//         return shuffledQuestions[currentQuestion];
//     };

//     const getCurrentSectionName = () => {
//         const question = getCurrentQuestion();
//         if (!question) return '';
//         return questionSections[question.id];
//     };

//     const formatSectionName = (section) => {
//         switch(section) {
//             case 'technical': return 'Technical Knowledge';
//             case 'aptitude': return 'Aptitude Assessment';
//             case 'logical': return 'Logical Reasoning';
//             case 'personality': return 'Personality Assessment';
//             default: return '';
//         }
//     };

//     // Camera preview update when stream changes
//     const handleCameraStream = (stream) => {
//         console.log('🎥 Camera stream received:', stream); // Debug log
//         cameraStreamRef.current = stream;
//         setActiveStream(stream); // Store in state too
//         setCameraEnabled(!!stream);
        
//         // If we're in test stage, immediately show the preview
//         if (stage === TEST_STAGES.TEST && stream) {
//             console.log('🎥 Test stage - enabling camera preview');
//             setShowCameraPreview(true);
//         }
        
//         // Update preview video immediately if it exists
//         if (stream && cameraPreviewRef.current) {
//             console.log('🎥 Connecting stream to preview video element');
//             cameraPreviewRef.current.srcObject = stream;
//             cameraPreviewRef.current.play().catch(e => console.error('❌ Error playing preview:', e));
//         }
//     };

//     // Effect to update camera preview when stream changes
//     useEffect(() => {
//         if (cameraPreviewRef.current && cameraStreamRef.current && showCameraPreview && !cameraPreviewMinimized) {
//             const videoElement = cameraPreviewRef.current;
            
//             // Only update if not already connected
//             if (videoElement.srcObject !== cameraStreamRef.current) {
//                 console.log('Updating camera preview with existing stream');
//                 videoElement.srcObject = cameraStreamRef.current;
//                 videoElement.play().catch(e => console.error('Error playing preview:', e));
//             }
//         }
//     }, [stage, showCameraPreview, cameraEnabled, cameraPreviewMinimized]);

//     // Show camera preview when test stage begins
//     useEffect(() => {
//         console.log('🔄 Stage changed to:', stage);
//         console.log('🔄 Camera enabled:', cameraEnabled);
//         console.log('🔄 Active stream:', activeStream);
//         console.log('🔄 Stream ref:', cameraStreamRef.current);
        
//         if (stage === TEST_STAGES.TEST) {
//             // Enable preview as soon as test starts
//             setShowCameraPreview(true);
            
//             // If we have a stream, connect it
//             const stream = activeStream || cameraStreamRef.current;
//             if (stream) {
//                 console.log('🎥 Test started - connecting camera preview');
//                 setTimeout(() => {
//                     if (cameraPreviewRef.current) {
//                         cameraPreviewRef.current.srcObject = stream;
//                         cameraPreviewRef.current.play().catch(e => console.error('❌ Error playing preview:', e));
//                     }
//                 }, 200);
//             }
//         }
//     }, [stage, activeStream, cameraEnabled]);

//     // Effect to continuously ensure video stream is connected
//     useEffect(() => {
//         if (showCameraPreview && cameraPreviewRef.current && cameraStreamRef.current) {
//             const videoElement = cameraPreviewRef.current;
            
//             // Check if stream is already connected
//             if (videoElement.srcObject !== cameraStreamRef.current) {
//                 console.log('Connecting camera stream to preview');
//                 videoElement.srcObject = cameraStreamRef.current;
//                 videoElement.play().catch(e => console.error('Error playing preview:', e));
//             }
//         }
//     }, [showCameraPreview, cameraPreviewMinimized]);

//     const renderInstructions = () => (
//         <div className="instructions-container">
//             <h2 className="instructions-title">Test Instructions</h2>
//             <div className="instruction-section">
//                 <h3>Test Structure</h3>
//                 <ul>
//                     <li>The test consists of 40 questions divided into 4 sections:</li>
//                     <li>Technical Knowledge (10 questions)</li>
//                     <li>Aptitude Assessment (10 questions)</li>
//                     <li>Logical Reasoning (10 questions)</li>
//                     <li>Personality Assessment (10 questions)</li>
//                 </ul>
//             </div>
//             <div className="instruction-section">
//                 <h3>Time Limit</h3>
//                 <ul>
//                     <li>Total duration: 60 minutes</li>
//                     <li>Recommended time per section: 15 minutes</li>
//                     <li>Timer will be visible throughout the test</li>
//                     <li>Test auto-submits when time expires</li>
//                 </ul>
//             </div>
//             <div className="instruction-section">
//                 <h3>Important Rules</h3>
//                 <ul>
//                     <li>Questions are randomized within each section</li>
//                     <li>All questions are mandatory</li>
//                     <li>You can review your answers before final submission</li>
//                     <li>Ensure stable internet connection throughout the test</li>
//                     <li>Window switching is monitored and recorded</li>
//                     <li>Your camera and microphone will be monitored for test integrity</li>
//                     <li>A live camera preview will be shown during the test</li>
//                     <li>Excessive noise or tab violations will result in test termination</li>
//                 </ul>
//             </div>
//             <div className="confirmation-checkbox">
//                 <input
//                     type="checkbox"
//                     id="instructions-confirmation"
//                     checked={hasReadInstructions}
//                     onChange={(e) => setHasReadInstructions(e.target.checked)}
//                 />
//                 <label htmlFor="instructions-confirmation">
//                     I have read and understood all instructions
//                 </label>
//             </div>
//             <button
//                 className="start-button"
//                 disabled={!hasReadInstructions}
//                 onClick={() => setStage(TEST_STAGES.CONFIRMATION)}
//             >
//                 Start Test
//             </button>
//         </div>
//     );

//     const renderConfirmation = () => (
//         <div className="confirmation-container">
//             <AlertCircle size={48} className="confirmation-icon" />
//             <h2>Ready to Begin?</h2>
//             <p>Please ensure:</p>
//             <ul>
//                 <li>You are in a quiet environment</li>
//                 <li>You have stable internet connection</li>
//                 <li>You have 60 minutes available</li>
//                 <li>You won't be interrupted</li>
//                 <li>You remain in this window during the test</li>
//                 <li>You have a working camera and microphone</li>
//                 <li>You understand that excessive noise or tab switching will terminate your test</li>
//             </ul>
//             <div className="confirmation-buttons">
//                 <button
//                     className="back-button"
//                     onClick={() => setStage(TEST_STAGES.INSTRUCTIONS)}
//                 >
//                     Back to Instructions
//                 </button>
//                 <button
//                     className="confirm-button"
//                     onClick={() => setStage(TEST_STAGES.DEVICE_SETUP)}
//                 >
//                     Next: Setup Devices
//                 </button>
//             </div>
//         </div>
//     );
    
//     const renderDeviceSetup = () => (
//         <div className="device-setup-container">
//             <h2 className="device-setup-title">Camera & Microphone Setup</h2>
//             <p className="device-setup-instructions">
//                 Please enable your camera and microphone. Both are required to take the test.
//                 Your video and audio will be streamed to the test administrator for monitoring.
//             </p>
            
//             <div className="device-setup-grid">
//                 <div className="device-setup-item">
//                     <h3>Camera</h3>
//                     <div className="device-preview">
//                         {/* Direct camera access instead of using CameraCapture component */}
//                         <div className="camera-setup">
//                             <video
//                                 ref={(videoEl) => {
//                                     if (videoEl && !activeStream) {
//                                         console.log('🎥 Requesting camera access...');
//                                         navigator.mediaDevices.getUserMedia({
//                                             video: { 
//                                                 width: { ideal: 640 },
//                                                 height: { ideal: 480 },
//                                                 facingMode: "user"
//                                             },
//                                             audio: true
//                                         })
//                                         .then((stream) => {
//                                             console.log('🎥 Camera stream obtained:', stream);
//                                             videoEl.srcObject = stream;
//                                             videoEl.play();
//                                             handleCameraStream(stream);
//                                             setMicEnabled(true); // Since we're getting audio too
//                                         })
//                                         .catch((error) => {
//                                             console.error('❌ Camera access error:', error);
//                                             setCameraEnabled(false);
//                                         });
//                                     }
//                                 }}
//                                 className="camera-setup-video"
//                                 autoPlay
//                                 playsInline
//                                 muted
//                                 style={{
//                                     width: '100%',
//                                     height: '200px',
//                                     objectFit: 'cover',
//                                     borderRadius: '10px',
//                                     background: '#000'
//                                 }}
//                             />
//                         </div>
//                     </div>
//                     <div className="device-status">
//                         {cameraEnabled ? (
//                             <span className="status-enabled">Camera enabled ✓</span>
//                         ) : (
//                             <span className="status-disabled">Camera not enabled</span>
//                         )}
//                     </div>
//                 </div>
                
//                 <div className="device-setup-item">
//                     <h3>Microphone</h3>
//                     <div className="device-preview">
//                         <div className="mic-setup">
//                             <div className="mic-placeholder">
//                                 <Mic size={48} />
//                                 <p>Microphone will be enabled with camera</p>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="device-status">
//                         {micEnabled ? (
//                             <span className="status-enabled">Microphone enabled ✓</span>
//                         ) : (
//                             <span className="status-disabled">Microphone not enabled</span>
//                         )}
//                     </div>
//                 </div>
//             </div>
            
//             <div className="device-setup-footer">
//                 <p className="device-setup-note">
//                     Both camera and microphone are required for test integrity. The test cannot 
//                     start until both devices are enabled. Your video and audio will be monitored
//                     by the test administrator throughout the test.
//                 </p>
                
//                 <div className="device-setup-buttons">
//                     <button
//                         className="back-button"
//                         onClick={() => setStage(TEST_STAGES.CONFIRMATION)}
//                     >
//                         Back
//                     </button>
//                     <button
//                         className="start-test-button"
//                         disabled={!cameraEnabled || !micEnabled}
//                         onClick={() => {
//                             const stream = activeStream || cameraStreamRef.current;
//                             console.log('🚀 Starting test with camera stream:', stream);
//                             console.log('🚀 Camera enabled:', cameraEnabled);
//                             console.log('🚀 Mic enabled:', micEnabled);
                            
//                             if (stream) {
//                                 rtcService.initializeAsStudent(
//                                     stream,
//                                     user.username,
//                                     Date.now().toString()
//                                 );
//                             }
                            
//                             // Move to test stage
//                             setStage(TEST_STAGES.TEST);
//                         }}
//                     >
//                         Start Test
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );

//     const renderTest = () => {
//         const question = getCurrentQuestion();
//         if (!question) return <div>Loading questions...</div>;
        
//         const currentSection = getCurrentSectionName();
//         const isTestActive = stage === TEST_STAGES.TEST;
        
//         return (
//             <div className="test-container">
//                 {showWarning && (
//                     <div className="caught-notification animate__animated animate__bounceIn">
//                         <div className="caught-header">
//                             <AlertTriangle className="caught-icon" size={32} />
//                             <h3>
//                                 {warningType === 'tab' ? 'Tab Violation Detected!' : 'Noise Violation Detected!'}
//                             </h3>
//                         </div>
//                         <div className="caught-content">
//                             <p className="caught-message">
//                                 {warningType === 'tab'
//                                     ? 'Please stay focused on the test window to maintain integrity.'
//                                     : 'Please maintain a quiet environment during the test.'}
//                             </p>
//                             <div className="violation-info">
//                                 <span className="violation-label">
//                                     {warningType === 'tab' ? 'Tab Violations:' : 'Noise Violations:'}
//                                 </span>
//                                 <span className="violation-number">
//                                     {warningType === 'tab' ? tabViolationCount : noiseViolationCount}
//                                 </span>
//                             </div>
//                         </div>
//                         <div className="caught-progress">
//                             <div
//                                 className="progress-fill"
//                                 style={{ 
//                                     width: `${Math.min(
//                                         (warningType === 'tab' ? tabViolationCount : noiseViolationCount) * 33, 
//                                         100
//                                     )}%` 
//                                 }}
//                             />
//                         </div>
//                     </div>
//                 )}
                
//                 {/* Live Camera Preview */}
//                 {showCameraPreview && (
//                     <div 
//                         className={`camera-preview-modal ${cameraPreviewMinimized ? 'minimized' : ''}`}
//                         style={{
//                             position: 'fixed',
//                             left: cameraPreviewPosition.x,
//                             top: cameraPreviewPosition.y,
//                             zIndex: 1000
//                         }}
//                     >
//                         <div className="camera-preview-header">
//                             <span className="camera-preview-title">
//                                 <Video size={14} />
//                                 Live Camera
//                             </span>
//                             <div className="camera-preview-controls">
//                                 <button
//                                     className="camera-control-btn"
//                                     onClick={() => setCameraPreviewMinimized(!cameraPreviewMinimized)}
//                                     title={cameraPreviewMinimized ? "Expand" : "Minimize"}
//                                 >
//                                     {cameraPreviewMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
//                                 </button>
//                                 <button
//                                     className="camera-control-btn"
//                                     onClick={() => setShowCameraPreview(false)}
//                                     title="Close"
//                                 >
//                                     <X size={14} />
//                                 </button>
//                             </div>
//                         </div>
//                         {!cameraPreviewMinimized && (
//                             <div className="camera-preview-content">
//                                 <video
//                                     ref={(el) => {
//                                         if (el) {
//                                             cameraPreviewRef.current = el;
//                                             console.log('🎥 Video element created/updated');
                                            
//                                             // Connect stream immediately
//                                             const stream = activeStream || cameraStreamRef.current;
//                                             if (stream && el.srcObject !== stream) {
//                                                 console.log('🎥 Connecting stream to video element');
//                                                 el.srcObject = stream;
//                                                 el.play().catch(e => console.error('❌ Error playing video:', e));
//                                             }
//                                         }
//                                     }}
//                                     className="camera-preview-video"
//                                     autoPlay
//                                     playsInline
//                                     muted
//                                 />
//                                 <div className="camera-preview-footer">
//                                     <div className="status-indicator active"></div>
//                                     <span>Monitored by proctor</span>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 )}
                
//                 {/* Hidden noise monitor for continued monitoring */}
//                 <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
//                     <NoiseMonitor 
//                         isTestActive={isTestActive} 
//                         onNoiseViolation={handleNoiseViolation}
//                     />
//                 </div>
                
//                 {/* Status indicators */}
//                 <div className="camera-minimized">
//                     <div className="camera-status">
//                         <div className="status-indicator active"></div>
//                         <Video size={16} />
//                         <span>Live camera stream active</span>
//                         {!showCameraPreview && (activeStream || cameraStreamRef.current) && (
//                             <button 
//                                 className="show-preview-btn"
//                                 onClick={() => {
//                                     console.log('🎥 Restoring camera preview');
//                                     setShowCameraPreview(true);
//                                 }}
//                                 title="Show camera preview"
//                             >
//                                 Show Preview
//                             </button>
//                         )}
//                     </div>
                    
//                     <div className="noise-status">
//                         <div className="status-indicator active"></div>
//                         <Mic size={16} />
//                         <span>Live microphone active</span>
//                     </div>
//                 </div>
                
//                 <div className="test-header">
//                     <div className="section-info">
//                         <h2>{formatSectionName(currentSection)}</h2>
//                         <p>Question {currentQuestion + 1} of 40</p>
//                     </div>
//                     <div className="timer">
//                         <Clock size={20} />
//                         <span className={timeRemaining < 300 ? 'time-warning' : ''}>
//                             {formatTime(timeRemaining)}
//                         </span>
//                     </div>
//                 </div>
                
//                 {/* Debug info - remove in production */}
//                 {process.env.NODE_ENV === 'development' && (
//                     <div style={{ 
//                         position: 'fixed', 
//                         bottom: '10px', 
//                         left: '10px', 
//                         background: 'rgba(0,0,0,0.8)', 
//                         color: 'white', 
//                         padding: '10px', 
//                         borderRadius: '5px',
//                         fontSize: '12px',
//                         zIndex: 9999,
//                         display:'none'
//                     }}>
//                         <div>Camera Stream: {activeStream ? '✅ Active' : '❌ None'}</div>
//                         <div>Stream Ref: {cameraStreamRef.current ? '✅ Active' : '❌ None'}</div>
//                         <div>Camera Enabled: {cameraEnabled ? '✅ Yes' : '❌ No'}</div>
//                         <div>Show Preview: {showCameraPreview ? '✅ Yes' : '❌ No'}</div>
//                         <div>Preview Element: {cameraPreviewRef.current ? '✅ Ready' : '❌ None'}</div>
//                         <button 
//                             onClick={() => {
//                                 console.log('🔍 Manual camera preview test');
//                                 setShowCameraPreview(true);
//                                 const stream = activeStream || cameraStreamRef.current;
//                                 if (stream && cameraPreviewRef.current) {
//                                     cameraPreviewRef.current.srcObject = stream;
//                                     cameraPreviewRef.current.play();
//                                 }
//                             }}
//                             style={{ marginTop: '5px', padding: '2px 5px' }}
//                         >
//                             Test Preview
//                         </button>
//                     </div>
//                 )}
//                 <div className="progress-sections">
//                     {Object.entries(sectionProgress).map(([section, progress]) => (
//                         <div key={section} className="section-progress">
//                             <span className="section-label">{section}</span>
//                             <div className="progress-bar">
//                                 <div
//                                     className="progress-fill"
//                                     style={{ width: `${progress}%` }}
//                                 />
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//                 <div className="question-section">
//                     <p className="question-text">
//                         {question.question}
//                     </p>
//                     {question.isFreeText ? (
//                         <textarea
//                             className="free-text-input"
//                             value={answers[question.id] || ''}
//                             onChange={(e) => handleAnswer(question.id, e.target.value)}
//                             placeholder="Enter your code here..."
//                             rows={6}
//                         />
//                     ) : (
//                         <div className="options-list">
//                             {question.options.map((option, idx) => {
//                                 const isSelected = answers[question.id] === idx;
                                
//                                 return (
//                                     <button
//                                         key={idx}
//                                         className={`option-button ${isSelected ? 'selected' : ''}`}
//                                         onClick={() => handleAnswer(question.id, idx)}
//                                     >
//                                         {option}
//                                     </button>
//                                 );
//                             })}
//                         </div>
//                     )}
//                 </div>
                
//                 <div className="navigation">
//                     {currentQuestion === shuffledQuestions.length - 1 ? (
//                         <button
//                             className="review-button"
//                             onClick={() => setStage(TEST_STAGES.REVIEW)}
//                         >
//                             Review Answers
//                         </button>
//                     ) : (
//                         <button
//                             className="next-button"
//                             onClick={() => setCurrentQuestion(prev => prev + 1)}
//                             disabled={!question || answers[question.id] === undefined}
//                         >
//                             Next Question
//                         </button>
//                     )}
//                 </div>
//             </div>
//         );
//     };

//     const renderReview = () => (
//         <div className="review-container">
//             <h2>Review Your Answers</h2>
//             <div className="section-summary">
//                 {Object.entries(sectionProgress).map(([section, progress]) => (
//                     <div key={section} className="section-status">
//                         <h3>{section}</h3>
//                         <p>{progress}% Complete</p>
//                     </div>
//                 ))}
//             </div>
//             <div className="time-remaining">
//                 <Clock size={20} />
//                 <span>{formatTime(timeRemaining)}</span>
//             </div>
//             <div className="violations-summary">
//                 <div className="violation-item">
//                     <p>Tab Violations: <span className="violation-count">{tabViolationCount}</span></p>
//                 </div>
//                 <div className="violation-item">
//                     <p>Noise Violations: <span className="violation-count">{noiseViolationCount}</span></p>
//                 </div>
//             </div>
//             <button
//                 className="submit-button"
//                 onClick={() => setStage(TEST_STAGES.SUBMIT_CONFIRMATION)}
//                 disabled={Object.keys(answers).length < shuffledQuestions.length}
//             >
//                 Submit Test
//             </button>
//         </div>
//     );

//     const renderSubmitConfirmation = () => (
//         <div className="submit-confirmation">
//             <AlertTriangle size={48} className="warning-icon" />
//             <h2>Confirm Submission</h2>
//             <p>Are you sure you want to submit your test?</p>
//             <p>Tab violations recorded: {tabViolationCount}</p>
//             <p>Noise violations recorded: {noiseViolationCount}</p>
//             <p>This action cannot be undone.</p>
//             <div className="confirmation-buttons">
//                 <button
//                     className="back-button"
//                     onClick={() => setStage(TEST_STAGES.REVIEW)}
//                 >
//                     Return to Review
//                 </button>
//                 <button
//                     className="submit-button"
//                     onClick={() => handleSubmit()}
//                 >
//                     Confirm Submission
//                 </button>
//             </div>
//         </div>
//     );

//     const renderCompleted = () => (
//         <div className="completion-container">
//             <CheckCircle size={48} className="success-icon" />
//             <h2>Test Completed</h2>
//             <p>Your responses have been recorded successfully.</p>
//             <p>Tab violations recorded: {tabViolationCount}</p>
//             <p>Noise violations recorded: {noiseViolationCount}</p>
//             <p>You may now close this window.</p>
//         </div>
//     );
    
//     const renderTerminated = () => (
//         <div className="terminated-container">
//             <AlertTriangle size={48} className="terminated-icon" />
//             <h2>Test Terminated</h2>
//             <p className="termination-reason">{terminationReason}</p>
//             <div className="violation-summary">
//                 <p>Tab violations: <span className="violation-count">{tabViolationCount}</span></p>
//                 <p>Noise violations: <span className="violation-count">{noiseViolationCount}</span></p>
//             </div>
//             <p className="termination-message">
//                 Your test has been terminated due to integrity violations. 
//                 Please contact your administrator for more information.
//             </p>
//             <p className="termination-note">
//                 You will not be able to log in again to retake this test.
//             </p>
//         </div>
//     );

//     const renderStage = () => {
//         switch (stage) {
//             case TEST_STAGES.INSTRUCTIONS:
//                 return renderInstructions();
//             case TEST_STAGES.CONFIRMATION:
//                 return renderConfirmation();
//             case TEST_STAGES.DEVICE_SETUP:
//                 return renderDeviceSetup();
//             case TEST_STAGES.TEST:
//                 return renderTest();
//             case TEST_STAGES.REVIEW:
//                 return renderReview();
//             case TEST_STAGES.SUBMIT_CONFIRMATION:
//                 return renderSubmitConfirmation();
//             case TEST_STAGES.COMPLETED:
//                 return renderCompleted();
//             case TEST_STAGES.TERMINATED:
//                 return renderTerminated();
//             default:
//                 return null;
//         }
//     };

//     return (
//         <div className="test-wrapper">
//             {renderStage()}
//         </div>
//     );
// };



// import React, { useState, useEffect, useRef } from 'react';
// import { Clock, AlertCircle, CheckCircle, AlertTriangle, Video, Mic, X, Minimize2, Maximize2 } from 'lucide-react';
// import { QUESTIONS } from '../../data/constants';
// import { NoiseMonitor } from '../Noise/NoiseMonitor';
// import { CameraCapture } from '../Camera/CameraCapture';
// import rtcService from '../../services/RTCStreamingService';
// import './TestInterface.css';

// const TEST_STAGES = {
//     INSTRUCTIONS: 'instructions',
//     CONFIRMATION: 'confirmation',
//     DEVICE_SETUP: 'device_setup',
//     TEST: 'test',
//     REVIEW: 'review',
//     SUBMIT_CONFIRMATION: 'submit_confirmation',
//     COMPLETED: 'completed',
//     TERMINATED: 'terminated'
// };

// // Helper function to shuffle array using Fisher-Yates algorithm
// const shuffleArray = (array) => {
//     const shuffled = [...array];
//     for (let i = shuffled.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
//     }
//     return shuffled;
// };

// export const TestInterface = ({ user, onComplete, scheduledStartTime }) => {
//     const [stage, setStage] = useState(TEST_STAGES.INSTRUCTIONS);
//     const [currentQuestion, setCurrentQuestion] = useState(0);
//     const [answers, setAnswers] = useState({});
//     const [timeRemaining, setTimeRemaining] = useState(60 * 60);
//     const [hasReadInstructions, setHasReadInstructions] = useState(false);
//     const [sectionProgress, setSectionProgress] = useState({
//         technical: 0,
//         aptitude: 0,
//         logical: 0,
//         personality: 0
//     });
//     const [tabViolationCount, setTabViolationCount] = useState(0);
//     const [noiseViolationCount, setNoiseViolationCount] = useState(0);
//     const [showWarning, setShowWarning] = useState(false);
//     const [warningType, setWarningType] = useState('tab');
//     const [isTerminated, setIsTerminated] = useState(false);
//     const [terminationReason, setTerminationReason] = useState('');
    
//     // Device setup state
//     const [cameraEnabled, setCameraEnabled] = useState(false);
//     const [micEnabled, setMicEnabled] = useState(false);
//     const [activeStream, setActiveStream] = useState(null); // Store the active stream
    
//     // Camera preview state
//     const [showCameraPreview, setShowCameraPreview] = useState(false);
//     const [cameraPreviewMinimized, setCameraPreviewMinimized] = useState(false);
//     const [cameraPreviewPosition, setCameraPreviewPosition] = useState({ x: 20, y: 20 });
    
//     // Scheduled time state
//     const [isTestTimeReached, setIsTestTimeReached] = useState(false);
//     const [timeToStart, setTimeToStart] = useState(0); // Time remaining until test starts (in seconds)
    
//     const warningTimeoutRef = useRef(null);
//     const cameraStreamRef = useRef(null);
//     const cameraPreviewRef = useRef(null);
//     const [shuffledQuestions, setShuffledQuestions] = useState([]);
//     const [questionSections, setQuestionSections] = useState({});

//     // Initialize shuffled questions when component mounts
//     useEffect(() => {
//         const sections = {
//             technical: QUESTIONS.slice(0, 10),
//             aptitude: QUESTIONS.slice(10, 20),
//             logical: QUESTIONS.slice(20, 30),
//             personality: QUESTIONS.slice(30, 40)
//         };
        
//         const sectionMap = {};
//         Object.entries(sections).forEach(([sectionName, questions]) => {
//             questions.forEach(q => {
//                 sectionMap[q.id] = sectionName;
//             });
//         });
//         setQuestionSections(sectionMap);
        
//         const shuffledSections = {
//             technical: shuffleArray(sections.technical),
//             aptitude: shuffleArray(sections.aptitude),
//             logical: shuffleArray(sections.logical),
//             personality: shuffleArray(sections.personality)
//         };
        
//         const allShuffled = [
//             ...shuffledSections.technical,
//             ...shuffledSections.aptitude,
//             ...shuffledSections.logical,
//             ...shuffledSections.personality
//         ];
        
//         setShuffledQuestions(allShuffled);
//     }, []);
    
//     // Effect to check scheduled start time
//     useEffect(() => {
//         if (!scheduledStartTime) {
//             // If no scheduled time is provided, allow immediate start
//             setIsTestTimeReached(true);
//             return;
//         }
        
//         const checkTime = () => {
//             const now = new Date();
//             const scheduledTime = new Date(scheduledStartTime);
            
//             if (now >= scheduledTime) {
//                 setIsTestTimeReached(true);
//                 setTimeToStart(0);
//                 return true;
//             } else {
//                 // Calculate time difference in seconds
//                 const diffMs = scheduledTime - now;
//                 const diffSec = Math.floor(diffMs / 1000);
//                 setTimeToStart(diffSec);
//                 setIsTestTimeReached(false);
//                 return false;
//             }
//         };
        
//         // Initial check
//         const isTimeReached = checkTime();
//         if (isTimeReached) {
//             return; // No need to set up interval if time is already reached
//         }
        
//         // Set up interval to check every second
//         const intervalId = setInterval(() => {
//             const isTimeReached = checkTime();
//             if (isTimeReached) {
//                 clearInterval(intervalId);
//             }
//         }, 1000);
        
//         return () => clearInterval(intervalId);
//     }, [scheduledStartTime]);
    
//     // Format time remaining until test starts
//     const formatTimeToStart = () => {
//         if (timeToStart <= 0) return 'Test is available now';
        
//         const hours = Math.floor(timeToStart / 3600);
//         const minutes = Math.floor((timeToStart % 3600) / 60);
//         const seconds = timeToStart % 60;
        
//         if (hours > 0) {
//             return `${hours}h ${minutes}m ${seconds}s until test begins`;
//         } else if (minutes > 0) {
//             return `${minutes}m ${seconds}s until test begins`;
//         } else {
//             return `${seconds}s until test begins`;
//         }
//     };

//     const playAlertSound = () => {
//         const audio = new Audio('https://www.soundjay.com/buttons/beep-01a.mp3');
//         audio.play().catch(error => console.log('Audio playback failed:', error));
//     };

//     const [isPermissionPhase, setIsPermissionPhase] = useState(false);
    
//     useEffect(() => {
//         if (stage === TEST_STAGES.TEST) {
//             setIsPermissionPhase(true);
//             const timer = setTimeout(() => {
//                 setIsPermissionPhase(false);
//             }, 5000);
//             return () => clearTimeout(timer);
//         }
//     }, [stage]);
    
//     // Timer effect
//     useEffect(() => {
//         if (stage === TEST_STAGES.TEST) {
//             const timer = setInterval(() => {
//                 setTimeRemaining(prev => {
//                     if (prev <= 0) {
//                         clearInterval(timer);
//                         handleTimeUp();
//                         return 0;
//                     }
//                     return prev - 1;
//                 });
//             }, 1000);
//             return () => clearInterval(timer);
//         }
//     }, [stage]);
    
//     // Tab switching and keyboard monitoring
//     useEffect(() => {
//         const handleFocus = () => {
//             if (!warningTimeoutRef.current) {
//                 setShowWarning(false);
//             }
//         };

//         const handleBlur = () => {
//             if (stage === TEST_STAGES.TEST && !isPermissionPhase) {
//                 setTabViolationCount(prev => prev + 1);
//                 setWarningType('tab');
//                 setShowWarning(true);
//                 playAlertSound();

//                 if (warningTimeoutRef.current) {
//                     clearTimeout(warningTimeoutRef.current);
//                 }

//                 warningTimeoutRef.current = setTimeout(() => {
//                     setShowWarning(false);
//                     warningTimeoutRef.current = null;
//                 }, 10000);
                
//                 if (tabViolationCount >= 2) {
//                     handleTerminate('tab');
//                 }
//             }
//         };

//         window.addEventListener('focus', handleFocus);
//         window.addEventListener('blur', handleBlur);

//         const handleContextMenu = (e) => {
//             if (stage === TEST_STAGES.TEST) e.preventDefault();
//         };

//         const handleKeyDown = (e) => {
//             if (stage === TEST_STAGES.TEST && !isPermissionPhase) {
//                 if ((e.ctrlKey && (e.key === 't' || e.key === 'n' || e.key === 'w')) ||
//                     e.key === 'F11' ||
//                     (e.altKey && e.key === 'Tab')) {
//                     e.preventDefault();
//                     setTabViolationCount(prev => prev + 1);
//                     setWarningType('tab');
//                     setShowWarning(true);
//                     playAlertSound();

//                     if (warningTimeoutRef.current) {
//                         clearTimeout(warningTimeoutRef.current);
//                     }

//                     warningTimeoutRef.current = setTimeout(() => {
//                         setShowWarning(false);
//                         warningTimeoutRef.current = null;
//                     }, 10000);
                    
//                     if (tabViolationCount >= 2) {
//                         handleTerminate('tab');
//                     }
//                 }
//             }
//         };

//         document.addEventListener('contextmenu', handleContextMenu);
//         document.addEventListener('keydown', handleKeyDown);

//         return () => {
//             window.removeEventListener('focus', handleFocus);
//             window.removeEventListener('blur', handleBlur);
//             document.removeEventListener('contextmenu', handleContextMenu);
//             document.removeEventListener('keydown', handleKeyDown);
//             if (warningTimeoutRef.current) {
//                 clearTimeout(warningTimeoutRef.current);
//             }
//         };
//     }, [stage, tabViolationCount, isPermissionPhase]);

//     // Update violation counts in the service
//     useEffect(() => {
//         if (stage === TEST_STAGES.TEST && cameraStreamRef.current) {
//             rtcService.updateViolationCount('tab', tabViolationCount);
//         }
//     }, [tabViolationCount, stage]);
    
//     useEffect(() => {
//         if (stage === TEST_STAGES.TEST && cameraStreamRef.current) {
//             rtcService.updateViolationCount('noise', noiseViolationCount);
//         }
//     }, [noiseViolationCount, stage]);
    
//     // Cleanup on unmount
//     useEffect(() => {
//         return () => {
//             if (cameraStreamRef.current) {
//                 cameraStreamRef.current.getTracks().forEach(track => track.stop());
//             }
//             rtcService.cleanupStudentConnection();
//         };
//     }, []);

//     const formatTime = (seconds) => {
//         const minutes = Math.floor(seconds / 60);
//         const remainingSeconds = seconds % 60;
//         return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
//     };

//     const handleTimeUp = () => {
//         handleSubmit(true);
//     };
    
//     const handleNoiseViolation = (level) => {
//         setNoiseViolationCount(prev => prev + 1);
//         setWarningType('noise');
//         setShowWarning(true);
        
//         if (warningTimeoutRef.current) {
//             clearTimeout(warningTimeoutRef.current);
//         }
        
//         warningTimeoutRef.current = setTimeout(() => {
//             setShowWarning(false);
//             warningTimeoutRef.current = null;
//         }, 10000);
        
//         if (level === 'high' && noiseViolationCount >= 2) {
//             handleTerminate('noise');
//         }
//     };
    
//     const handleTerminate = (reason) => {
//         if (cameraStreamRef.current) {
//             cameraStreamRef.current.getTracks().forEach(track => track.stop());
//         }
        
//         let reasonText = '';
//         switch(reason) {
//             case 'tab':
//                 reasonText = 'Excessive tab violations detected';
//                 break;
//             case 'noise':
//                 reasonText = 'Excessive noise violations detected';
//                 break;
//             default:
//                 reasonText = 'Test integrity violation detected';
//         }
        
//         setTerminationReason(reasonText);
//         setIsTerminated(true);
//         setStage(TEST_STAGES.TERMINATED);
        
//         const result = {
//             user: user.name,
//             score: 0,
//             timeSpent: 3600 - timeRemaining,
//             answers,
//             sections: {
//                 technical: 0,
//                 aptitude: 0, 
//                 logical: 0,
//                 personality: 0
//             },
//             submittedBy: 'terminated',
//             violations: tabViolationCount,
//             noiseViolations: noiseViolationCount,
//             terminationReason: reasonText
//         };
        
//         onComplete(result);
//     };

//     const handleAnswer = (questionId, selectedOption) => {
//         setAnswers(prevAnswers => {
//             const newAnswers = {
//                 ...prevAnswers,
//                 [questionId]: selectedOption
//             };
            
//             const questionSection = questionSections[questionId];
            
//             const sectionCounts = {
//                 technical: 0,
//                 aptitude: 0,
//                 logical: 0,
//                 personality: 0
//             };
            
//             Object.keys(newAnswers).forEach(qId => {
//                 const section = questionSections[qId];
//                 if (section) {
//                     sectionCounts[section]++;
//                 }
//             });
            
//             const updatedProgress = {
//                 technical: (sectionCounts.technical / 10) * 100,
//                 aptitude: (sectionCounts.aptitude / 10) * 100,
//                 logical: (sectionCounts.logical / 10) * 100,
//                 personality: (sectionCounts.personality / 10) * 100
//             };
            
//             setSectionProgress(updatedProgress);
//             return newAnswers;
//         });
//     };

//     const handleSubmit = (isTimeUp = false) => {
//         if (cameraStreamRef.current) {
//             cameraStreamRef.current.getTracks().forEach(track => track.stop());
//         }
        
//         const score = Object.entries(answers).reduce((acc, [questionId, answer]) => {
//           const question = QUESTIONS.find(q => q.id.toString() === questionId);
//           if (!question) return acc;
          
//           if (question.isFreeText) {
//             const normalizedAnswer = answer.trim().replace(/\s+/g, ' ');
//             const normalizedCorrect = question.correctAnswer.trim().replace(/\s+/g, ' ');
//             return acc + (normalizedAnswer === normalizedCorrect ? 1 : 0);
//           }
//           return acc + (question.correctAnswer === answer ? 1 : 0);
//         }, 0);
      
//         const sectionScores = {
//             technical: calculateSectionScore('technical'),
//             aptitude: calculateSectionScore('aptitude'),
//             logical: calculateSectionScore('logical'),
//             personality: calculateSectionScore('personality'),
//         };
      
//         const result = {
//           user: user.name,
//           score: (score / QUESTIONS.length) * 100,
//           timeSpent: 3600 - timeRemaining,
//           answers,
//           sections: sectionScores,
//           submittedBy: isTimeUp ? 'timeout' : 'user',
//           violations: tabViolationCount,
//           noiseViolations: noiseViolationCount,
//         };
      
//         onComplete(result);
//         setStage(TEST_STAGES.COMPLETED);
//     };

//     const calculateSectionScore = (sectionName) => {
//         const sectionQuestionIds = Object.entries(questionSections)
//             .filter(([_, section]) => section === sectionName)
//             .map(([id]) => id);
        
//         const answeredCount = sectionQuestionIds.filter(id => answers[id] !== undefined).length;
//         return (answeredCount / 10) * 100;
//     };

//     const getCurrentQuestion = () => {
//         if (shuffledQuestions.length === 0) return null;
//         return shuffledQuestions[currentQuestion];
//     };

//     const getCurrentSectionName = () => {
//         const question = getCurrentQuestion();
//         if (!question) return '';
//         return questionSections[question.id];
//     };

//     const formatSectionName = (section) => {
//         switch(section) {
//             case 'technical': return 'Technical Knowledge';
//             case 'aptitude': return 'Aptitude Assessment';
//             case 'logical': return 'Logical Reasoning';
//             case 'personality': return 'Personality Assessment';
//             default: return '';
//         }
//     };

//     // Camera preview update when stream changes
//     const handleCameraStream = (stream) => {
//         console.log('🎥 Camera stream received:', stream); // Debug log
//         cameraStreamRef.current = stream;
//         setActiveStream(stream); // Store in state too
//         setCameraEnabled(!!stream);
        
//         // If we're in test stage, immediately show the preview
//         if (stage === TEST_STAGES.TEST && stream) {
//             console.log('🎥 Test stage - enabling camera preview');
//             setShowCameraPreview(true);
//         }
        
//         // Update preview video immediately if it exists
//         if (stream && cameraPreviewRef.current) {
//             console.log('🎥 Connecting stream to preview video element');
//             cameraPreviewRef.current.srcObject = stream;
//             cameraPreviewRef.current.play().catch(e => console.error('❌ Error playing preview:', e));
//         }
//     };

//     // Effect to update camera preview when stream changes
//     useEffect(() => {
//         if (cameraPreviewRef.current && cameraStreamRef.current && showCameraPreview && !cameraPreviewMinimized) {
//             const videoElement = cameraPreviewRef.current;
            
//             // Only update if not already connected
//             if (videoElement.srcObject !== cameraStreamRef.current) {
//                 console.log('Updating camera preview with existing stream');
//                 videoElement.srcObject = cameraStreamRef.current;
//                 videoElement.play().catch(e => console.error('Error playing preview:', e));
//             }
//         }
//     }, [stage, showCameraPreview, cameraEnabled, cameraPreviewMinimized]);

//     // Show camera preview when test stage begins
//     useEffect(() => {
//         console.log('🔄 Stage changed to:', stage);
//         console.log('🔄 Camera enabled:', cameraEnabled);
//         console.log('🔄 Active stream:', activeStream);
//         console.log('🔄 Stream ref:', cameraStreamRef.current);
        
//         if (stage === TEST_STAGES.TEST) {
//             // Enable preview as soon as test starts
//             setShowCameraPreview(true);
            
//             // If we have a stream, connect it
//             const stream = activeStream || cameraStreamRef.current;
//             if (stream) {
//                 console.log('🎥 Test started - connecting camera preview');
//                 setTimeout(() => {
//                     if (cameraPreviewRef.current) {
//                         cameraPreviewRef.current.srcObject = stream;
//                         cameraPreviewRef.current.play().catch(e => console.error('❌ Error playing preview:', e));
//                     }
//                 }, 200);
//             }
//         }
//     }, [stage, activeStream, cameraEnabled]);

//     // Effect to continuously ensure video stream is connected
//     useEffect(() => {
//         if (showCameraPreview && cameraPreviewRef.current && cameraStreamRef.current) {
//             const videoElement = cameraPreviewRef.current;
            
//             // Check if stream is already connected
//             if (videoElement.srcObject !== cameraStreamRef.current) {
//                 console.log('Connecting camera stream to preview');
//                 videoElement.srcObject = cameraStreamRef.current;
//                 videoElement.play().catch(e => console.error('Error playing preview:', e));
//             }
//         }
//     }, [showCameraPreview, cameraPreviewMinimized]);

//     const renderInstructions = () => (
//         <div className="instructions-container">
//             <h2 className="instructions-title">Test Instructions</h2>
            
//             {/* Scheduled time indicator */}
//             {scheduledStartTime && (
//                 <div className={`scheduled-time-indicator ${isTestTimeReached ? 'time-reached' : ''}`}>
//                     <Clock size={20} />
//                     <span>{formatTimeToStart()}</span>
//                 </div>
//             )}
            
//             <div className="instruction-section">
//                 <h3>Test Structure</h3>
//                 <ul>
//                     <li>The test consists of 40 questions divided into 4 sections:</li>
//                     <li>Technical Knowledge (10 questions)</li>
//                     <li>Aptitude Assessment (10 questions)</li>
//                     <li>Logical Reasoning (10 questions)</li>
//                     <li>Personality Assessment (10 questions)</li>
//                 </ul>
//             </div>
//             <div className="instruction-section">
//                 <h3>Time Limit</h3>
//                 <ul>
//                     <li>Total duration: 60 minutes</li>
//                     <li>Recommended time per section: 15 minutes</li>
//                     <li>Timer will be visible throughout the test</li>
//                     <li>Test auto-submits when time expires</li>
//                 </ul>
//             </div>
//             <div className="instruction-section">
//                 <h3>Important Rules</h3>
//                 <ul>
//                     <li>Questions are randomized within each section</li>
//                     <li>All questions are mandatory</li>
//                     <li>You can review your answers before final submission</li>
//                     <li>Ensure stable internet connection throughout the test</li>
//                     <li>Window switching is monitored and recorded</li>
//                     <li>Your camera and microphone will be monitored for test integrity</li>
//                     <li>A live camera preview will be shown during the test</li>
//                     <li>Excessive noise or tab violations will result in test termination</li>
//                 </ul>
//             </div>
//             <div className="confirmation-checkbox">
//                 <input
//                     type="checkbox"
//                     id="instructions-confirmation"
//                     checked={hasReadInstructions}
//                     onChange={(e) => setHasReadInstructions(e.target.checked)}
//                 />
//                 <label htmlFor="instructions-confirmation">
//                     I have read and understood all instructions
//                 </label>
//             </div>
//             <button
//                 className={`start-button ${!isTestTimeReached ? 'waiting' : ''}`}
//                 disabled={!hasReadInstructions || !isTestTimeReached}
//                 onClick={() => setStage(TEST_STAGES.CONFIRMATION)}
//             >
//                 {isTestTimeReached ? 'Start Test' : 'Waiting for scheduled time...'}
//             </button>
            
//             {!isTestTimeReached && (
//                 <p className="schedule-note">
//                     The test will be available to start at {new Date(scheduledStartTime).toLocaleString()}
//                 </p>
//             )}
//         </div>
//     );

//     const renderConfirmation = () => (
//         <div className="confirmation-container">
//             <AlertCircle size={48} className="confirmation-icon" />
//             <h2>Ready to Begin?</h2>
            
//             {/* Scheduled time indicator */}
//             {scheduledStartTime && !isTestTimeReached && (
//                 <div className="scheduled-time-warning">
//                     <Clock size={20} />
//                     <span>The test is scheduled to start at {new Date(scheduledStartTime).toLocaleString()}</span>
//                     <span>({formatTimeToStart()})</span>
//                 </div>
//             )}
            
//             <p>Please ensure:</p>
//             <ul>
//                 <li>You are in a quiet environment</li>
//                 <li>You have stable internet connection</li>
//                 <li>You have 60 minutes available</li>
//                 <li>You won't be interrupted</li>
//                 <li>You remain in this window during the test</li>
//                 <li>You have a working camera and microphone</li>
//                 <li>You understand that excessive noise or tab switching will terminate your test</li>
//             </ul>
//             <div className="confirmation-buttons">
//                 <button
//                     className="back-button"
//                     onClick={() => setStage(TEST_STAGES.INSTRUCTIONS)}
//                 >
//                     Back to Instructions
//                 </button>
//                 <button
//                     className={`confirm-button ${!isTestTimeReached ? 'waiting' : ''}`}
//                     disabled={!isTestTimeReached}
//                     onClick={() => setStage(TEST_STAGES.DEVICE_SETUP)}
//                 >
//                     {isTestTimeReached ? 'Next: Setup Devices' : 'Waiting for scheduled time...'}
//                 </button>
//             </div>
//         </div>
//     );
    
//     const renderDeviceSetup = () => (
//         <div className="device-setup-container">
//             <h2 className="device-setup-title">Camera & Microphone Setup</h2>
            
//             {/* Scheduled time indicator */}
//             {scheduledStartTime && !isTestTimeReached && (
//                 <div className="scheduled-time-warning device-setup-scheduled">
//                     <Clock size={20} />
//                     <span>The test is scheduled to start at {new Date(scheduledStartTime).toLocaleString()}</span>
//                     <span>({formatTimeToStart()})</span>
//                 </div>
//             )}
            
//             <p className="device-setup-instructions">
//                 Please enable your camera and microphone. Both are required to take the test.
//                 Your video and audio will be streamed to the test administrator for monitoring.
//             </p>
            
//             <div className="device-setup-grid">
//                 <div className="device-setup-item">
//                     <h3>Camera</h3>
//                     <div className="device-preview">
//                         {/* Direct camera access instead of using CameraCapture component */}
//                         <div className="camera-setup">
//                             <video
//                                 ref={(videoEl) => {
//                                     if (videoEl && !activeStream) {
//                                         console.log('🎥 Requesting camera access...');
//                                         navigator.mediaDevices.getUserMedia({
//                                             video: { 
//                                                 width: { ideal: 640 },
//                                                 height: { ideal: 480 },
//                                                 facingMode: "user"
//                                             },
//                                             audio: true
//                                         })
//                                         .then((stream) => {
//                                             console.log('🎥 Camera stream obtained:', stream);
//                                             videoEl.srcObject = stream;
//                                             videoEl.play();
//                                             handleCameraStream(stream);
//                                             setMicEnabled(true); // Since we're getting audio too
//                                         })
//                                         .catch((error) => {
//                                             console.error('❌ Camera access error:', error);
//                                             setCameraEnabled(false);
//                                         });
//                                     }
//                                 }}
//                                 className="camera-setup-video"
//                                 autoPlay
//                                 playsInline
//                                 muted
//                                 style={{
//                                     width: '100%',
//                                     height: '200px',
//                                     objectFit: 'cover',
//                                     borderRadius: '10px',
//                                     background: '#000'
//                                 }}
//                             />
//                         </div>
//                     </div>
//                     <div className="device-status">
//                         {cameraEnabled ? (
//                             <span className="status-enabled">Camera enabled ✓</span>
//                         ) : (
//                             <span className="status-disabled">Camera not enabled</span>
//                         )}
//                     </div>
//                 </div>
                
//                 <div className="device-setup-item">
//                     <h3>Microphone</h3>
//                     <div className="device-preview">
//                         <div className="mic-setup">
//                             <div className="mic-placeholder">
//                                 <Mic size={48} />
//                                 <p>Microphone will be enabled with camera</p>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="device-status">
//                         {micEnabled ? (
//                             <span className="status-enabled">Microphone enabled ✓</span>
//                         ) : (
//                             <span className="status-disabled">Microphone not enabled</span>
//                         )}
//                     </div>
//                 </div>
//             </div>
            
//             <div className="device-setup-footer">
//                 <p className="device-setup-note">
//                     Both camera and microphone are required for test integrity. The test cannot 
//                     start until both devices are enabled. Your video and audio will be monitored
//                     by the test administrator throughout the test.
//                 </p>
                
//                 <div className="device-setup-buttons">
//                     <button
//                         className="back-button"
//                         onClick={() => setStage(TEST_STAGES.CONFIRMATION)}
//                     >
//                         Back
//                     </button>
//                     <button
//                         className={`start-test-button ${!isTestTimeReached ? 'waiting' : ''}`}
//                         disabled={!cameraEnabled || !micEnabled || !isTestTimeReached}
//                         onClick={() => {
//                             const stream = activeStream || cameraStreamRef.current;
//                             console.log('🚀 Starting test with camera stream:', stream);
//                             console.log('🚀 Camera enabled:', cameraEnabled);
//                             console.log('🚀 Mic enabled:', micEnabled);
                            
//                             if (stream) {
//                                 rtcService.initializeAsStudent(
//                                     stream,
//                                     user.username,
//                                     Date.now().toString()
//                                 );
//                             }
                            
//                             // Move to test stage
//                             setStage(TEST_STAGES.TEST);
//                         }}
//                     >
//                         {isTestTimeReached ? 'Start Test' : 'Waiting for scheduled time...'}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );

//     const renderTest = () => {
//         const question = getCurrentQuestion();
//         if (!question) return <div>Loading questions...</div>;
        
//         const currentSection = getCurrentSectionName();
//         const isTestActive = stage === TEST_STAGES.TEST;
        
//         return (
//             <div className="test-container">
//                 {showWarning && (
//                     <div className="caught-notification animate__animated animate__bounceIn">
//                         <div className="caught-header">
//                             <AlertTriangle className="caught-icon" size={32} />
//                             <h3>
//                                 {warningType === 'tab' ? 'Tab Violation Detected!' : 'Noise Violation Detected!'}
//                             </h3>
//                         </div>
//                         <div className="caught-content">
//                             <p className="caught-message">
//                                 {warningType === 'tab'
//                                     ? 'Please stay focused on the test window to maintain integrity.'
//                                     : 'Please maintain a quiet environment during the test.'}
//                             </p>
//                             <div className="violation-info">
//                                 <span className="violation-label">
//                                     {warningType === 'tab' ? 'Tab Violations:' : 'Noise Violations:'}
//                                 </span>
//                                 <span className="violation-number">
//                                     {warningType === 'tab' ? tabViolationCount : noiseViolationCount}
//                                 </span>
//                             </div>
//                         </div>
//                         <div className="caught-progress">
//                             <div
//                                 className="progress-fill"
//                                 style={{ 
//                                     width: `${Math.min(
//                                         (warningType === 'tab' ? tabViolationCount : noiseViolationCount) * 33, 
//                                         100
//                                     )}%` 
//                                 }}
//                             />
//                         </div>
//                     </div>
//                 )}
                
//                 {/* Live Camera Preview */}
//                 {showCameraPreview && (
//                     <div 
//                         className={`camera-preview-modal ${cameraPreviewMinimized ? 'minimized' : ''}`}
//                         style={{
//                             position: 'fixed',
//                             left: cameraPreviewPosition.x,
//                             top: cameraPreviewPosition.y,
//                             zIndex: 1000
//                         }}
//                     >
//                         <div className="camera-preview-header">
//                             <span className="camera-preview-title">
//                                 <Video size={14} />
//                                 Live Camera
//                             </span>
//                             <div className="camera-preview-controls">
//                                 <button
//                                     className="camera-control-btn"
//                                     onClick={() => setCameraPreviewMinimized(!cameraPreviewMinimized)}
//                                     title={cameraPreviewMinimized ? "Expand" : "Minimize"}
//                                 >
//                                     {cameraPreviewMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
//                                 </button>
//                                 <button
//                                     className="camera-control-btn"
//                                     onClick={() => setShowCameraPreview(false)}
//                                     title="Close"
//                                 >
//                                     <X size={14} />
//                                 </button>
//                             </div>
//                         </div>
//                         {!cameraPreviewMinimized && (
//                             <div className="camera-preview-content">
//                                 <video
//                                     ref={(el) => {
//                                         if (el) {
//                                             cameraPreviewRef.current = el;
//                                             console.log('🎥 Video element created/updated');
                                            
//                                             // Connect stream immediately
//                                             const stream = activeStream || cameraStreamRef.current;
//                                             if (stream && el.srcObject !== stream) {
//                                                 console.log('🎥 Connecting stream to video element');
//                                                 el.srcObject = stream;
//                                                 el.play().catch(e => console.error('❌ Error playing video:', e));
//                                             }
//                                         }
//                                     }}
//                                     className="camera-preview-video"
//                                     autoPlay
//                                     playsInline
//                                     muted
//                                 />
//                                 <div className="camera-preview-footer">
//                                     <div className="status-indicator active"></div>
//                                     <span>Monitored by proctor</span>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 )}
                
//                 {/* Hidden noise monitor for continued monitoring */}
//                 <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
//                     <NoiseMonitor 
//                         isTestActive={isTestActive} 
//                         onNoiseViolation={handleNoiseViolation}
//                     />
//                 </div>
                
//                 {/* Status indicators */}
//                 <div className="camera-minimized">
//                     <div className="camera-status">
//                         <div className="status-indicator active"></div>
//                         <Video size={16} />
//                         <span>Live camera stream active</span>
//                         {!showCameraPreview && (activeStream || cameraStreamRef.current) && (
//                             <button 
//                                 className="show-preview-btn"
//                                 onClick={() => {
//                                     console.log('🎥 Restoring camera preview');
//                                     setShowCameraPreview(true);
//                                 }}
//                                 title="Show camera preview"
//                             >
//                                 Show Preview
//                             </button>
//                         )}
//                     </div>
                    
//                     <div className="noise-status">
//                         <div className="status-indicator active"></div>
//                         <Mic size={16} />
//                         <span>Live microphone active</span>
//                     </div>
//                 </div>
                
//                 <div className="test-header">
//                     <div className="section-info">
//                         <h2>{formatSectionName(currentSection)}</h2>
//                         <p>Question {currentQuestion + 1} of 40</p>
//                     </div>
//                     <div className="timer">
//                         <Clock size={20} />
//                         <span className={timeRemaining < 300 ? 'time-warning' : ''}>
//                             {formatTime(timeRemaining)}
//                         </span>
//                     </div>
//                 </div>
                
//                 {/* Debug info - remove in production */}
//                 {process.env.NODE_ENV === 'development' && (
//                     <div style={{ 
//                         position: 'fixed', 
//                         bottom: '10px', 
//                         left: '10px', 
//                         background: 'rgba(0,0,0,0.8)', 
//                         color: 'white', 
//                         padding: '10px', 
//                         borderRadius: '5px',
//                         fontSize: '12px',
//                         zIndex: 9999,
//                         display:'none'
//                     }}>
//                         <div>Camera Stream: {activeStream ? '✅ Active' : '❌ None'}</div>
//                         <div>Stream Ref: {cameraStreamRef.current ? '✅ Active' : '❌ None'}</div>
//                         <div>Camera Enabled: {cameraEnabled ? '✅ Yes' : '❌ No'}</div>
//                         <div>Show Preview: {showCameraPreview ? '✅ Yes' : '❌ No'}</div>
//                         <div>Preview Element: {cameraPreviewRef.current ? '✅ Ready' : '❌ None'}</div>
//                         <button 
//                             onClick={() => {
//                                 console.log('🔍 Manual camera preview test');
//                                 setShowCameraPreview(true);
//                                 const stream = activeStream || cameraStreamRef.current;
//                                 if (stream && cameraPreviewRef.current) {
//                                     cameraPreviewRef.current.srcObject = stream;
//                                     cameraPreviewRef.current.play();
//                                 }
//                             }}
//                             style={{ marginTop: '5px', padding: '2px 5px' }}
//                         >
//                             Test Preview
//                         </button>
//                     </div>
//                 )}
//                 <div className="progress-sections">
//                     {Object.entries(sectionProgress).map(([section, progress]) => (
//                         <div key={section} className="section-progress">
//                             <span className="section-label">{section}</span>
//                             <div className="progress-bar">
//                                 <div
//                                     className="progress-fill"
//                                     style={{ width: `${progress}%` }}
//                                 />
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//                 <div className="question-section">
//                     <p className="question-text">
//                         {question.question}
//                     </p>
//                     {question.isFreeText ? (
//                         <textarea
//                             className="free-text-input"
//                             value={answers[question.id] || ''}
//                             onChange={(e) => handleAnswer(question.id, e.target.value)}
//                             placeholder="Enter your code here..."
//                             rows={6}
//                         />
//                     ) : (
//                         <div className="options-list">
//                             {question.options.map((option, idx) => {
//                                 const isSelected = answers[question.id] === idx;
                                
//                                 return (
//                                     <button
//                                         key={idx}
//                                         className={`option-button ${isSelected ? 'selected' : ''}`}
//                                         onClick={() => handleAnswer(question.id, idx)}
//                                     >
//                                         {option}
//                                     </button>
//                                 );
//                             })}
//                         </div>
//                     )}
//                 </div>
                
//                 <div className="navigation">
//                     {currentQuestion === shuffledQuestions.length - 1 ? (
//                         <button
//                             className="review-button"
//                             onClick={() => setStage(TEST_STAGES.REVIEW)}
//                         >
//                             Review Answers
//                         </button>
//                     ) : (
//                         <button
//                             className="next-button"
//                             onClick={() => setCurrentQuestion(prev => prev + 1)}
//                             disabled={!question || answers[question.id] === undefined}
//                         >
//                             Next Question
//                         </button>
//                     )}
//                 </div>
//             </div>
//         );
//     };

//     const renderReview = () => (
//         <div className="review-container">
//             <h2>Review Your Answers</h2>
//             <div className="section-summary">
//                 {Object.entries(sectionProgress).map(([section, progress]) => (
//                     <div key={section} className="section-status">
//                         <h3>{section}</h3>
//                         <p>{progress}% Complete</p>
//                     </div>
//                 ))}
//             </div>
//             <div className="time-remaining">
//                 <Clock size={20} />
//                 <span>{formatTime(timeRemaining)}</span>
//             </div>
//             <div className="violations-summary">
//                 <div className="violation-item">
//                     <p>Tab Violations: <span className="violation-count">{tabViolationCount}</span></p>
//                 </div>
//                 <div className="violation-item">
//                     <p>Noise Violations: <span className="violation-count">{noiseViolationCount}</span></p>
//                 </div>
//             </div>
//             <button
//                 className="submit-button"
//                 onClick={() => setStage(TEST_STAGES.SUBMIT_CONFIRMATION)}
//                 disabled={Object.keys(answers).length < shuffledQuestions.length}
//             >
//                 Submit Test
//             </button>
//         </div>
//     );

//     const renderSubmitConfirmation = () => (
//         <div className="submit-confirmation">
//             <AlertTriangle size={48} className="warning-icon" />
//             <h2>Confirm Submission</h2>
//             <p>Are you sure you want to submit your test?</p>
//             <p>Tab violations recorded: {tabViolationCount}</p>
//             <p>Noise violations recorded: {noiseViolationCount}</p>
//             <p>This action cannot be undone.</p>
//             <div className="confirmation-buttons">
//                 <button
//                     className="back-button"
//                     onClick={() => setStage(TEST_STAGES.REVIEW)}
//                 >
//                     Return to Review
//                 </button>
//                 <button
//                     className="submit-button"
//                     onClick={() => handleSubmit()}
//                 >
//                     Confirm Submission
//                 </button>
//             </div>
//         </div>
//     );

//     const renderCompleted = () => (
//         <div className="completion-container">
//             <CheckCircle size={48} className="success-icon" />
//             <h2>Test Completed</h2>
//             <p>Your responses have been recorded successfully.</p>
//             <p>Tab violations recorded: {tabViolationCount}</p>
//             <p>Noise violations recorded: {noiseViolationCount}</p>
//             <p>You may now close this window.</p>
//         </div>
//     );
    
//     const renderTerminated = () => (
//         <div className="terminated-container">
//             <AlertTriangle size={48} className="terminated-icon" />
//             <h2>Test Terminated</h2>
//             <p className="termination-reason">{terminationReason}</p>
//             <div className="violation-summary">
//                 <p>Tab violations: <span className="violation-count">{tabViolationCount}</span></p>
//                 <p>Noise violations: <span className="violation-count">{noiseViolationCount}</span></p>
//             </div>
//             <p className="termination-message">
//                 Your test has been terminated due to integrity violations. 
//                 Please contact your administrator for more information.
//             </p>
//             <p className="termination-note">
//                 You will not be able to log in again to retake this test.
//             </p>
//         </div>
//     );

//     const renderStage = () => {
//         switch (stage) {
//             case TEST_STAGES.INSTRUCTIONS:
//                 return renderInstructions();
//             case TEST_STAGES.CONFIRMATION:
//                 return renderConfirmation();
//             case TEST_STAGES.DEVICE_SETUP:
//                 return renderDeviceSetup();
//             case TEST_STAGES.TEST:
//                 return renderTest();
//             case TEST_STAGES.REVIEW:
//                 return renderReview();
//             case TEST_STAGES.SUBMIT_CONFIRMATION:
//                 return renderSubmitConfirmation();
//             case TEST_STAGES.COMPLETED:
//                 return renderCompleted();
//             case TEST_STAGES.TERMINATED:
//                 return renderTerminated();
//             default:
//                 return null;
//         }
//     };

//     return (
//         <div className="test-wrapper">
//             {renderStage()}
//         </div>
//     );
// };


import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertCircle, CheckCircle, AlertTriangle, Video, Mic, X, Minimize2, Maximize2 } from 'lucide-react';
import { QUESTIONS } from '../../data/constants';
import { NoiseMonitor } from '../Noise/NoiseMonitor';
import { CameraCapture } from '../Camera/CameraCapture';
import rtcService from '../../services/RTCStreamingService';
import './TestInterface.css';

const TEST_STAGES = {
    INSTRUCTIONS: 'instructions',
    CONFIRMATION: 'confirmation',
    DEVICE_SETUP: 'device_setup',
    TEST: 'test',
    REVIEW: 'review',
    SUBMIT_CONFIRMATION: 'submit_confirmation',
    COMPLETED: 'completed',
    TERMINATED: 'terminated'
};

// Helper function to shuffle array using Fisher-Yates algorithm
const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export const TestInterface = ({ user, onComplete, scheduledStartTime, testAlreadyCompleted }) => {
    const [stage, setStage] = useState(testAlreadyCompleted ? TEST_STAGES.COMPLETED : TEST_STAGES.INSTRUCTIONS);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(60 * 60);
    const [hasReadInstructions, setHasReadInstructions] = useState(false);
    const [sectionProgress, setSectionProgress] = useState({
        technical: 0,
        aptitude: 0,
        logical: 0,
        personality: 0
    });
    const [tabViolationCount, setTabViolationCount] = useState(0);
    const [noiseViolationCount, setNoiseViolationCount] = useState(0);
    const [showWarning, setShowWarning] = useState(false);
    const [warningType, setWarningType] = useState('tab');
    const [isTerminated, setIsTerminated] = useState(false);
    const [terminationReason, setTerminationReason] = useState('');
    
    // Device setup state
    const [cameraEnabled, setCameraEnabled] = useState(false);
    const [micEnabled, setMicEnabled] = useState(false);
    const [activeStream, setActiveStream] = useState(null); // Store the active stream
    
    // Camera preview state
    const [showCameraPreview, setShowCameraPreview] = useState(false);
    const [cameraPreviewMinimized, setCameraPreviewMinimized] = useState(false);
    const [cameraPreviewPosition, setCameraPreviewPosition] = useState({ x: 20, y: 20 });
    
    // Scheduled time state
    const [isTestTimeReached, setIsTestTimeReached] = useState(false);
    const [timeToStart, setTimeToStart] = useState(0); // Time remaining until test starts (in seconds)
    
    // Test completion state
    const [isTestCompleted, setIsTestCompleted] = useState(!!testAlreadyCompleted);
    
    const warningTimeoutRef = useRef(null);
    const cameraStreamRef = useRef(null);
    const cameraPreviewRef = useRef(null);
    const [shuffledQuestions, setShuffledQuestions] = useState([]);
    const [questionSections, setQuestionSections] = useState({});

    // Initialize shuffled questions when component mounts
    useEffect(() => {
        const sections = {
            technical: QUESTIONS.slice(0, 10),
            aptitude: QUESTIONS.slice(10, 20),
            logical: QUESTIONS.slice(20, 30),
            personality: QUESTIONS.slice(30, 40)
        };
        
        const sectionMap = {};
        Object.entries(sections).forEach(([sectionName, questions]) => {
            questions.forEach(q => {
                sectionMap[q.id] = sectionName;
            });
        });
        setQuestionSections(sectionMap);
        
        const shuffledSections = {
            technical: shuffleArray(sections.technical),
            aptitude: shuffleArray(sections.aptitude),
            logical: shuffleArray(sections.logical),
            personality: shuffleArray(sections.personality)
        };
        
        const allShuffled = [
            ...shuffledSections.technical,
            ...shuffledSections.aptitude,
            ...shuffledSections.logical,
            ...shuffledSections.personality
        ];
        
        setShuffledQuestions(allShuffled);
    }, []);
    
    // Check for previous test completion on component mount
    useEffect(() => {
        // Check localStorage for completion status
        if (!testAlreadyCompleted) {
            try {
                const isCompleted = localStorage.getItem(`test_completed_${user.id || user.username || user.name}`);
                if (isCompleted === 'true') {
                    setIsTestCompleted(true);
                    setStage(TEST_STAGES.COMPLETED);
                }
            } catch (error) {
                console.error('Failed to retrieve test completion status:', error);
            }
        }
    }, [user, testAlreadyCompleted]);
    
    // Effect to check scheduled start time
    useEffect(() => {
        if (!scheduledStartTime) {
            // If no scheduled time is provided, allow immediate start
            setIsTestTimeReached(true);
            return;
        }
        
        const checkTime = () => {
            const now = new Date();
            const scheduledTime = new Date(scheduledStartTime);
            
            if (now >= scheduledTime) {
                setIsTestTimeReached(true);
                setTimeToStart(0);
                return true;
            } else {
                // Calculate time difference in seconds
                const diffMs = scheduledTime - now;
                const diffSec = Math.floor(diffMs / 1000);
                setTimeToStart(diffSec);
                setIsTestTimeReached(false);
                return false;
            }
        };
        
        // Initial check
        const isTimeReached = checkTime();
        if (isTimeReached) {
            return; // No need to set up interval if time is already reached
        }
        
        // Set up interval to check every second
        const intervalId = setInterval(() => {
            const isTimeReached = checkTime();
            if (isTimeReached) {
                clearInterval(intervalId);
            }
        }, 1000);
        
        return () => clearInterval(intervalId);
    }, [scheduledStartTime]);
    
    // Format time remaining until test starts
    const formatTimeToStart = () => {
        if (timeToStart <= 0) return 'Test is available now';
        
        const hours = Math.floor(timeToStart / 3600);
        const minutes = Math.floor((timeToStart % 3600) / 60);
        const seconds = timeToStart % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s until test begins`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s until test begins`;
        } else {
            return `${seconds}s until test begins`;
        }
    };

    const playAlertSound = () => {
        const audio = new Audio('https://www.soundjay.com/buttons/beep-01a.mp3');
        audio.play().catch(error => console.log('Audio playback failed:', error));
    };

    const [isPermissionPhase, setIsPermissionPhase] = useState(false);
    
    useEffect(() => {
        if (stage === TEST_STAGES.TEST) {
            setIsPermissionPhase(true);
            const timer = setTimeout(() => {
                setIsPermissionPhase(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [stage]);
    
    // Timer effect
    useEffect(() => {
        if (stage === TEST_STAGES.TEST) {
            const timer = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 0) {
                        clearInterval(timer);
                        handleTimeUp();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [stage]);
    
    // Tab switching and keyboard monitoring
    useEffect(() => {
        const handleFocus = () => {
            if (!warningTimeoutRef.current) {
                setShowWarning(false);
            }
        };

        const handleBlur = () => {
            if (stage === TEST_STAGES.TEST && !isPermissionPhase) {
                setTabViolationCount(prev => prev + 1);
                setWarningType('tab');
                setShowWarning(true);
                playAlertSound();

                if (warningTimeoutRef.current) {
                    clearTimeout(warningTimeoutRef.current);
                }

                warningTimeoutRef.current = setTimeout(() => {
                    setShowWarning(false);
                    warningTimeoutRef.current = null;
                }, 10000);
                
                if (tabViolationCount >= 2) {
                    handleTerminate('tab');
                }
            }
        };

        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);

        const handleContextMenu = (e) => {
            if (stage === TEST_STAGES.TEST) e.preventDefault();
        };

        const handleKeyDown = (e) => {
            if (stage === TEST_STAGES.TEST && !isPermissionPhase) {
                if ((e.ctrlKey && (e.key === 't' || e.key === 'n' || e.key === 'w')) ||
                    e.key === 'F11' ||
                    (e.altKey && e.key === 'Tab')) {
                    e.preventDefault();
                    setTabViolationCount(prev => prev + 1);
                    setWarningType('tab');
                    setShowWarning(true);
                    playAlertSound();

                    if (warningTimeoutRef.current) {
                        clearTimeout(warningTimeoutRef.current);
                    }

                    warningTimeoutRef.current = setTimeout(() => {
                        setShowWarning(false);
                        warningTimeoutRef.current = null;
                    }, 10000);
                    
                    if (tabViolationCount >= 2) {
                        handleTerminate('tab');
                    }
                }
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
            if (warningTimeoutRef.current) {
                clearTimeout(warningTimeoutRef.current);
            }
        };
    }, [stage, tabViolationCount, isPermissionPhase]);

    // Update violation counts in the service
    useEffect(() => {
        if (stage === TEST_STAGES.TEST && cameraStreamRef.current) {
            rtcService.updateViolationCount('tab', tabViolationCount);
        }
    }, [tabViolationCount, stage]);
    
    useEffect(() => {
        if (stage === TEST_STAGES.TEST && cameraStreamRef.current) {
            rtcService.updateViolationCount('noise', noiseViolationCount);
        }
    }, [noiseViolationCount, stage]);
    
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (cameraStreamRef.current) {
                cameraStreamRef.current.getTracks().forEach(track => track.stop());
            }
            rtcService.cleanupStudentConnection();
        };
    }, []);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleTimeUp = () => {
        handleSubmit(true);
    };
    
    const handleNoiseViolation = (level) => {
        setNoiseViolationCount(prev => prev + 1);
        setWarningType('noise');
        setShowWarning(true);
        
        if (warningTimeoutRef.current) {
            clearTimeout(warningTimeoutRef.current);
        }
        
        warningTimeoutRef.current = setTimeout(() => {
            setShowWarning(false);
            warningTimeoutRef.current = null;
        }, 10000);
        
        if (level === 'high' && noiseViolationCount >= 2) {
            handleTerminate('noise');
        }
    };
    
    const handleTerminate = (reason) => {
        if (cameraStreamRef.current) {
            cameraStreamRef.current.getTracks().forEach(track => track.stop());
        }
        
        let reasonText = '';
        switch(reason) {
            case 'tab':
                reasonText = 'Excessive tab violations detected';
                break;
            case 'noise':
                reasonText = 'Excessive noise violations detected';
                break;
            default:
                reasonText = 'Test integrity violation detected';
        }
        
        setTerminationReason(reasonText);
        setIsTerminated(true);
        setStage(TEST_STAGES.TERMINATED);
        setIsTestCompleted(true); // Mark as completed
        
        const result = {
            user: user.name,
            score: 0,
            timeSpent: 3600 - timeRemaining,
            answers,
            sections: {
                technical: 0,
                aptitude: 0, 
                logical: 0,
                personality: 0
            },
            submittedBy: 'terminated',
            violations: tabViolationCount,
            noiseViolations: noiseViolationCount,
            terminationReason: reasonText,
            completed: true // Add completed flag
        };
        
        // Store completion status in localStorage
        try {
            localStorage.setItem(`test_completed_${user.id || user.username || user.name}`, 'true');
        } catch (error) {
            console.error('Failed to store test completion status:', error);
        }
        
        onComplete(result);
    };

    const handleAnswer = (questionId, selectedOption) => {
        setAnswers(prevAnswers => {
            const newAnswers = {
                ...prevAnswers,
                [questionId]: selectedOption
            };
            
            const questionSection = questionSections[questionId];
            
            const sectionCounts = {
                technical: 0,
                aptitude: 0,
                logical: 0,
                personality: 0
            };
            
            Object.keys(newAnswers).forEach(qId => {
                const section = questionSections[qId];
                if (section) {
                    sectionCounts[section]++;
                }
            });
            
            const updatedProgress = {
                technical: (sectionCounts.technical / 10) * 100,
                aptitude: (sectionCounts.aptitude / 10) * 100,
                logical: (sectionCounts.logical / 10) * 100,
                personality: (sectionCounts.personality / 10) * 100
            };
            
            setSectionProgress(updatedProgress);
            return newAnswers;
        });
    };

    const handleSubmit = (isTimeUp = false) => {
        if (cameraStreamRef.current) {
            cameraStreamRef.current.getTracks().forEach(track => track.stop());
        }
        
        const score = Object.entries(answers).reduce((acc, [questionId, answer]) => {
          const question = QUESTIONS.find(q => q.id.toString() === questionId);
          if (!question) return acc;
          
          if (question.isFreeText) {
            const normalizedAnswer = answer.trim().replace(/\s+/g, ' ');
            const normalizedCorrect = question.correctAnswer.trim().replace(/\s+/g, ' ');
            return acc + (normalizedAnswer === normalizedCorrect ? 1 : 0);
          }
          return acc + (question.correctAnswer === answer ? 1 : 0);
        }, 0);
      
        const sectionScores = {
            technical: calculateSectionScore('technical'),
            aptitude: calculateSectionScore('aptitude'),
            logical: calculateSectionScore('logical'),
            personality: calculateSectionScore('personality'),
        };
      
        const result = {
          user: user.name,
          score: (score / QUESTIONS.length) * 100,
          timeSpent: 3600 - timeRemaining,
          answers,
          sections: sectionScores,
          submittedBy: isTimeUp ? 'timeout' : 'user',
          violations: tabViolationCount,
          noiseViolations: noiseViolationCount,
          completed: true // Add completed flag
        };
      
        setIsTestCompleted(true); // Update local state
        onComplete(result);
        setStage(TEST_STAGES.COMPLETED);
        
        // Store completion status in localStorage
        try {
            localStorage.setItem(`test_completed_${user.id || user.username || user.name}`, 'true');
        } catch (error) {
            console.error('Failed to store test completion status:', error);
        }
    };

    const calculateSectionScore = (sectionName) => {
        const sectionQuestionIds = Object.entries(questionSections)
            .filter(([_, section]) => section === sectionName)
            .map(([id]) => id);
        
        const answeredCount = sectionQuestionIds.filter(id => answers[id] !== undefined).length;
        return (answeredCount / 10) * 100;
    };

    const getCurrentQuestion = () => {
        if (shuffledQuestions.length === 0) return null;
        return shuffledQuestions[currentQuestion];
    };

    const getCurrentSectionName = () => {
        const question = getCurrentQuestion();
        if (!question) return '';
        return questionSections[question.id];
    };

    const formatSectionName = (section) => {
        switch(section) {
            case 'technical': return 'Technical Knowledge';
            case 'aptitude': return 'Aptitude Assessment';
            case 'logical': return 'Logical Reasoning';
            case 'personality': return 'Personality Assessment';
            default: return '';
        }
    };

    // Camera preview update when stream changes
    const handleCameraStream = (stream) => {
        console.log('🎥 Camera stream received:', stream); // Debug log
        cameraStreamRef.current = stream;
        setActiveStream(stream); // Store in state too
        setCameraEnabled(!!stream);
        
        // If we're in test stage, immediately show the preview
        if (stage === TEST_STAGES.TEST && stream) {
            console.log('🎥 Test stage - enabling camera preview');
            setShowCameraPreview(true);
        }
        
        // Update preview video immediately if it exists
        if (stream && cameraPreviewRef.current) {
            console.log('🎥 Connecting stream to preview video element');
            cameraPreviewRef.current.srcObject = stream;
            cameraPreviewRef.current.play().catch(e => console.error('❌ Error playing preview:', e));
        }
    };

    // Effect to update camera preview when stream changes
    useEffect(() => {
        if (cameraPreviewRef.current && cameraStreamRef.current && showCameraPreview && !cameraPreviewMinimized) {
            const videoElement = cameraPreviewRef.current;
            
            // Only update if not already connected
            if (videoElement.srcObject !== cameraStreamRef.current) {
                console.log('Updating camera preview with existing stream');
                videoElement.srcObject = cameraStreamRef.current;
                videoElement.play().catch(e => console.error('Error playing preview:', e));
            }
        }
    }, [stage, showCameraPreview, cameraEnabled, cameraPreviewMinimized]);

    // Show camera preview when test stage begins
    useEffect(() => {
        console.log('🔄 Stage changed to:', stage);
        console.log('🔄 Camera enabled:', cameraEnabled);
        console.log('🔄 Active stream:', activeStream);
        console.log('🔄 Stream ref:', cameraStreamRef.current);
        
        if (stage === TEST_STAGES.TEST) {
            // Enable preview as soon as test starts
            setShowCameraPreview(true);
            
            // If we have a stream, connect it
            const stream = activeStream || cameraStreamRef.current;
            if (stream) {
                console.log('🎥 Test started - connecting camera preview');
                setTimeout(() => {
                    if (cameraPreviewRef.current) {
                        cameraPreviewRef.current.srcObject = stream;
                        cameraPreviewRef.current.play().catch(e => console.error('❌ Error playing preview:', e));
                    }
                }, 200);
            }
        }
    }, [stage, activeStream, cameraEnabled]);

    // Effect to continuously ensure video stream is connected
    useEffect(() => {
        if (showCameraPreview && cameraPreviewRef.current && cameraStreamRef.current) {
            const videoElement = cameraPreviewRef.current;
            
            // Check if stream is already connected
            if (videoElement.srcObject !== cameraStreamRef.current) {
                console.log('Connecting camera stream to preview');
                videoElement.srcObject = cameraStreamRef.current;
                videoElement.play().catch(e => console.error('Error playing preview:', e));
            }
        }
    }, [showCameraPreview, cameraPreviewMinimized]);

    const renderInstructions = () => (
        <div className="instructions-container">
            <h2 className="instructions-title">Test Instructions</h2>
            
            {/* Scheduled time indicator */}
            {scheduledStartTime && (
                <div className={`scheduled-time-indicator ${isTestTimeReached ? 'time-reached' : ''}`}>
                    <Clock size={20} />
                    <span>{formatTimeToStart()}</span>
                </div>
            )}
            
            <div className="instruction-section">
                <h3>Test Structure</h3>
                <ul>
                    <li>The test consists of 40 questions divided into 4 sections:</li>
                    <li>Technical Knowledge (10 questions)</li>
                    <li>Aptitude Assessment (10 questions)</li>
                    <li>Logical Reasoning (10 questions)</li>
                    <li>Personality Assessment (10 questions)</li>
                </ul>
            </div>
            <div className="instruction-section">
                <h3>Time Limit</h3>
                <ul>
                    <li>Total duration: 60 minutes</li>
                    <li>Recommended time per section: 15 minutes</li>
                    <li>Timer will be visible throughout the test</li>
                    <li>Test auto-submits when time expires</li>
                </ul>
            </div>
            <div className="instruction-section">
                <h3>Important Rules</h3>
                <ul>
                    <li>Questions are randomized within each section</li>
                    <li>All questions are mandatory</li>
                    <li>You can review your answers before final submission</li>
                    <li>Ensure stable internet connection throughout the test</li>
                    <li>Window switching is monitored and recorded</li>
                    <li>Your camera and microphone will be monitored for test integrity</li>
                    <li>A live camera preview will be shown during the test</li>
                    <li>Excessive noise or tab violations will result in test termination</li>
                </ul>
            </div>
            <div className="confirmation-checkbox">
                <input
                    type="checkbox"
                    id="instructions-confirmation"
                    checked={hasReadInstructions}
                    onChange={(e) => setHasReadInstructions(e.target.checked)}
                />
                <label htmlFor="instructions-confirmation">
                    I have read and understood all instructions
                </label>
            </div>
            <button
                className={`start-button ${!isTestTimeReached ? 'waiting' : ''}`}
                disabled={!hasReadInstructions || !isTestTimeReached}
                onClick={() => setStage(TEST_STAGES.CONFIRMATION)}
            >
                {isTestTimeReached ? 'Start Test' : 'Waiting for scheduled time...'}
            </button>
            
            {!isTestTimeReached && (
                <p className="schedule-note">
                    The test will be available to start at {new Date(scheduledStartTime).toLocaleString()}
                </p>
            )}
        </div>
    );

    const renderConfirmation = () => (
        <div className="confirmation-container">
            <AlertCircle size={48} className="confirmation-icon" />
            <h2>Ready to Begin?</h2>
            
            {/* Scheduled time indicator */}
            {scheduledStartTime && !isTestTimeReached && (
                <div className="scheduled-time-warning">
                    <Clock size={20} />
                    <span>The test is scheduled to start at {new Date(scheduledStartTime).toLocaleString()}</span>
                    <span>({formatTimeToStart()})</span>
                </div>
            )}
            
            <p>Please ensure:</p>
            <ul>
                <li>You are in a quiet environment</li>
                <li>You have stable internet connection</li>
                <li>You have 60 minutes available</li>
                <li>You won't be interrupted</li>
                <li>You remain in this window during the test</li>
                <li>You have a working camera and microphone</li>
                <li>You understand that excessive noise or tab switching will terminate your test</li>
            </ul>
            <div className="confirmation-buttons">
                <button
                    className="back-button"
                    onClick={() => setStage(TEST_STAGES.INSTRUCTIONS)}
                >
                    Back to Instructions
                </button>
                <button
                    className={`confirm-button ${!isTestTimeReached ? 'waiting' : ''}`}
                    disabled={!isTestTimeReached}
                    onClick={() => setStage(TEST_STAGES.DEVICE_SETUP)}
                >
                    {isTestTimeReached ? 'Next: Setup Devices' : 'Waiting for scheduled time...'}
                </button>
            </div>
        </div>
    );
    
    const renderDeviceSetup = () => (
        <div className="device-setup-container">
            <h2 className="device-setup-title">Camera & Microphone Setup</h2>
            
            {/* Scheduled time indicator */}
            {scheduledStartTime && !isTestTimeReached && (
                <div className="scheduled-time-warning device-setup-scheduled">
                    <Clock size={20} />
                    <span>The test is scheduled to start at {new Date(scheduledStartTime).toLocaleString()}</span>
                    <span>({formatTimeToStart()})</span>
                </div>
            )}
            
            <p className="device-setup-instructions">
                Please enable your camera and microphone. Both are required to take the test.
                Your video and audio will be streamed to the test administrator for monitoring.
            </p>
            
            <div className="device-setup-grid">
                <div className="device-setup-item">
                    <h3>Camera</h3>
                    <div className="device-preview">
                        {/* Direct camera access instead of using CameraCapture component */}
                        <div className="camera-setup">
                            <video
                                ref={(videoEl) => {
                                    if (videoEl && !activeStream) {
                                        console.log('🎥 Requesting camera access...');
                                        navigator.mediaDevices.getUserMedia({
                                            video: { 
                                                width: { ideal: 640 },
                                                height: { ideal: 480 },
                                                facingMode: "user"
                                            },
                                            audio: true
                                        })
                                        .then((stream) => {
                                            console.log('🎥 Camera stream obtained:', stream);
                                            videoEl.srcObject = stream;
                                            videoEl.play();
                                            handleCameraStream(stream);
                                            setMicEnabled(true); // Since we're getting audio too
                                        })
                                        .catch((error) => {
                                            console.error('❌ Camera access error:', error);
                                            setCameraEnabled(false);
                                        });
                                    }
                                }}
                                className="camera-setup-video"
                                autoPlay
                                playsInline
                                muted
                                style={{
                                    width: '100%',
                                    height: '200px',
                                    objectFit: 'cover',
                                    borderRadius: '10px',
                                    background: '#000'
                                }}
                            />
                        </div>
                    </div>
                    <div className="device-status">
                        {cameraEnabled ? (
                            <span className="status-enabled">Camera enabled ✓</span>
                        ) : (
                            <span className="status-disabled">Camera not enabled</span>
                        )}
                    </div>
                </div>
                
                <div className="device-setup-item">
                    <h3>Microphone</h3>
                    <div className="device-preview">
                        <div className="mic-setup">
                            <div className="mic-placeholder">
                                <Mic size={48} />
                                <p>Microphone will be enabled with camera</p>
                            </div>
                        </div>
                    </div>
                    <div className="device-status">
                        {micEnabled ? (
                            <span className="status-enabled">Microphone enabled ✓</span>
                        ) : (
                            <span className="status-disabled">Microphone not enabled</span>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="device-setup-footer">
                <p className="device-setup-note">
                    Both camera and microphone are required for test integrity. The test cannot 
                    start until both devices are enabled. Your video and audio will be monitored
                    by the test administrator throughout the test.
                </p>
                
                <div className="device-setup-buttons">
                    <button
                        className="back-button"
                        onClick={() => setStage(TEST_STAGES.CONFIRMATION)}
                    >
                        Back
                    </button>
                    <button
                        className={`start-test-button ${!isTestTimeReached ? 'waiting' : ''}`}
                        disabled={!cameraEnabled || !micEnabled || !isTestTimeReached}
                        onClick={() => {
                            const stream = activeStream || cameraStreamRef.current;
                            console.log('🚀 Starting test with camera stream:', stream);
                            console.log('🚀 Camera enabled:', cameraEnabled);
                            console.log('🚀 Mic enabled:', micEnabled);
                            
                            if (stream) {
                                rtcService.initializeAsStudent(
                                    stream,
                                    user.username,
                                    Date.now().toString()
                                );
                            }
                            
                            // Move to test stage
                            setStage(TEST_STAGES.TEST);
                        }}
                    >
                        {isTestTimeReached ? 'Start Test' : 'Waiting for scheduled time...'}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderTest = () => {
        const question = getCurrentQuestion();
        if (!question) return <div>Loading questions...</div>;
        
        const currentSection = getCurrentSectionName();
        const isTestActive = stage === TEST_STAGES.TEST;
        
        return (
            <div className="test-container">
                {showWarning && (
                    <div className="caught-notification animate__animated animate__bounceIn">
                        <div className="caught-header">
                            <AlertTriangle className="caught-icon" size={32} />
                            <h3>
                                {warningType === 'tab' ? 'Tab Violation Detected!' : 'Noise Violation Detected!'}
                            </h3>
                        </div>
                        <div className="caught-content">
                            <p className="caught-message">
                                {warningType === 'tab'
                                    ? 'Please stay focused on the test window to maintain integrity.'
                                    : 'Please maintain a quiet environment during the test.'}
                            </p>
                            <div className="violation-info">
                                <span className="violation-label">
                                    {warningType === 'tab' ? 'Tab Violations:' : 'Noise Violations:'}
                                </span>
                                <span className="violation-number">
                                    {warningType === 'tab' ? tabViolationCount : noiseViolationCount}
                                </span>
                            </div>
                        </div>
                        <div className="caught-progress">
                            <div
                                className="progress-fill"
                                style={{ 
                                    width: `${Math.min(
                                        (warningType === 'tab' ? tabViolationCount : noiseViolationCount) * 33, 
                                        100
                                    )}%` 
                                }}
                            />
                        </div>
                    </div>
                )}
                
                {/* Live Camera Preview */}
                {showCameraPreview && (
                    <div 
                        className={`camera-preview-modal ${cameraPreviewMinimized ? 'minimized' : ''}`}
                        style={{
                            position: 'fixed',
                            left: cameraPreviewPosition.x,
                            top: cameraPreviewPosition.y,
                            zIndex: 1000
                        }}
                    >
                        <div className="camera-preview-header">
                            <span className="camera-preview-title">
                                <Video size={14} />
                                Live Camera
                            </span>
                            <div className="camera-preview-controls">
                                <button
                                    className="camera-control-btn"
                                    onClick={() => setCameraPreviewMinimized(!cameraPreviewMinimized)}
                                    title={cameraPreviewMinimized ? "Expand" : "Minimize"}
                                >
                                    {cameraPreviewMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                                </button>
                                <button
                                    className="camera-control-btn"
                                    onClick={() => setShowCameraPreview(false)}
                                    title="Close"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                        {!cameraPreviewMinimized && (
                            <div className="camera-preview-content">
                                <video
                                    ref={(el) => {
                                        if (el) {
                                            cameraPreviewRef.current = el;
                                            console.log('🎥 Video element created/updated');
                                            
                                            // Connect stream immediately
                                            const stream = activeStream || cameraStreamRef.current;
                                            if (stream && el.srcObject !== stream) {
                                                console.log('🎥 Connecting stream to video element');
                                                el.srcObject = stream;
                                                el.play().catch(e => console.error('❌ Error playing video:', e));
                                            }
                                        }
                                    }}
                                    className="camera-preview-video"
                                    autoPlay
                                    playsInline
                                    muted
                                />
                                <div className="camera-preview-footer">
                                    <div className="status-indicator active"></div>
                                    <span>Monitored by proctor</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                
                {/* Hidden noise monitor for continued monitoring */}
                <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                    <NoiseMonitor 
                        isTestActive={isTestActive} 
                        onNoiseViolation={handleNoiseViolation}
                    />
                </div>
                
                {/* Status indicators */}
                <div className="camera-minimized">
                    <div className="camera-status">
                        <div className="status-indicator active"></div>
                        <Video size={16} />
                        <span>Live camera stream active</span>
                        {!showCameraPreview && (activeStream || cameraStreamRef.current) && (
                            <button 
                                className="show-preview-btn"
                                onClick={() => {
                                    console.log('🎥 Restoring camera preview');
                                    setShowCameraPreview(true);
                                }}
                                title="Show camera preview"
                            >
                                Show Preview
                            </button>
                        )}
                    </div>
                    
                    <div className="noise-status">
                        <div className="status-indicator active"></div>
                        <Mic size={16} />
                        <span>Live microphone active</span>
                    </div>
                </div>
                
                <div className="test-header">
                    <div className="section-info">
                        <h2>{formatSectionName(currentSection)}</h2>
                        <p>Question {currentQuestion + 1} of 40</p>
                    </div>
                    <div className="timer">
                        <Clock size={20} />
                        <span className={timeRemaining < 300 ? 'time-warning' : ''}>
                            {formatTime(timeRemaining)}
                        </span>
                    </div>
                </div>
                
                {/* Debug info - remove in production */}
                {process.env.NODE_ENV === 'development' && (
                    <div style={{ 
                        position: 'fixed', 
                        bottom: '10px', 
                        left: '10px', 
                        background: 'rgba(0,0,0,0.8)', 
                        color: 'white', 
                        padding: '10px', 
                        borderRadius: '5px',
                        fontSize: '12px',
                        zIndex: 9999,
                        display:'none'
                    }}>
                        <div>Camera Stream: {activeStream ? '✅ Active' : '❌ None'}</div>
                        <div>Stream Ref: {cameraStreamRef.current ? '✅ Active' : '❌ None'}</div>
                        <div>Camera Enabled: {cameraEnabled ? '✅ Yes' : '❌ No'}</div>
                        <div>Show Preview: {showCameraPreview ? '✅ Yes' : '❌ No'}</div>
                        <div>Preview Element: {cameraPreviewRef.current ? '✅ Ready' : '❌ None'}</div>
                        <button 
                            onClick={() => {
                                console.log('🔍 Manual camera preview test');
                                setShowCameraPreview(true);
                                const stream = activeStream || cameraStreamRef.current;
                                if (stream && cameraPreviewRef.current) {
                                    cameraPreviewRef.current.srcObject = stream;
                                    cameraPreviewRef.current.play();
                                }
                            }}
                            style={{ marginTop: '5px', padding: '2px 5px' }}
                        >
                            Test Preview
                        </button>
                    </div>
                )}
                <div className="progress-sections">
                    {Object.entries(sectionProgress).map(([section, progress]) => (
                        <div key={section} className="section-progress">
                            <span className="section-label">{section}</span>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="question-section">
                    <p className="question-text">
                        {question.question}
                    </p>
                    {question.isFreeText ? (
                        <textarea
                            className="free-text-input"
                            value={answers[question.id] || ''}
                            onChange={(e) => handleAnswer(question.id, e.target.value)}
                            placeholder="Enter your code here..."
                            rows={6}
                        />
                    ) : (
                        <div className="options-list">
                            {question.options.map((option, idx) => {
                                const isSelected = answers[question.id] === idx;
                                
                                return (
                                    <button
                                        key={idx}
                                        className={`option-button ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleAnswer(question.id, idx)}
                                    >
                                        {option}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
                
                <div className="navigation">
                    {currentQuestion === shuffledQuestions.length - 1 ? (
                        <button
                            className="review-button"
                            onClick={() => setStage(TEST_STAGES.REVIEW)}
                        >
                            Review Answers
                        </button>
                    ) : (
                        <button
                            className="next-button"
                            onClick={() => setCurrentQuestion(prev => prev + 1)}
                            disabled={!question || answers[question.id] === undefined}
                        >
                            Next Question
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const renderReview = () => (
        <div className="review-container">
            <h2>Review Your Answers</h2>
            <div className="section-summary">
                {Object.entries(sectionProgress).map(([section, progress]) => (
                    <div key={section} className="section-status">
                        <h3>{section}</h3>
                        <p>{progress}% Complete</p>
                    </div>
                ))}
            </div>
            <div className="time-remaining">
                <Clock size={20} />
                <span>{formatTime(timeRemaining)}</span>
            </div>
            <div className="violations-summary">
                <div className="violation-item">
                    <p>Tab Violations: <span className="violation-count">{tabViolationCount}</span></p>
                </div>
                <div className="violation-item">
                    <p>Noise Violations: <span className="violation-count">{noiseViolationCount}</span></p>
                </div>
            </div>
            <button
                className="submit-button"
                onClick={() => setStage(TEST_STAGES.SUBMIT_CONFIRMATION)}
                disabled={Object.keys(answers).length < shuffledQuestions.length}
            >
                Submit Test
            </button>
        </div>
    );

    const renderSubmitConfirmation = () => (
        <div className="submit-confirmation">
            <AlertTriangle size={48} className="warning-icon" />
            <h2>Confirm Submission</h2>
            <p>Are you sure you want to submit your test?</p>
            <p>Tab violations recorded: {tabViolationCount}</p>
            <p>Noise violations recorded: {noiseViolationCount}</p>
            <p>This action cannot be undone.</p>
            <div className="confirmation-buttons">
                <button
                    className="back-button"
                    onClick={() => setStage(TEST_STAGES.REVIEW)}
                >
                    Return to Review
                </button>
                <button
                    className="submit-button"
                    onClick={() => handleSubmit()}
                >
                    Confirm Submission
                </button>
            </div>
        </div>
    );

    const renderCompleted = () => (
        <div className="completion-container">
            <CheckCircle size={48} className="success-icon" />
            <h2>Test Completed</h2>
            <p>Your responses have been recorded successfully.</p>
            <p>Tab violations recorded: {tabViolationCount}</p>
            <p>Noise violations recorded: {noiseViolationCount}</p>
            <p className="completion-note">This test has been completed and cannot be taken again.</p>
            <p>You may now close this window.</p>
        </div>
    );
    
    const renderTerminated = () => (
        <div className="terminated-container">
            <AlertTriangle size={48} className="terminated-icon" />
            <h2>Test Terminated</h2>
            <p className="termination-reason">{terminationReason}</p>
            <div className="violation-summary">
                <p>Tab violations: <span className="violation-count">{tabViolationCount}</span></p>
                <p>Noise violations: <span className="violation-count">{noiseViolationCount}</span></p>
            </div>
            <p className="termination-message">
                Your test has been terminated due to integrity violations. 
                Please contact your administrator for more information.
            </p>
            <p className="termination-note">
                You will not be able to log in again to retake this test.
            </p>
        </div>
    );
    
    const renderAlreadyCompleted = () => (
        <div className="completion-container already-completed">
            <CheckCircle size={48} className="success-icon" />
            <h2>Test Already Completed</h2>
            <p>You have already completed this test.</p>
            <p className="completion-note">Each test can only be taken once.</p>
            <p>Please contact your administrator if you believe this is an error.</p>
        </div>
    );

    const renderStage = () => {
        // If test is already completed and we're not in a completion or termination stage
        if (isTestCompleted && 
            stage !== TEST_STAGES.COMPLETED && 
            stage !== TEST_STAGES.TERMINATED) {
            return renderAlreadyCompleted();
        }
        
        switch (stage) {
            case TEST_STAGES.INSTRUCTIONS:
                return renderInstructions();
            case TEST_STAGES.CONFIRMATION:
                return renderConfirmation();
            case TEST_STAGES.DEVICE_SETUP:
                return renderDeviceSetup();
            case TEST_STAGES.TEST:
                return renderTest();
            case TEST_STAGES.REVIEW:
                return renderReview();
            case TEST_STAGES.SUBMIT_CONFIRMATION:
                return renderSubmitConfirmation();
            case TEST_STAGES.COMPLETED:
                return renderCompleted();
            case TEST_STAGES.TERMINATED:
                return renderTerminated();
            default:
                return null;
        }
    };

    return (
        <div className="test-wrapper">
            {renderStage()}
        </div>
    );
};