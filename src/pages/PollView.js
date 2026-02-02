import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, updateDoc, increment, onSnapshot } from 'firebase/firestore';

import Card from '../components/common/Card';
import Button from '../components/common/Button';
import "../styles/PollView.css";

function PollView() {
    const { pollId } = useParams();
    const navigate = useNavigate();


    const [poll, setPoll] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedOption, setSelectedOption] = useState('');
    const [hasVoted, setHasVoted] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');



    const markAsVoted = () => {
        const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '{}');
        votedPolls[pollId] = { votedAt: new Date().toISOString() };
        localStorage.setItem('votedPolls', JSON.stringify(votedPolls));
    };

    useEffect(() => {
        if (!pollId) return;

        const checkVoteStatus = () => {
            const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '{}');
            return !!votedPolls[pollId];
        };

        if (checkVoteStatus()) setHasVoted(true);

        const unsubscribe = onSnapshot(doc(db, 'polls', pollId),
            (docSnap) => {
                if (docSnap.exists()) {
                    setPoll({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setError('Poll not found');
                }
                setLoading(false);
            },
            (err) => {
                console.error(err);
                setError('Failed to load poll');
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, [pollId]);

    const handleVote = async () => {
        if (!selectedOption || hasVoted) return;

        try {
            const pollRef = doc(db, 'polls', pollId);
            await updateDoc(pollRef, {
                [`options.${selectedOption}`]: increment(1),
                totalVotes: increment(1)
            });
            markAsVoted();
            setHasVoted(true);
        } catch (err) {
            console.error(err);
            alert('Vote failed. Please try again.');
        }
    };

    const calculatePercentage = (votes, total) => {
        if (!total) return 0;
        return Math.round((votes / total) * 100);
    };

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            setCopySuccess('Link copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        });
    };

    if (loading) return <div className="text-center p-8">Loading...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    // Determine winner for highlighting
    let maxVotes = -1;
    const options = poll?.options || {};
    Object.values(options).forEach(v => {
        if (v > maxVotes) maxVotes = v;
    });

    return (
        <div className="poll-view-container">
            {/* Share Header */}
            <Card className="share-card">
                <span style={{ fontWeight: 500, color: 'var(--primary-700)' }}>
                    Share this poll with others
                </span>
                <Button size="sm" variant="secondary" onClick={copyLink}>
                    {copySuccess || "Copy Link"}
                </Button>
            </Card>

            <Card>
                <div className="poll-header">
                    <h1 className="poll-question-display">{poll.question}</h1>
                    <div className="poll-meta">
                        Created by {poll.creatorEmail?.split('@')[0]} • {new Date(poll.createdAt?.toDate()).toLocaleDateString()}
                    </div>
                </div>

                {hasVoted ? (
                    <div className="results-container">
                        {Object.entries(options).map(([opt, votes]) => {
                            const pct = calculatePercentage(votes, poll.totalVotes);
                            const isWinner = votes === maxVotes && votes > 0;

                            return (
                                <div key={opt} className={`result-item ${isWinner ? 'winner-highlight' : ''}`}>
                                    <div className="result-header">
                                        <span className="option-text">{opt} {isWinner && '🏆'}</span>
                                        <span>{pct}% ({votes})</span>
                                    </div>
                                    <div className="progress-track">
                                        <div className="progress-fill" style={{ width: `${pct}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                        <div className="total-votes-label">
                            Total Votes: {poll.totalVotes}
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <Button variant="outline" onClick={() => navigate('/dashboard')}>
                                Create Your Own Poll
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="voting-section">
                        {Object.keys(options).map(key => (
                            <div
                                key={key}
                                className={`vote-option-card ${selectedOption === key ? 'selected' : ''}`}
                                onClick={() => setSelectedOption(key)}
                            >
                                <div className="option-radio"></div>
                                <span className="option-text-label">{key}</span>
                            </div>
                        ))}

                        <div className="vote-submit-actions">
                            <Button
                                onClick={handleVote}
                                disabled={!selectedOption}
                                size="lg"
                                fullWidth
                            >
                                Submit Vote
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}

export default PollView;