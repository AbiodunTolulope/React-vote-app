import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUserPolls } from "../hooks/useUserPolls";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import "../styles/Dashboard.css";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { polls, loading, error, deletePoll } = useUserPolls(user);

  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");

  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return "N/A";
    return timestamp.toDate().toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const copyLink = (id) => {
    const url = `${window.location.origin}/poll/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess("Link copied!");
      setTimeout(() => setCopySuccess(""), 2000);
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deletePoll(deleteId);
      setDeleteId(null);
    } catch (e) {
      alert("Failed to delete poll");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-sm" style={{ width: '2rem', height: '2rem', border: '3px solid #ccc', borderTopColor: 'var(--primary-600)' }}></div>
      </div>
    );
  }

  // Calculate stats
  const totalPolls = polls.length;
  const totalVotes = polls.reduce((acc, curr) => acc + (curr.totalVotes || 0), 0);
  const avgVotes = totalPolls > 0 ? Math.round(totalVotes / totalPolls) : 0;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.email?.split('@')[0]}</p>
        </div>
        <Button onClick={() => navigate('/create-poll')} size="lg">
          + Create New Poll
        </Button>
      </div>

      {error && (
        <div style={{ color: 'var(--error)', marginBottom: '1rem', background: '#fee2e2', padding: '1rem', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="stats-overview">
        <div className="stat-card">
          <span className="stat-label">Total Polls</span>
          <span className="stat-number">{totalPolls}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Votes</span>
          <span className="stat-number">{totalVotes}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg. Engagement</span>
          <span className="stat-number">{avgVotes}</span>
        </div>
      </div>

      {/* Polls Grid */}
      <h2 className="section-title">Your Polls</h2>

      {polls.length === 0 ? (
        <div className="no-polls-message">
          <p style={{ marginBottom: '1rem' }}>You haven't created any polls yet.</p>
          <Button variant="outline" onClick={() => navigate('/create-poll')}>Create your first poll</Button>
        </div>
      ) : (
        <div className="polls-grid">
          {polls.map(poll => (
            <Card key={poll.id} className="poll-card-wrapper card-hover">
              <div className="poll-card-header">
                <h3 className="poll-question">{poll.question}</h3>
                <span className="poll-date">{formatDate(poll.createdAt)}</span>
              </div>

              <div className="poll-stats-preview">
                <div className="poll-total-votes">
                  {poll.totalVotes} votes
                </div>
              </div>

              <div className="poll-actions-footer">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyLink(poll.id)}
                >
                  {copySuccess ? "Copied!" : "Share"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/poll/${poll.id}`)}
                >
                  View
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500"
                  style={{ color: 'var(--error)' }}
                  onClick={() => setDeleteId(poll.id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="delete-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="delete-modal-content" onClick={e => e.stopPropagation()}>
            <h3>Delete Poll?</h3>
            <p style={{ color: 'var(--neutral-500)', margin: '1rem 0' }}>
              Are you sure you want to delete this poll? This action cannot be undone.
            </p>
            <div className="delete-modal-actions">
              <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                isLoading={isDeleting}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;