// import React, { useState, useEffect, useRef } from 'react';
// import { Clock, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
// import { QUESTIONS } from '../../data/constants';
// import './TestInterface.css';

// const TEST_STAGES = {
//     INSTRUCTIONS: 'instructions',
//     CONFIRMATION: 'confirmation',
//     TEST: 'test',
//     REVIEW: 'review',
//     SUBMIT_CONFIRMATION: 'submit_confirmation',
//     COMPLETED: 'completed'
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
//     const [violationCount, setViolationCount] = useState(0);
//     const [showWarning, setShowWarning] = useState(false);
//     const warningTimeoutRef = useRef(null);
    
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

//     useEffect(() => {
//         const handleFocus = () => {
//             // Only clear warning when returning if timer is done
//             if (!warningTimeoutRef.current) {
//                 setShowWarning(false);
//             }
//         };

//         const handleBlur = () => {
//             if (stage === TEST_STAGES.TEST) {
//                 setViolationCount(prev => prev + 1);
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
//             }
//         };

//         window.addEventListener('focus', handleFocus);
//         window.addEventListener('blur', handleBlur);

//         const handleContextMenu = (e) => {
//             if (stage === TEST_STAGES.TEST) e.preventDefault();
//         };

//         const handleKeyDown = (e) => {
//             if (stage === TEST_STAGES.TEST) {
//                 if ((e.ctrlKey && (e.key === 't' || e.key === 'n' || e.key === 'w')) ||
//                     e.key === 'F11' ||
//                     (e.altKey && e.key === 'Tab')) {
//                     e.preventDefault();
//                     setViolationCount(prev => prev + 1);
//                     setShowWarning(true);
//                     playAlertSound();

//                     if (warningTimeoutRef.current) {
//                         clearTimeout(warningTimeoutRef.current);
//                     }

//                     warningTimeoutRef.current = setTimeout(() => {
//                         setShowWarning(false);
//                         warningTimeoutRef.current = null;
//                     }, 10000);
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
//     }, [stage]);

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
//           violations: violationCount,
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
//                     onClick={() => setStage(TEST_STAGES.TEST)}
//                 >
//                     Begin Test
//                 </button>
//             </div>
//         </div>
//     );

//     const renderTest = () => {
//         const question = getCurrentQuestion();
//         if (!question) return <div>Loading questions...</div>;
        
//         const currentSection = getCurrentSectionName();
        
//         return (
//             <div className="test-container">
//                 {showWarning && (
//                     <div className="caught-notification animate__animated animate__bounceIn">
//                         <div className="caught-header">
//                             <AlertTriangle className="caught-icon" size={32} />
//                             <h3>You've Been Caught!</h3>
//                         </div>
//                         <div className="caught-content">
//                             <p className="caught-message">
//                                 Please stay focused on the test window to maintain integrity.
//                             </p>
//                             <div className="violation-info">
//                                 <span className="violation-label">Violation Count:</span>
//                                 <span className="violation-number">{violationCount}</span>
//                             </div>
//                         </div>
//                         <div className="caught-progress">
//                             <div
//                                 className="progress-fill"
//                                 style={{ width: `${Math.min(violationCount * 10, 100)}%` }}
//                             />
//                         </div>
//                     </div>
//                 )}
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
//             <p>Violations recorded: {violationCount}</p>
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
//             <p>Total violations recorded: {violationCount}</p>
//             <p>You may now close this window.</p>
//         </div>
//     );

//     const renderStage = () => {
//         switch (stage) {
//             case TEST_STAGES.INSTRUCTIONS:
//                 return renderInstructions();
//             case TEST_STAGES.CONFIRMATION:
//                 return renderConfirmation();
//             case TEST_STAGES.TEST:
//                 return renderTest();
//             case TEST_STAGES.REVIEW:
//                 return renderReview();
//             case TEST_STAGES.SUBMIT_CONFIRMATION:
//                 return renderSubmitConfirmation();
//             case TEST_STAGES.COMPLETED:
//                 return renderCompleted();
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
import { Clock, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { QUESTIONS } from '../../data/constants';
import { NoiseMonitor } from '../Noise/NoiseMonitor';
import { CameraCapture } from '../Camera/CameraCapture';
import './TestInterface.css';

const TEST_STAGES = {
    INSTRUCTIONS: 'instructions',
    CONFIRMATION: 'confirmation',
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

export const TestInterface = ({ user, onComplete }) => {
    const [stage, setStage] = useState(TEST_STAGES.INSTRUCTIONS);
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
    const [warningType, setWarningType] = useState('tab'); // 'tab' or 'noise'
    const [isTerminated, setIsTerminated] = useState(false);
    const [terminationReason, setTerminationReason] = useState('');
    
    const warningTimeoutRef = useRef(null);
    const cameraStreamRef = useRef(null);
    
    // State for shuffled questions
    const [shuffledQuestions, setShuffledQuestions] = useState([]);
    
    // Track original section for each question
    const [questionSections, setQuestionSections] = useState({});

    // Initialize shuffled questions when component mounts
    useEffect(() => {
        // Group questions by section (each section has 10 questions)
        const sections = {
            technical: QUESTIONS.slice(0, 10),
            aptitude: QUESTIONS.slice(10, 20),
            logical: QUESTIONS.slice(20, 30),
            personality: QUESTIONS.slice(30, 40)
        };
        
        // Create mapping of question IDs to their sections
        const sectionMap = {};
        Object.entries(sections).forEach(([sectionName, questions]) => {
            questions.forEach(q => {
                sectionMap[q.id] = sectionName;
            });
        });
        setQuestionSections(sectionMap);
        
        // Shuffle each section separately
        const shuffledSections = {
            technical: shuffleArray(sections.technical),
            aptitude: shuffleArray(sections.aptitude),
            logical: shuffleArray(sections.logical),
            personality: shuffleArray(sections.personality)
        };
        
        // Combine all shuffled sections
        const allShuffled = [
            ...shuffledSections.technical,
            ...shuffledSections.aptitude,
            ...shuffledSections.logical,
            ...shuffledSections.personality
        ];
        
        setShuffledQuestions(allShuffled);
    }, []);

    const playAlertSound = () => {
        const audio = new Audio('https://www.soundjay.com/buttons/beep-01a.mp3');
        audio.play().catch(error => console.log('Audio playback failed:', error));
    };

    useEffect(() => {
        const handleFocus = () => {
            // Only clear warning when returning if timer is done
            if (!warningTimeoutRef.current) {
                setShowWarning(false);
            }
        };

        const handleBlur = () => {
            if (stage === TEST_STAGES.TEST) {
                setTabViolationCount(prev => prev + 1);
                setWarningType('tab');
                setShowWarning(true);
                playAlertSound();

                // Clear any existing timeout
                if (warningTimeoutRef.current) {
                    clearTimeout(warningTimeoutRef.current);
                }

                // Set new 10-second timeout
                warningTimeoutRef.current = setTimeout(() => {
                    setShowWarning(false);
                    warningTimeoutRef.current = null;
                }, 10000);
                
                // Terminate test after 3 tab violations
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
            if (stage === TEST_STAGES.TEST) {
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
                    
                    // Terminate test after 3 tab violations
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
    }, [stage, tabViolationCount]);

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

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleTimeUp = () => {
        handleSubmit(true);
    };
    
    const handleNoiseViolation = (level) => {
        // Track noise violations
        setNoiseViolationCount(prev => prev + 1);
        setWarningType('noise');
        setShowWarning(true);
        
        // Clear any existing timeout
        if (warningTimeoutRef.current) {
            clearTimeout(warningTimeoutRef.current);
        }
        
        // Set new 10-second timeout for the warning
        warningTimeoutRef.current = setTimeout(() => {
            setShowWarning(false);
            warningTimeoutRef.current = null;
        }, 10000);
        
        // Terminate test after 3 high noise violations
        if (level === 'high' && noiseViolationCount >= 2) {
            handleTerminate('noise');
        }
    };
    
    const handleCameraStream = (stream) => {
        cameraStreamRef.current = stream;
    };
    
    const handleTerminate = (reason) => {
        // Cleanup any media streams
        if (cameraStreamRef.current) {
            cameraStreamRef.current.getTracks().forEach(track => track.stop());
        }
        
        // Set termination reason
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
        
        // Submit the test with termination status
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
            terminationReason: reasonText
        };
        
        onComplete(result);
    };

    const handleAnswer = (questionId, selectedOption) => {
        setAnswers(prevAnswers => {
            const newAnswers = {
                ...prevAnswers,
                [questionId]: selectedOption
            };
            
            // Get the section for this question from our mapping
            const questionSection = questionSections[questionId];
            
            // Count answered questions for each section
            const sectionCounts = {
                technical: 0,
                aptitude: 0,
                logical: 0,
                personality: 0
            };
            
            // Count how many questions have been answered in each section
            Object.keys(newAnswers).forEach(qId => {
                const section = questionSections[qId];
                if (section) {
                    sectionCounts[section]++;
                }
            });
            
            // Update progress for each section
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
        // Cleanup any media streams
        if (cameraStreamRef.current) {
            cameraStreamRef.current.getTracks().forEach(track => track.stop());
        }
        
        const score = Object.entries(answers).reduce((acc, [questionId, answer]) => {
          const question = QUESTIONS.find(q => q.id.toString() === questionId);
          if (!question) return acc;
          
          if (question.isFreeText) {
            // For free-text, compare the trimmed and normalized answer
            const normalizedAnswer = answer.trim().replace(/\s+/g, ' ');
            const normalizedCorrect = question.correctAnswer.trim().replace(/\s+/g, ' ');
            return acc + (normalizedAnswer === normalizedCorrect ? 1 : 0);
          }
          // For multiple-choice
          return acc + (question.correctAnswer === answer ? 1 : 0);
        }, 0);
      
        // Calculate section scores
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
        };
      
        onComplete(result);
        setStage(TEST_STAGES.COMPLETED);
    };

    const calculateSectionScore = (sectionName) => {
        // Get all question IDs for this section
        const sectionQuestionIds = Object.entries(questionSections)
            .filter(([_, section]) => section === sectionName)
            .map(([id]) => id);
        
        // Count how many of these questions were answered
        const answeredCount = sectionQuestionIds.filter(id => answers[id] !== undefined).length;
        
        // Calculate percentage
        return (answeredCount / 10) * 100;
    };

    // Get current question based on shuffled array
    const getCurrentQuestion = () => {
        if (shuffledQuestions.length === 0) return null;
        return shuffledQuestions[currentQuestion];
    };

    // Get current section name based on the current question
    const getCurrentSectionName = () => {
        const question = getCurrentQuestion();
        if (!question) return '';
        
        return questionSections[question.id];
    };

    // Format section name for display
    const formatSectionName = (section) => {
        switch(section) {
            case 'technical': return 'Technical Knowledge';
            case 'aptitude': return 'Aptitude Assessment';
            case 'logical': return 'Logical Reasoning';
            case 'personality': return 'Personality Assessment';
            default: return '';
        }
    };

    const renderInstructions = () => (
        <div className="instructions-container">
            <h2 className="instructions-title">Test Instructions</h2>
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
                className="start-button"
                disabled={!hasReadInstructions}
                onClick={() => setStage(TEST_STAGES.CONFIRMATION)}
            >
                Start Test
            </button>
        </div>
    );

    const renderConfirmation = () => (
        <div className="confirmation-container">
            <AlertCircle size={48} className="confirmation-icon" />
            <h2>Ready to Begin?</h2>
            <p>Please ensure:</p>
            <ul>
                <li>You are in a quiet environment</li>
                <li>You have stable internet connection</li>
                <li>You have 60 minutes available</li>
                <li>You won't be interrupted</li>
                <li>You remain in this window during the test</li>
                <li>Your camera and microphone are working</li>
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
                    className="confirm-button"
                    onClick={() => setStage(TEST_STAGES.TEST)}
                >
                    Begin Test
                </button>
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
                
                {/* Camera display component */}
                <CameraCapture 
                    isTestActive={isTestActive}
                    onCameraStream={handleCameraStream}
                />
                
                {/* Noise monitor component */}
                <NoiseMonitor 
                    isTestActive={isTestActive} 
                    onNoiseViolation={handleNoiseViolation}
                />
                
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

    const renderStage = () => {
        switch (stage) {
            case TEST_STAGES.INSTRUCTIONS:
                return renderInstructions();
            case TEST_STAGES.CONFIRMATION:
                return renderConfirmation();
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