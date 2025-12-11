// PollView.js - Updated version
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { doc, getDoc, updateDoc, increment, onSnapshot } from 'firebase/firestore';
import { useAuth } from './AuthContext'; // Import AuthContext
import './PollView.css';

function PollView() {
    const { pollId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth(); // Get current user

    const [poll, setPoll] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedOption, setSelectedOption] = useState('');
    const [hasVoted, setHasVoted] = useState(false);
    const [voteSubmitted, setVoteSubmitted] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');

    // Check if user has already voted
    const checkVoteStatus = () => {
        if (!pollId) return false;
        
        // Check localStorage first
        const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '{}');
        if (votedPolls[pollId]) {
            return true;
        }
        
        // If user is logged in, you could also check Firestore here
        // For now, we'll use localStorage only for anonymous users
        
        return false;
    };

    // Mark as voted
    const markAsVoted = () => {
        const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '{}');
        votedPolls[pollId] = {
            votedAt: new Date().toISOString(),
            pollId: pollId,
            userIp: 'anonymous' // You can't get IP client-side, this is just a placeholder
        };
        localStorage.setItem('votedPolls', JSON.stringify(votedPolls));
    };

    // Setup real-time listener for poll updates
    useEffect(() => {
        if (!pollId) {
            setError('No poll ID provided');
            setLoading(false);
            return;
        }

        // Check if already voted
        const voted = checkVoteStatus();
        if (voted) {
            setHasVoted(true);
        }

        // Set up real-time listener
        const pollRef = doc(db, 'polls', pollId);
        
        const unsubscribe = onSnapshot(
            pollRef,
            (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const pollData = docSnapshot.data();
                    setPoll({
                        id: docSnapshot.id,
                        ...pollData
                    });
                    setLoading(false);
                } else {
                    setError('Poll not found');
                    setLoading(false);
                }
            },
            (error) => {
                console.error('Error fetching poll:', error);
                setError('Failed to load poll data');
                setLoading(false);
            }
        );

        // Cleanup subscription
        return () => unsubscribe();
    }, [pollId]);

    // Handle vote submission
    const handleVote = async () => {
        if (!selectedOption || !poll) {
            setError('Please select an option to vote');
            return;
        }

        if (hasVoted) {
            setError('You have already voted on this poll');
            return;
        }

        try {
            setError('');
            const pollRef = doc(db, 'polls', pollId);
            
            // Update the vote count for the selected option
            await updateDoc(pollRef, {
                [`options.${selectedOption}`]: increment(1),
                totalVotes: increment(1)
            });

            // Mark as voted
            markAsVoted();
            
            // Update local state
            setHasVoted(true);
            setVoteSubmitted(true);
            
            // Show success message
            setTimeout(() => {
                setVoteSubmitted(false);
            }, 3000);

        } catch (err) {
            console.error('Error voting:', err);
            setError('Failed to submit vote. Please try again.');
        }
    };

    // Copy poll link to clipboard
    const copyPollLink = () => {
        const pollUrl = `${window.location.origin}/poll/${pollId}`;
        navigator.clipboard.writeText(pollUrl)
            .then(() => {
                setCopySuccess('Link copied to clipboard!');
                setTimeout(() => setCopySuccess(''), 3000);
            })
            .catch(err => {
                console.error('Failed to copy:', err);
                setCopySuccess('Failed to copy link');
            });
    };

    // Calculate percentage for each option
    const calculatePercentage = (votes, totalVotes) => {
        if (!totalVotes || totalVotes === 0) return 0;
        return Math.round((votes / totalVotes) * 100);
    };

    // Format date
    const formatDate = (timestamp) => {
        if (!timestamp || !timestamp.toDate) return "N/A";
        const date = timestamp.toDate();
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Loading state
    if (loading) {
        return (
            <div className="poll-view-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading poll...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error && !poll) {
        return (
            <div className="poll-view-container">
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={() => navigate('/dashboard')} className="back-btn">
                        ← Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // Main render
    return (
        <div className="poll-view-container">
            {/* Copy success message */}
            {copySuccess && (
                <div className="copy-success-message">
                    ✓ {copySuccess}
                </div>
            )}

            {/* Error message */}
            {error && !voteSubmitted && (
                <div className="error-message-poll">
                    ⚠️ {error}
                </div>
            )}

            {/* Vote submitted success */}
            {voteSubmitted && (
                <div className="success-message">
                    ✓ Your vote has been submitted successfully!
                </div>
            )}

            {/* Share Poll Card */}
            <div className="share-poll-card">
                <h2 className="share-title">Share this Poll</h2>
                <div className="share-actions">
                    <button 
                        onClick={copyPollLink}
                        className="share-btn"
                    >
                        📋 Copy Poll Link
                    </button>
                    <button 
                        onClick={() => navigate('/create-poll')}
                        className="create-new-btn"
                    >
                        🆕 Create Your Own Poll
                    </button>
                </div>
            </div>

            {/* Poll Card */}
            <div className="poll-card">
                {/* Poll Header */}
                <div className="poll-header">
                    <h1 className="poll-question">{poll?.question}</h1>
                    <div className="poll-meta">
                        <span className="creator-info">
                            Created by: <strong>{poll?.creatorEmail}</strong>
                        </span>
                        <span className="date-info">
                            {formatDate(poll?.createdAt)}
                        </span>
                    </div>
                </div>

                {/* Total Votes Badge */}
                <div className="total-votes-display">
                    <div className="total-votes-badge">
                        <span className="votes-count">{poll?.totalVotes || 0}</span>
                        <span className="votes-label">Total Votes</span>
                    </div>
                </div>

                {/* Voting or Results Section */}
                {hasVoted ? (
                    <div className="results-section">
                        <h3 className="results-title">RESULTS</h3>
                        <p className="results-subtitle">Current Results:</p>
                        
                        {Object.entries(poll?.options || {}).map(([optionText, voteCount]) => {
                            const percentage = calculatePercentage(voteCount, poll?.totalVotes || 0);
                            
                            return (
                                <div key={optionText} className="result-item">
                                    <div className="result-header">
                                        <span className="option-text">{optionText}</span>
                                        <span className="vote-count">
                                            {voteCount} votes ({percentage}%)
                                        </span>
                                    </div>
                                    <div className="progress-bar">
                                        <div 
                                            className="progress-fill"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                        
                        <div className="already-voted-message">
                            <p>✓ You have already voted on this poll</p>
                            <p className="voting-note">
                                <small>Note: Each person can only vote once per poll.</small>
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="vote-section">
                        <h3 className="vote-title">Select your answer:</h3>
                        
                        <div className="vote-options">
                            {Object.keys(poll?.options || {}).map((option) => (
                                <div 
                                    key={option} 
                                    className={`vote-option ${selectedOption === option ? 'selected' : ''}`}
                                    onClick={() => setSelectedOption(option)}
                                >
                                    <div className="option-radio">
                                        <input
                                            type="radio"
                                            id={option}
                                            name="pollOption"
                                            value={option}
                                            checked={selectedOption === option}
                                            onChange={() => setSelectedOption(option)}
                                        />
                                    </div>
                                    <label htmlFor={option} className="option-label">
                                        {option}
                                    </label>
                                </div>
                            ))}
                        </div>

                        <div className="vote-instructions">
                            <p className="warning-text">
                                ⚠️ You can only vote once. Your vote cannot be changed later.
                            </p>
                        </div>

                        <button 
                            onClick={handleVote} 
                            disabled={!selectedOption}
                            className="vote-button"
                        >
                            Submit Vote
                        </button>
                    </div>
                )}

                {/* Poll Actions */}
                <div className="poll-footer-actions">
                    {!user && !hasVoted && (
                        <div className="auth-promo">
                            <p>
                                Want to create your own polls? 
                                <button 
                                    onClick={() => navigate('/signup')}
                                    className="signup-link-btn"
                                >
                                    Sign up for free!
                                </button>
                            </p>
                        </div>
                    )}
                    
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="action-btn back-to-dashboard"
                    >
                        ← Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PollView;