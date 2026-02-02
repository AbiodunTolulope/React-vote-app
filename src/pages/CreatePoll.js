import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc, arrayUnion } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import "../styles/CreatePoll.css";

function CreatePoll() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([{ text: '' }, { text: '' }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isOnline = () => navigator.onLine;

  useEffect(() => {
    if (!user) {
      navigate('/login');
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) return;
    if (!question.trim()) {
      setError('A question is required.');
      return;
    }

    const cleanOptions = options.filter(opt => opt.text.trim() !== '');
    if (cleanOptions.length < 2) {
      setError('Please provide at least 2 options.');
      return;
    }

    setLoading(true);

    try {
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

      const pollRef = await addDoc(collection(db, 'polls'), pollData);

      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        createdPolls: arrayUnion(pollRef.id),
        lastUpdated: serverTimestamp()
      }, { merge: true });

      navigate('/dashboard');

    } catch (e) {
      console.error(e);
      setError('Failed to create poll. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="create-poll-wrapper">
      <div className="create-poll-header">
        <h2>Create a New Poll</h2>
        <p style={{ color: 'var(--neutral-500)' }}>Ask a question and get feedback.</p>
      </div>

      <Card>
        {!isOnline() && (
          <div className="network-warning">You are offline. Cannot create polls.</div>
        )}

        {error && (
          <div style={{ color: 'var(--error)', marginBottom: '1rem', background: '#fee2e2', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="create-poll-form">
          <Input
            label="Your Question"
            placeholder="e.g. What should we have for lunch?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            disabled={loading}
          />

          <span className="section-label">Options</span>

          <div className="options-container">
            {options.map((option, index) => (
              <div key={index} className="option-row">
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={option.text}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="mb-0" // override margin bottom
                  style={{ marginBottom: 0, flex: 1 }}
                  required
                  disabled={loading}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => handleRemoveOption(index)}
                    disabled={loading}
                    tabIndex="-1"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1rem' }}>
            <Button variant="ghost" onClick={handleAddOption} disabled={loading} size="sm">
              + Add another option
            </Button>
          </div>

          <div className="form-actions">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading} disabled={!isOnline()}>
              Create Poll
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default CreatePoll;