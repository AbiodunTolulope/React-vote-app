// App.js - Corrected version
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreatePoll from "./pages/CreatePoll";
import PollView from "./pages/PollView";
import Layout from "./components/layout/Layout";

const App = () => {
  return (
    <Router>
      <Layout>
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
      </Layout>
    </Router>
  );
};

export default App;