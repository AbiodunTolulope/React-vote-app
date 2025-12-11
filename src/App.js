// App.js - Corrected version
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Signup from "./Signup";
import Login from "./Login";
import Dashboard from "./Dashboard";
import CreatePoll from "./CreatePoll";
import PollView from "./PollView";
const App = () => {
  return (
    <Router>
      <Routes>
        {/* Default route redirects to the user's home page (Dashboard) */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        
        {/* The new home page route */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        <Route path="/create-poll" element={<CreatePoll />} />
        
        {/* Note: If you want to keep a general voting page, you should point
        | this route to a dedicated voting component that handles poll selection. 
        | We keep the old name here to avoid new errors, but its function is now different */}
        <Route path="/vote" element={<Dashboard />} />
           <Route path="/poll/:pollId" element={<PollView />} /> 
      </Routes>
    </Router>
  );
};

export default App;