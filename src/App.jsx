// import React, { useState, useEffect } from 'react';
// import { Login } from './components/Login/Login';
// import { Header } from './components/Header/Header';
// import { TestInterface } from './components/TestInterface/TestInterface';
// import { AdminDashboard } from './components/AdminDashboard/AdminDashboard';
// import { db } from './firebase';
// import { collection, addDoc, getDocs, deleteDoc, query, orderBy } from 'firebase/firestore';
// import './App.css';

// const App = () => {
//   const [user, setUser] = useState(null);
//   const [results, setResults] = useState([]);

//   // Fetch results from Firebase when admin logs in
//   useEffect(() => {
//     if (user?.type === 'admin') {
//       fetchResults();
//     }
//   }, [user]);

//   const fetchResults = async () => {
//     try {
//       const resultsQuery = query(collection(db, 'results'), orderBy('date', 'desc'));
//       const querySnapshot = await getDocs(resultsQuery);
//       const resultsData = querySnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       }));
//       setResults(resultsData);
//     } catch (error) {
//       console.error('Error fetching results:', error);
//     }
//   };

//   const handleLogin = (userData) => {
//     setUser(userData);
//   };

//   const handleLogout = () => {
//     setUser(null);
//     setResults([]); // Clear results on logout
//   };

//   const handleTestComplete = async (result) => {
//     const updatedResult = { 
//       ...result, 
//       date: new Date().toISOString(),
//       timestamp: new Date() // Adding timestamp for Firebase ordering
//     };

//     try {
//       await addDoc(collection(db, 'results'), updatedResult);
      
//       // If admin is viewing, refresh the results
//       if (user?.type === 'admin') {
//         fetchResults();
//       }
//     } catch (error) {
//       console.error('Error saving test result:', error);
//     }
//   };

//   const handleReset = async () => {
//     try {
//       const querySnapshot = await getDocs(collection(db, 'results'));
//       const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
//       await Promise.all(deletePromises);
//       setResults([]); // Clear results in state
//     } catch (error) {
//       console.error('Error resetting results:', error);
//     }
//   };

//   if (!user) {
//     return <Login onLogin={handleLogin} />;
//   }

//   return (
//     <div className="app">
//       <Header user={user} onLogout={handleLogout} />
//       <main className="main-content">
//         {user.type === 'admin' ? (
//           <AdminDashboard results={results} onReset={handleReset} />
//         ) : (
//           <TestInterface user={user} onComplete={handleTestComplete} />
//         )}
//       </main>
//     </div>
//   );
// };

// export default App;


import React, { useState, useEffect } from 'react';
import { Login } from './components/Login/Login';
import { Header } from './components/Header/Header';
import { TestInterface } from './components/TestInterface/TestInterface';
import { AdminDashboard } from './components/AdminDashboard/AdminDashboard';
import { db } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, query, orderBy, setDoc, doc, getDoc } from 'firebase/firestore';
import './App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [results, setResults] = useState([]);
  const [terminatedUsers, setTerminatedUsers] = useState([]);
  const [loginError, setLoginError] = useState(null);

  // Fetch results and terminated users list from Firebase when admin logs in
  useEffect(() => {
    if (user?.type === 'admin') {
      fetchResults();
      fetchTerminatedUsers();
    }
  }, [user]);

  const fetchResults = async () => {
    try {
      const resultsQuery = query(collection(db, 'results'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(resultsQuery);
      const resultsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setResults(resultsData);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };
  
  const fetchTerminatedUsers = async () => {
    try {
      const terminatedUsersDoc = await getDoc(doc(db, 'admin', 'terminatedUsers'));
      if (terminatedUsersDoc.exists()) {
        setTerminatedUsers(terminatedUsersDoc.data().usernames || []);
      } else {
        // Create the document if it doesn't exist
        await setDoc(doc(db, 'admin', 'terminatedUsers'), { usernames: [] });
        setTerminatedUsers([]);
      }
    } catch (error) {
      console.error('Error fetching terminated users:', error);
    }
  };

  const handleLogin = async (userData) => {
    setLoginError(null);
    
    // Check if user is in the terminated list
    if (userData.type === 'employee') {
      try {
        const terminatedUsersDoc = await getDoc(doc(db, 'admin', 'terminatedUsers'));
        if (terminatedUsersDoc.exists()) {
          const terminatedList = terminatedUsersDoc.data().usernames || [];
          if (terminatedList.includes(userData.username)) {
            setLoginError('Your account has been locked due to test integrity violations. Please contact your administrator.');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking terminated users:', error);
      }
    }
    
    // Proceed with login if not terminated
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setResults([]);
    setLoginError(null);
  };

  const handleTestComplete = async (result) => {
    const updatedResult = { 
      ...result, 
      date: new Date().toISOString(),
      timestamp: new Date() // Adding timestamp for Firebase ordering
    };

    try {
      // Add the test result
      await addDoc(collection(db, 'results'), updatedResult);
      
      // If the test was terminated, add user to terminated list
      if (result.submittedBy === 'terminated') {
        const terminatedUsersDoc = await getDoc(doc(db, 'admin', 'terminatedUsers'));
        let terminatedList = [];
        
        if (terminatedUsersDoc.exists()) {
          terminatedList = terminatedUsersDoc.data().usernames || [];
        }
        
        // Add user to terminated list if not already in it
        if (!terminatedList.includes(user.username)) {
          terminatedList.push(user.username);
          await setDoc(doc(db, 'admin', 'terminatedUsers'), { usernames: terminatedList });
        }
      }
      
      // If admin is viewing, refresh the results
      if (user?.type === 'admin') {
        fetchResults();
        fetchTerminatedUsers();
      }
    } catch (error) {
      console.error('Error saving test result:', error);
    }
  };

  const handleReset = async () => {
    try {
      // Delete all results
      const querySnapshot = await getDocs(collection(db, 'results'));
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      // Reset terminated users list
      await setDoc(doc(db, 'admin', 'terminatedUsers'), { usernames: [] });
      
      // Update state
      setResults([]);
      setTerminatedUsers([]);
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} error={loginError} />;
  }

  return (
    <div className="app">
      <Header user={user} onLogout={handleLogout} />
      <main className="main-content">
        {user.type === 'admin' ? (
          <AdminDashboard results={results} onReset={handleReset} />
        ) : (
          <TestInterface user={user} onComplete={handleTestComplete} />
        )}
      </main>
    </div>
  );
};

export default App;