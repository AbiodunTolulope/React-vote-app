import React, { useState, useEffect } from "react";
import "./App.css";

const initialVotes = {
  JavaScript: 0,
  Python: 0,
  Java: 0,
};

function App() {
  // Load saved votes or use default
  const [votes, setVotes] = useState(() => {
    const saved = localStorage.getItem("votes");
    return saved ? JSON.parse(saved) : initialVotes;
  });

  // Track if user already voted
  const [hasVoted, setHasVoted] = useState(() => {
    return localStorage.getItem("hasVoted") === "true";
  });

  // Save to localStorage when votes change
  useEffect(() => {
    localStorage.setItem("votes", JSON.stringify(votes));
  }, [votes]);

  // Save hasVoted flag
  useEffect(() => {
    localStorage.setItem("hasVoted", hasVoted);
  }, [hasVoted]);

  // Voting logic
  const vote = (language) => {
    if (hasVoted) return;
    setVotes((prev) => ({
      ...prev,
      [language]: prev[language] + 1,
    }));
    setHasVoted(true);
  };

  // Reset logic
  const resetVotes = () => {
    setVotes(initialVotes);
    setHasVoted(false);
    localStorage.removeItem("hasVoted");
  };

  return (
    <div className="App">
      <h1>Vote for Your Favorite Programming Language</h1>

      <div className="buttons">
        {Object.keys(votes).map((lang) => (
          <button
            key={lang}
            onClick={() => vote(lang)}
            disabled={hasVoted}
            className="vote-btn"
          >
            {lang}
          </button>
        ))}
      </div>

      {hasVoted && <p className="info">✅ You’ve already voted!</p>}

      <h2>Results:</h2>
      <ul className="results">
        {Object.entries(votes).map(([lang, count]) => (
          <li key={lang}>
            {lang}: <strong>{count}</strong>
          </li>
        ))}
      </ul>

      <button className="reset-btn" onClick={resetVotes}>
        Reset Votes
      </button>
    </div>
  );
}

export default App;
