import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { db } from './firebase'; 
import { collection, addDoc, serverTimestamp, doc, setDoc, arrayUnion } from 'firebase/firestore'; 
import { useAuth } from './AuthContext';
import "./CreatePoll.css";

function CreatePoll() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([{ text: '' }, { text: '' }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check network connectivity
  const isOnline = () => {
    return navigator.onLine;
  };

  // Redirect unauthenticated users to signup
  useEffect(() => {
    if (!user) {
      // Show a message and then redirect to signup
      setTimeout(() => {
        navigate('/signup');
      }, 100);
    }
  }, [user, navigate]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index].text = value;
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    setOptions([...options, { text: '' }]);
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    } else {
      setError('A poll must have at least two options.');
    }
  };

  // --- Main Submission Logic ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Check network connectivity
    if (!isOnline()) {
      setError('You are offline. Please check your internet connection and try again.');
      return;
    }

    // 2. Validation - Redirect unauthenticated users immediately
    if (!user) {
      setError('You need to create an account to create a poll. Redirecting to signup...');
      setTimeout(() => {
        navigate('/signup');
      }, 2000);
      return;
    }

    const cleanOptions = options.filter(opt => opt.text.trim() !== '');
    if (!question.trim()) {
      setError('Please enter a poll question.');
      return;
    }
    if (cleanOptions.length < 2) {
      setError('A poll must have at least two valid options.');
      return;
    }

    setLoading(true);

    try {
      // 3. Prepare the Poll Data
      const pollData = {
        question: question.trim(),
        options: cleanOptions.reduce((acc, option) => {
          acc[option.text.trim()] = 0;
          return acc;
        }, {}),
        creatorId: user.uid,
        creatorEmail: user.email,
        totalVotes: 0,
        createdAt: serverTimestamp(),
      };

      // 4. Add timeout for network requests
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout. Please check your internet connection.')), 10000);
      });

      // 5. Race between our operation and timeout
      const pollRef = await Promise.race([
        addDoc(collection(db, 'polls'), pollData),
        timeoutPromise
      ]);
      
      // 6. Update user document
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        createdPolls: arrayUnion(pollRef.id),
        lastUpdated: serverTimestamp()
      }, { merge: true });

      // 7. Success
      alert('Poll created successfully!');
      navigate('/dashboard');

    } catch (e) {
      console.error("Error creating poll:", e);
      
      // Better error messages
      if (e.message.includes('timeout') || e.message.includes('offline')) {
        setError('Network error. Please check your internet connection and try again.');
      } else if (e.code === 'permission-denied') {
        setError('Permission denied. You may not have access to create polls.');
      } else if (e.code === 'unavailable') {
        setError('Firestore is temporarily unavailable. Please try again.');
      } else {
        setError(`Failed to create poll: ${e.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Add network status indicator to UI
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network connection restored');
    };
    
    const handleOffline = () => {
      console.log('Network connection lost');
      setError('You are offline. Some features may be unavailable.');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // If user is not authenticated, show a message and redirect
  if (!user) {
    return (
      <div className="create-poll-container">
        <div className="auth-required-message">
          <h2>Create Your Own Poll</h2>
          <div className="auth-icon">
            🔒
          </div>
          <p className="auth-description">
            You need to create an account to make your own polls.
          </p>
          <p className="auth-benefits">
            With an account, you can:
          </p>
          <ul className="benefits-list">
            <li>✓ Create unlimited polls</li>
            <li>✓ Track voting results in real-time</li>
            <li>✓ Share polls with friends and colleagues</li>
            <li>✓ Manage all your polls in one dashboard</li>
          </ul>
          <div className="auth-buttons">
            <button 
              onClick={() => navigate('/signup')}
              className="signup-btn"
            >
              Sign Up - It's Free!
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="login-btn"
            >
              Already have an account? Sign In
            </button>
          </div>
          <p className="auth-note">
            Don't worry, you'll be redirected to the signup page automatically...
          </p>
        </div>
      </div>
    );
  }

  // --- Render for authenticated users ---
  return (
    <div className="create-poll-container">
      <div className="create-poll-header">
        <h2>Create New Poll</h2>
        <p className="user-greeting">Welcome, {user.email?.split('@')[0]}! 👋</p>
      </div>
      
      {/* Network status indicator */}
      {!isOnline() && (
        <div className="network-warning">
          ⚠️ You are currently offline. Some features may be unavailable.
        </div>
      )}
      
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit} className="poll-form">
        <div className="form-group">
          <label htmlFor="question">Poll Question:</label>
          <input
            id="question"
            type="text"
            placeholder="e.g., What is your favorite framework?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            disabled={loading || !isOnline()}
          />
          <p className="field-hint">Make your question clear and engaging!</p>
        </div>

        <div className="options-list">
          <label>Poll Options:</label>
          <p className="field-hint">Add at least 2 options. Users will choose one.</p>
          {options.map((option, index) => (
            <div key={index} className="option-input-group">
              <input
                type="text"
                placeholder={`Option ${index + 1}`}
                value={option.text}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                required
                disabled={loading || !isOnline()}
              />
              {options.length > 2 && (
                <button 
                  type="button" 
                  onClick={() => handleRemoveOption(index)} 
                  className="remove-option-btn"
                  disabled={loading}
                  title="Remove this option"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button 
            type="button" 
            onClick={handleAddOption} 
            className="add-option-btn" 
            disabled={loading || !isOnline()}
          >
            + Add Option
          </button>
          <p className="field-hint">More options = more interesting results!</p>
        </div>
        
        <div className="form-actions">
          <button 
            type="button"
            onClick={() => navigate('/dashboard')}
            className="cancel-btn"
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading || !isOnline()} 
            className="submit-poll-btn"
            title={!isOnline() ? "You need to be online to create a poll" : ""}
          >
            {loading ? 'Creating...' : (isOnline() ? 'Create Poll' : 'Offline - Cannot Create')}
          </button>
        </div>
      </form>
      
      <div className="create-poll-tips">
        <h4>Tips for creating great polls:</h4>
        <ul>
          <li>Keep questions simple and clear</li>
          <li>Offer distinct, non-overlapping options</li>
          <li>Add 3-5 options for best engagement</li>
          <li>Share your poll link after creation</li>
        </ul>
      </div>
    </div>
  );
}

export default CreatePoll;