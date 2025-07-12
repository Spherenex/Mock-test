// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAr5tsAySfe36uHtsibKT2ohjIJQzF9hSw",
    authDomain: "mock-test-a909d.firebaseapp.com",
    projectId: "mock-test-a909d",
    storageBucket: "mock-test-a909d.firebasestorage.app",
    messagingSenderId: "1077493960587",
    appId: "1:1077493960587:web:2b1dfc2c621554e7a3a98e",
    measurementId: "G-E5J88LLK7Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);