// import React, { useState } from 'react';
// import { User, Clock, BarChart, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
// import { QUESTIONS } from '../../data/constants';
// import './AdminDashboard.css';

// export const AdminDashboard = ({ results, onReset }) => { // Add onReset prop
//   const [expandedUsers, setExpandedUsers] = useState({});

//   const calculateStats = () => {
//     if (results.length === 0) {
//       return { avgScore: 0, passRate: 0, totalCompleted: 0, highestScore: 0 };
//     }
//     const totalScore = results.reduce((acc, r) => acc + r.score, 0);
//     const passedTests = results.filter(r => r.score >= 70).length;
//     const highestScore = Math.max(...results.map(r => r.score));
//     return {
//       avgScore: totalScore / results.length,
//       passRate: (passedTests / results.length) * 100,
//       totalCompleted: results.length,
//       highestScore,
//     };
//   };

//   const stats = calculateStats();

//   const getCandidateStats = (result) => {
//     const correctCount = Object.entries(result.answers).reduce((acc, [qId, answer]) => {
//       const question = QUESTIONS[parseInt(qId) - 1];
//       if (question.isFreeText) {
//         const normalizedAnswer = answer.trim().replace(/\s+/g, ' ');
//         const normalizedCorrect = question.correctAnswer.trim().replace(/\s+/g, ' ');
//         return acc + (normalizedAnswer === normalizedCorrect ? 1 : 0);
//       }
//       return acc + (question.correctAnswer === answer ? 1 : 0);
//     }, 0);
//     return { correctCount, wrongCount: QUESTIONS.length - correctCount };
//   };

//   const toggleExpand = (user) => {
//     setExpandedUsers(prev => ({ ...prev, [user]: !prev[user] }));
//   };

//   const sortedResults = [...results].sort((a, b) => b.score - a.score);

//   return (
//     <div className="admin-container">
//       <div className="stats-grid">
//         <div className="stat-card">
//           <p className="stat-label">Average Score</p>
//           <p className="stat-value">{stats.avgScore.toFixed(1)}%</p>
//         </div>
//         <div className="stat-card">
//           <p className="stat-label">Tests Completed</p>
//           <p className="stat-value">{stats.totalCompleted}/{results.length}</p>
//         </div>
//         <div className="stat-card">
//           <p className="stat-label">Pass Rate</p>
//           <p className="stat-value">{stats.passRate.toFixed(1)}%</p>
//         </div>
//         <div className="stat-card">
//           <p className="stat-label">Highest Score</p>
//           <p className="stat-value">{stats.highestScore.toFixed(1)}%</p>
//         </div>
//       </div>

//       <div className="results-section">
//         <div className="section-header">
//           <h2 className="section-title">Candidate Assessment Results</h2>
//           <button className="reset-button" onClick={onReset}>
//             Reset All Results
//           </button>
//         </div>
//         <div className="results-list">
//           {sortedResults.map((result, index) => {
//             const { correctCount, wrongCount } = getCandidateStats(result);
//             const isExpanded = expandedUsers[result.user];
//             return (
//               <div key={index} className="result-item">
//                 <div className="result-header" onClick={() => toggleExpand(result.user)}>
//                   <div className="user-info">
//                     <User size={24} />
//                     <div>
//                       <h3>{result.user} {index === 0 && <span className="top-performer">(Top Performer)</span>}</h3>
//                       <p>Completed: {new Date(result.date).toLocaleDateString()}</p>
//                     </div>
//                   </div>
//                   <div className="result-details">
//                     <div><Clock size={16} /><span>{Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s</span></div>
//                     <div><BarChart size={16} /><span className={`score ${result.score >= 70 ? 'score-pass' : 'score-fail'}`}>{result.score.toFixed(1)}%</span></div>
//                     <div><AlertTriangle size={16} /><span>{result.violations} Violations</span></div>
//                     {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
//                   </div>
//                 </div>
//                 {isExpanded && (
//                   <div className="result-expanded">
//                     <div className="stats-summary">
//                       <p>Correct Answers: <span className="correct">{correctCount}</span></p>
//                       <p>Wrong Answers: <span className="wrong">{wrongCount}</span></p>
//                       <p>Section Scores:</p>
//                       <ul>
//                         {Object.entries(result.sections).map(([section, score]) => (
//                           <li key={section}>{section.charAt(0).toUpperCase() + section.slice(1)}: {score.toFixed(1)}%</li>
//                         ))}
//                       </ul>
//                     </div>
//                     <div className="questions-list">
//                       <h4>Question Details</h4>
//                       <table className="question-table">
//                         <thead>
//                           <tr>
//                             <th>Question</th>
//                             <th>Marked Answer</th>
//                             <th>Correct Answer</th>
//                             <th>Status</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {QUESTIONS.map((q) => {
//                             const markedAnswer = result.answers[q.id];
//                             const isCorrect = q.isFreeText
//                               ? markedAnswer?.trim().replace(/\s+/g, ' ') === q.correctAnswer.trim().replace(/\s+/g, ' ')
//                               : markedAnswer === q.correctAnswer;
//                             return (
//                               <tr key={q.id}>
//                                 <td>{q.question}</td>
//                                 <td>{q.isFreeText ? <pre>{markedAnswer || 'Not answered'}</pre> : q.options ? q.options[markedAnswer] || 'Not answered' : 'Not answered'}</td>
//                                 <td>{q.isFreeText ? <pre>{q.correctAnswer}</pre> : q.options[q.correctAnswer]}</td>
//                                 <td className={isCorrect ? 'status-correct' : 'status-wrong'}>{isCorrect ? 'Correct' : 'Wrong'}</td>
//                               </tr>
//                             );
//                           })}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// };

import React, { useState } from 'react';
import { User, Clock, BarChart, AlertTriangle, ChevronDown, ChevronUp, Volume2 } from 'lucide-react';
import { QUESTIONS } from '../../data/constants';
import { AdminCamera } from '../Camera/AdminCamera';
import './AdminDashboard.css';

export const AdminDashboard = ({ results, onReset }) => {
  const [expandedUsers, setExpandedUsers] = useState({});
  const [showLiveMonitoring, setShowLiveMonitoring] = useState(true);

  const calculateStats = () => {
    if (results.length === 0) {
      return { avgScore: 0, passRate: 0, totalCompleted: 0, highestScore: 0, terminationRate: 0 };
    }
    const totalScore = results.reduce((acc, r) => acc + r.score, 0);
    const passedTests = results.filter(r => r.score >= 70).length;
    const highestScore = Math.max(...results.map(r => r.score));
    const terminatedTests = results.filter(r => r.submittedBy === 'terminated').length;
    return {
      avgScore: totalScore / results.length,
      passRate: (passedTests / results.length) * 100,
      totalCompleted: results.length,
      highestScore,
      terminationRate: (terminatedTests / results.length) * 100
    };
  };

  const stats = calculateStats();

  const getCandidateStats = (result) => {
    const correctCount = Object.entries(result.answers || {}).reduce((acc, [qId, answer]) => {
      const question = QUESTIONS[parseInt(qId) - 1];
      if (!question) return acc;
      
      if (question.isFreeText) {
        const normalizedAnswer = answer.trim().replace(/\s+/g, ' ');
        const normalizedCorrect = question.correctAnswer.trim().replace(/\s+/g, ' ');
        return acc + (normalizedAnswer === normalizedCorrect ? 1 : 0);
      }
      return acc + (question.correctAnswer === answer ? 1 : 0);
    }, 0);
    return { correctCount, wrongCount: QUESTIONS.length - correctCount };
  };

  const toggleExpand = (user) => {
    setExpandedUsers(prev => ({ ...prev, [user]: !prev[user] }));
  };

  const sortedResults = [...results].sort((a, b) => b.score - a.score);

  return (
    <div className="admin-container">
      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Average Score</p>
          <p className="stat-value">{stats.avgScore.toFixed(1)}%</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Tests Completed</p>
          <p className="stat-value">{stats.totalCompleted}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Pass Rate</p>
          <p className="stat-value">{stats.passRate.toFixed(1)}%</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Test Termination Rate</p>
          <p className="stat-value">{stats.terminationRate.toFixed(1)}%</p>
        </div>
      </div>

      {showLiveMonitoring && (
        <AdminCamera results={results} />
      )}

      <div className="results-section">
        <div className="section-header">
          <h2 className="section-title">Candidate Assessment Results</h2>
          <div className="admin-controls">
            <button 
              className="toggle-monitoring-button"
              onClick={() => setShowLiveMonitoring(!showLiveMonitoring)}
            >
              {showLiveMonitoring ? 'Hide Live Monitoring' : 'Show Live Monitoring'}
            </button>
            <button className="reset-button" onClick={onReset}>
              Reset All Results
            </button>
          </div>
        </div>
        <div className="results-list">
          {sortedResults.map((result, index) => {
            const { correctCount, wrongCount } = getCandidateStats(result);
            const isExpanded = expandedUsers[result.user];
            const isTerminated = result.submittedBy === 'terminated';
            
            return (
              <div key={index} className={`result-item ${isTerminated ? 'terminated' : ''}`}>
                <div className="result-header" onClick={() => toggleExpand(result.user)}>
                  <div className="user-info">
                    <User size={24} />
                    <div>
                      <h3>
                        {result.user} 
                        {index === 0 && !isTerminated && <span className="top-performer">(Top Performer)</span>}
                        {isTerminated && <span className="terminated-badge">TERMINATED</span>}
                      </h3>
                      <p>Completed: {new Date(result.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="result-details">
                    <div><Clock size={16} /><span>{Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s</span></div>
                    <div><BarChart size={16} /><span className={`score ${result.score >= 70 ? 'score-pass' : 'score-fail'}`}>{result.score.toFixed(1)}%</span></div>
                    <div><AlertTriangle size={16} /><span>{result.violations} Tab Violations</span></div>
                    <div><Volume2 size={16} /><span>{result.noiseViolations || 0} Noise Violations</span></div>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
                {isExpanded && (
                  <div className="result-expanded">
                    {isTerminated && (
                      <div className="termination-alert">
                        <AlertTriangle size={18} />
                        <span>
                          This test was terminated due to integrity violations. Reason: {result.terminationReason || 'Multiple violations detected'}
                        </span>
                      </div>
                    )}
                    
                    <div className="stats-summary">
                      <p>Correct Answers: <span className="correct">{correctCount}</span></p>
                      <p>Wrong Answers: <span className="wrong">{wrongCount}</span></p>
                      <p>Section Scores:</p>
                      <ul>
                        {Object.entries(result.sections || {}).map(([section, score]) => (
                          <li key={section}>{section.charAt(0).toUpperCase() + section.slice(1)}: {score.toFixed(1)}%</li>
                        ))}
                      </ul>
                    </div>
                    <div className="questions-list">
                      <h4>Question Details</h4>
                      <table className="question-table">
                        <thead>
                          <tr>
                            <th>Question</th>
                            <th>Marked Answer</th>
                            <th>Correct Answer</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {QUESTIONS.map((q) => {
                            const markedAnswer = result.answers?.[q.id];
                            const isCorrect = q.isFreeText
                              ? markedAnswer?.trim().replace(/\s+/g, ' ') === q.correctAnswer.trim().replace(/\s+/g, ' ')
                              : markedAnswer === q.correctAnswer;
                            return (
                              <tr key={q.id}>
                                <td>{q.question}</td>
                                <td>{q.isFreeText ? <pre>{markedAnswer || 'Not answered'}</pre> : q.options ? q.options[markedAnswer] || 'Not answered' : 'Not answered'}</td>
                                <td>{q.isFreeText ? <pre>{q.correctAnswer}</pre> : q.options[q.correctAnswer]}</td>
                                <td className={isCorrect ? 'status-correct' : 'status-wrong'}>{isCorrect ? 'Correct' : 'Wrong'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};