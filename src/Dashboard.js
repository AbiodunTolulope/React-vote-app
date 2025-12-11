import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { db } from './firebase'; 
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  arrayRemove
} from 'firebase/firestore'; 
import "./Dashboard.css";

function Dashboard() {
  const { user, logout, loading } = useAuth(); 
  const navigate = useNavigate();

  const [createdPolls, setCreatedPolls] = useState([]);
  const [isLoadingPolls, setIsLoadingPolls] = useState(true);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null); // For delete confirmation modal

  // --- Effect: Authentication Check and Poll Fetch ---
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }
    
    if (user) {
      setupPollsListener();
    }
    
    return () => {};
  }, [user, loading, navigate]);

  // --- Function to Set Up Real-time Listener for User's Polls ---
  const setupPollsListener = () => {
    setIsLoadingPolls(true);
    setError(null);

    if (!user || !user.uid) {
      setIsLoadingPolls(false);
      return;
    }

    try {
      const pollsQuery = query(
        collection(db, "polls"),
        where("creatorId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      
      const unsubscribe = onSnapshot(pollsQuery, 
        (querySnapshot) => {
          const pollsData = [];
          querySnapshot.forEach((doc) => {
            const pollData = doc.data();
            pollsData.push({
              id: doc.id,
              question: pollData.question,
              options: pollData.options || {},
              totalVotes: pollData.totalVotes || 0,
              createdAt: pollData.createdAt,
              creatorEmail: pollData.creatorEmail,
              creatorId: pollData.creatorId
            });
          });
          
          setCreatedPolls(pollsData);
          setIsLoadingPolls(false);
        },
        (error) => {
          console.error("Error listening to polls:", error);
          setError("Failed to load polls. Please try again.");
          setIsLoadingPolls(false);
        }
      );

      return unsubscribe;
    } catch (e) {
      console.error("Error setting up listener:", e);
      setError(`Failed to load polls. Error: ${e.message}`);
      setIsLoadingPolls(false);
    }
  };

  // --- Format Date Function ---
  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return "N/A";
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // --- Calculate Percentage Function ---
  const calculatePercentage = (votes, totalVotes) => {
    if (!totalVotes || totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  // --- Copy Poll Link Function ---
  const copyPollLink = (pollId) => {
    const pollUrl = `${window.location.origin}/poll/${pollId}`;
    navigator.clipboard.writeText(pollUrl)
      .then(() => {
        setCopySuccess("Link copied to clipboard!");
        setTimeout(() => setCopySuccess(""), 3000);
      })
      .catch(err => {
        console.error("Failed to copy:", err);
        setCopySuccess("Failed to copy link");
      });
  };

  // --- Delete Poll Function ---
  const deletePoll = async (pollId) => {
    if (!user) {
      setError("You must be logged in to delete a poll.");
      return;
    }

    try {
      // 1. First, remove the poll ID from user's createdPolls array
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        createdPolls: arrayRemove(pollId)
      });

      // 2. Delete the poll document
      const pollRef = doc(db, "polls", pollId);
      await deleteDoc(pollRef);

      // 3. Close confirmation modal
      setDeleteConfirm(null);
      
      // Show success message
      setCopySuccess("Poll deleted successfully!");
      setTimeout(() => setCopySuccess(""), 3000);

    } catch (error) {
      console.error("Error deleting poll:", error);
      setError("Failed to delete poll. Please try again.");
    }
  };

  // --- Open Delete Confirmation ---
  const openDeleteConfirm = (pollId, question) => {
    setDeleteConfirm({
      pollId,
      question: question.length > 50 ? question.substring(0, 50) + "..." : question
    });
  };

  // --- Close Delete Confirmation ---
  const closeDeleteConfirm = () => {
    setDeleteConfirm(null);
  };

  // --- Handlers (Logout) ---
  const handleLogout = async () => {
    try {
      await logout(); 
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // --- Go to Create Poll ---
  const goToCreatePoll = () => {
    navigate('/create-poll');
  };

  // --- View Poll Function ---
  const viewPoll = (pollId) => {
    navigate(`/poll/${pollId}`);
  };

  // --- Loading State ---
  if (loading || isLoadingPolls) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // --- No User State ---
  if (!user) {
    return (
      <div className="App">
        <h1>Please log in to view your dashboard</h1>
        <p>Login <Link to="/login">Here</Link></p>
      </div>
    );
  }

  // --- Main Dashboard Render ---
  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <h1 className="app-header">Welcome to Poll Point, {user.email?.split('@')[0]}!</h1>
        <p className="dashboard-subtitle">Manage and track all your created polls</p>
        
        <div className="utility-buttons">
          <button 
            className="create-poll-btn-header" 
            onClick={goToCreatePoll}
          >
            ➕ Create New Poll
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </div>

      {/* Copy Success Message */}
      {copySuccess && (
        <div className="copy-success-message">
          ✓ {copySuccess}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message-dashboard">
          ⚠️ {error}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="delete-confirmation-modal">
          <div className="delete-modal-content">
            <h3>Delete Poll</h3>
            <p>Are you sure you want to delete this poll?</p>
            <p className="poll-question-confirm">"{deleteConfirm.question}"</p>
            <p className="warning-text">⚠️ This action cannot be undone. All votes and data will be permanently deleted.</p>
            
            <div className="delete-modal-actions">
              <button 
                onClick={() => deletePoll(deleteConfirm.pollId)}
                className="confirm-delete-btn"
              >
                Yes, Delete Poll
              </button>
              <button 
                onClick={closeDeleteConfirm}
                className="cancel-delete-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-number">{createdPolls.length}</div>
          <div className="stat-label">Total Polls</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {createdPolls.reduce((total, poll) => total + (poll.totalVotes || 0), 0)}
          </div>
          <div className="stat-label">Total Votes</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {createdPolls.length > 0 
              ? Math.round(
                  createdPolls.reduce((total, poll) => total + (poll.totalVotes || 0), 0) / 
                  createdPolls.length
                )
              : 0
            }
          </div>
          <div className="stat-label">Avg Votes/Poll</div>
        </div>
      </div>

      {/* Your Created Polls Section */}
      <div className="polls-section">
        <h2 className="section-title">Your Created Polls</h2>
        
        {createdPolls.length === 0 ? (
          <div className="no-polls-message">
            <p>You haven't created any polls yet. Start your first poll now!</p>
            <button onClick={goToCreatePoll} className="create-first-poll-btn">
              Create Your First Poll
            </button>
          </div>
        ) : (
          <div className="polls-grid">
            {createdPolls.map(poll => (
              <div key={poll.id} className="poll-card">
                {/* Poll Header */}
                <div className="poll-card-header">
                  <h3 className="poll-question">{poll.question}</h3>
                  <div className="poll-meta-info">
                    <span className="poll-date">
                      📅 {formatDate(poll.createdAt)}
                    </span>
                    <span className="poll-id">
                      ID: {poll.id.substring(0, 8)}...
                    </span>
                  </div>
                </div>

                {/* Total Votes Badge */}
                <div className="total-votes-container">
                  <div className="total-votes-badge">
                    <span className="votes-count">{poll.totalVotes}</span>
                    <span className="votes-label">Total Votes</span>
                  </div>
                </div>

                {/* Voting Results */}
                <div className="poll-results">
                  <h4 className="results-title">Voting Results:</h4>
                  {Object.entries(poll.options).map(([optionText, voteCount]) => {
                    const percentage = calculatePercentage(voteCount, poll.totalVotes);
                    return (
                      <div key={optionText} className="result-row">
                        <div className="option-info">
                          <span className="option-text">{optionText}</span>
                          <span className="option-stats">
                            {voteCount} votes ({percentage}%)
                          </span>
                        </div>
                        <div className="progress-bar-container">
                          <div 
                            className="progress-bar-fill"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Poll Actions */}
                <div className="poll-actions">
                  <button 
                    onClick={() => copyPollLink(poll.id)}
                    className="action-btn copy-link-btn"
                    title="Copy poll link to share"
                  >
                    📋 Copy Link
                  </button>
                  <button 
                    onClick={() => viewPoll(poll.id)}
                    className="action-btn view-poll-btn"
                  >
                    👁️ View Poll
                  </button>
                  <button 
                    onClick={() => openDeleteConfirm(poll.id, poll.question)}
                    className="action-btn delete-poll-btn"
                    title="Delete this poll"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Link to Public Polls */}
      <div className="bottom-navigation">
        <Link to="/vote" className="view-public-polls-link">
          ← Browse Public Polls (Voting Page)
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;