import React, { useState, useEffect } from "react";
// 1. Remove unnecessary imports. We only need the custom useAuth hook 
//    if it's defined in AuthContext.js, not the provider itself.
import { useNavigate, Link } from "react-router-dom";
// 2. You only need to import the custom hook if defined in AuthContext.js, 
//    or import useContext and AuthContext if not using a custom hook. 
//    Based on the previous fix, we'll assume you defined the custom hook `useAuth`.
import { useAuth } from "./AuthContext"; // Use relative path

// 3. Remove all Firebase imports from this file. 
//    The actual Firebase logic (signInWithEmailAndPassword) should be moved 
//    to your AuthProvider in AuthContext.js.

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // 4. Use the custom hook to get the user and the login function.
  const { user, login } = useAuth(); // Assuming your context provides a 'login' function

  // Redirect if user is already logged in (This logic is correct)
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    // The sign-in logic should be called via the 'login' function from the context.
    try {
      // 5. CALL THE CONTEXT LOGIN FUNCTION
      // Pass the email and password to the login function defined in AuthContext.js
      await login(email, password); 

      // The navigation to "/vote" is already handled by the useEffect above
      // when the 'user' state changes after a successful login in AuthContext.
      
    } catch (error) {
      // Handle login errors here (e.g., display a message)
      const errorMessage = error.message;
      alert(errorMessage);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleLogin}>
        <h2>Login</h2>
        {/* ... (Input fields and button remain the same) ... */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        <p className="auth-switch">
          New here? Click to <Link to="/signup">Signup/Create an account</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;