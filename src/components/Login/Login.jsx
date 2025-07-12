// import React, { useState } from 'react';
// import { DEFAULT_CREDENTIALS } from '../../data/constants';
// import './Login.css';

// export const Login = ({ onLogin }) => {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');

//   const handleSubmit = (e) => {
//     e.preventDefault();
    
//     if (username === DEFAULT_CREDENTIALS.admin.username && 
//         password === DEFAULT_CREDENTIALS.admin.password) {
//       onLogin({ type: 'admin', username });
//       return;
//     }

//     const employee = DEFAULT_CREDENTIALS.employees.find(
//       emp => emp.username === username && emp.password === password
//     );

//     if (employee) {
//       onLogin({ type: 'employee', username, name: employee.name });
//       return;
//     }

//     setError('Invalid username or password');
//   };

//   return (
//     <div className="login-wrapper">
//       <div className="login-container">
//         <h1 className="login-title">Employee Assessment Portal</h1>
//         <p className="login-subtitle">Please login to continue</p>
        
//         <form className="login-form" onSubmit={handleSubmit}>
//           <div className="form-group">
//             <label className="form-label" htmlFor="username">Username</label>
//             <input
//               id="username"
//               type="text"
//               className="form-input"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label className="form-label" htmlFor="password">Password</label>
//             <input
//               id="password"
//               type="password"
//               className="form-input"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>

//           {error && <div className="error-message">{error}</div>}
          
//           <button type="submit" className="login-button">
//             Login
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

import React, { useState } from 'react';
import { DEFAULT_CREDENTIALS } from '../../data/constants';
import './Login.css';

export const Login = ({ onLogin, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (username === DEFAULT_CREDENTIALS.admin.username && 
        password === DEFAULT_CREDENTIALS.admin.password) {
      onLogin({ type: 'admin', username });
      return;
    }

    const employee = DEFAULT_CREDENTIALS.employees.find(
      emp => emp.username === username && emp.password === password
    );

    if (employee) {
      onLogin({ type: 'employee', username, name: employee.name });
      return;
    }

    setLocalError('Invalid username or password');
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h1 className="login-title">Employee Assessment Portal</h1>
        <p className="login-subtitle">Please login to continue</p>
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Display either local or app-level error */}
          {(error || localError) && (
            <div className="error-message">
              {error || localError}
            </div>
          )}
          
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};