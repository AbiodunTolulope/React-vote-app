import React, { createContext, useState, useContext, useEffect } from 'react';
// 1. Import Firebase Authentication functions and your initialized 'auth' object
import { auth } from './firebase'; // **IMPORTANT: Adjust path to your Firebase config file**
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';

// 2. Create the Context
export const AuthContext = createContext({
  user: null,         // The Firebase User object or null
  loading: true,      // To track if Firebase is still checking auth state
  login: () => {},    // Function to handle login
  logout: () => {},   // Function to handle logout
});

// 3. Create a Custom Hook
export const useAuth = () => {
  return useContext(AuthContext);
};

// 4. Create the Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Firebase Authentication Effect ---
  // This runs once on mount to subscribe to the user's auth state
  useEffect(() => {
    // This is the Firebase observer function
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Authentication check is complete
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // --- Context Login Function ---
  const login = async (email, password) => {
    setLoading(true);
    try {
      // Use the Firebase function to sign the user in
      await signInWithEmailAndPassword(auth, email, password);
      // setUser is handled automatically by the onAuthStateChanged observer above
    } catch (error) {
      console.error("Firebase Login Error:", error.message);
      setLoading(false);
      throw error; // Re-throw the error so the Login component can catch it and display it
    }
  };

  // --- Context Logout Function ---
  const logout = async () => {
    try {
      // Use the Firebase function to sign the user out
      await signOut(auth);
      // setUser is handled automatically by the onAuthStateChanged observer
    } catch (error) {
      console.error("Firebase Logout Error:", error.message);
      throw error;
    }
  };

  // The value object provided to consuming components
  const contextValue = {
    user,
    loading,
    login,
    logout,
  };

  // 5. Provide the context value
  return (
    <AuthContext.Provider value={contextValue}>
      {/* Only render children when the initial auth state check is complete */}
      {!loading && children} 
    </AuthContext.Provider>
  );
};