'use client';

import { useState } from 'react';
import { apiFetch } from '../lib/clientApi';

const DEFAULT_SUGGESTIONS = [
  'Who is free on Friday evening?',
  'Reduce overtime this week',
  'How fair is the schedule?',
  'What is the biggest staffing gap?'
];

export default function AiAssistantCard({ onSubmitted }) {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState(
    'Ask me about staffing, fairness, coverage, or overtime.'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function sendPrompt(value) {
    const finalPrompt = (value || prompt).trim();
    if (!finalPrompt || loading) return;

    setLoading(true);
    setError('');

    try {
      const data = await apiFetch('/api/ai/suggestions', {
        method: 'POST',
        body: JSON.stringify({ prompt: finalPrompt })
      });

      setResponse(data?.response || 'No reply returned.');
      setPrompt('');
      onSubmitted?.();
    } catch (err) {
      console.error('AI assistant error:', err);
      setError(err.message || 'Failed to generate suggestion.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel-card">
      <div className="panel-header-simple">
        <div>
          <h3>AI Assistant</h3>
          <p>Ask for schedule improvements or staffing insights</p>
        </div>
      </div>

      <div className="chat-preview">
        <div className="chat-bubble">
          {loading ? 'Generating reply...' : response}
        </div>
      </div>

      {error ? (
        <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>
      ) : null}

      <div className="assistant-input-row">
        <input
          className="search-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type manager instruction..."
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === 'Enter') sendPrompt();
          }}
        />
        <button
          className="primary-btn"
          onClick={() => sendPrompt()}
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>

      <div className="suggestion-list">
        {DEFAULT_SUGGESTIONS.map((item, index) => (
          <button
            key={`${item}-${index}`}
            className="tag-btn"
            onClick={() => sendPrompt(item)}
            disabled={loading}
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  );
}