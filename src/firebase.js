// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {  initializeFirestore,  } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAGsNWZeeBx9gfMHzUwQ4eGMLIRoDK1Vkw",
  authDomain: "vote-app-f4b48.firebaseapp.com",
  projectId: "vote-app-f4b48",
  storageBucket: "vote-app-f4b48.firebasestorage.app",
  messagingSenderId: "416677364644",
  appId: "1:416677364644:web:1b1b879c42b9ed7febb731",
  measurementId: "G-LH5JF7GBB9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true, // Forces a more stable connection method
});
export const auth = getAuth(app);