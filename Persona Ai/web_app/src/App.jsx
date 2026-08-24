import React, { useState, useEffect, useRef } from 'react';
import './index.css';

function App() {
  const [messages, setMessages] = useState([
    { type: 'ai', text: 'Hello! I am Persona AI. How can I help you today?' }
  ]);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [memories, setMemories] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('Checking...');
  const [isTestingApi, setIsTestingApi] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { type: 'user', text: userText }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, user_id: 1 }),
      });
      
      const data = await response.json();
      setMessages(prev => [...prev, { type: 'ai', text: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { type: 'ai', text: 'Error: Could not connect to the AI server.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMemories = async () => {
    try {
      const response = await fetch('http://localhost:8000/memories/1');
      const data = await response.json();
      setMemories(data.memories || []);
    } catch (error) {
      console.error("Failed to fetch memories", error);
    }
  };

  useEffect(() => {
    if (activeTab === 'API Config') {
      testApiConnection();
    }
  }, [activeTab]);

  const testApiConnection = async () => {
    setIsTestingApi(true);
    try {
      const response = await fetch('http://localhost:8000/test-api');
      const data = await response.json();
      setApiStatus(data.status === 'ok' ? 'Connected' : 'Error');
    } catch (error) {
      setApiStatus('Disconnected');
    } finally {
      setIsTestingApi(false);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">PERSONA AI</div>
        <nav>
          <div 
            className={`nav-item ${activeTab === 'Dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('Dashboard')}
          >
            <span className="nav-icon">📊</span> Dashboard
          </div>
          <div 
            className={`nav-item ${activeTab === 'Memories' ? 'active' : ''}`}
            onClick={() => setActiveTab('Memories')}
          >
            <span className="nav-icon">🧠</span> Memories
          </div>
          <div 
            className={`nav-item ${activeTab === 'Voice Settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('Voice Settings')}
          >
            <span className="nav-icon">🎙️</span> Voice Settings
          </div>
          <div 
            className={`nav-item ${activeTab === 'API Config' ? 'active' : ''}`}
            onClick={() => setActiveTab('API Config')}
          >
            <span className="nav-icon">🔑</span> API Config
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div className="status-indicator">
            <div className="status-dot"></div>
            Persona AI System Online
          </div>
          <div className="header-icons">
            <div className="icon-btn" title="Notifications">🔔</div>
            <div className="icon-btn" title="Settings">⚙️</div>
            <div className="user-profile">
              <div className="user-avatar">R</div>
            </div>
          </div>
          <div style={{ color: '#94a3b8', fontSize: '14px' }}>v2.5.0</div>
        </header>

        {/* Views */}
        {activeTab === 'Dashboard' && (
          <>
            <div className="chat-container">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.type}`}>
                  <div className="message-bubble">{msg.text}</div>
                </div>
              ))}
              {isLoading && (
                <div className="message ai">
                  <div className="message-bubble">Persona is thinking...</div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="input-wrapper">
              <div className="input-container">
                <input 
                  className="chat-input" 
                  placeholder="Ask me anything..." 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button 
                  className="voice-btn" 
                  onClick={() => setMessages(prev => [...prev, { type: 'ai', text: 'Voice assistant is active in the background. You can speak now!' }])}
                  title="Activate Voice Assistant"
                >
                  🎤
                </button>
                <button className="send-btn" onClick={handleSend} disabled={isLoading}>
                  {isLoading ? '...' : 'Send'}
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'Memories' && (
          <div className="memories-view">
            <h2 className="view-title">Stored Memories</h2>
            <div className="memories-list">
              {memories.length > 0 ? (
                memories.map((mem, idx) => (
                  <div key={idx} className="memory-card">
                    <span className="memory-bullet">✨</span> {mem}
                  </div>
                ))
              ) : (
                <div className="no-data">No memories found yet. Ask me to remember something!</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'Voice Settings' && (
          <div className="settings-view">
            <h2 className="view-title">Voice Configuration</h2>
            <div className="settings-form">
              <div className="setting-item">
                <label>Voice Speed</label>
                <input type="range" min="100" max="300" defaultValue="150" />
              </div>
              <div className="setting-item">
                <label>Wake Word</label>
                <input type="text" placeholder="Hey Persona" />
              </div>
              <button className="save-btn">Save Changes</button>
            </div>
          </div>
        )}

        {activeTab === 'API Config' && (
          <div className="api-view">
            <h2 className="view-title">API Status</h2>
            <div className="api-card">
              <div className="api-info">
                <strong>Gemini Pro:</strong> 
                <span className={`status-badge ${apiStatus === 'Connected' ? 'active' : 'inactive'}`}>
                  {apiStatus}
                </span>
              </div>
              <p className="api-note">The API key is loaded from your local .env file. If status is 'Error', your key might be leaked or invalid.</p>
              <div className="api-actions">
                <button 
                  className="secondary-btn" 
                  onClick={testApiConnection} 
                  disabled={isTestingApi}
                >
                  {isTestingApi ? 'Testing...' : 'Test Connection'}
                </button>
                <button className="primary-btn" onClick={() => window.open('https://aistudio.google.com/app/apikey', '_blank')}>Generate New Key</button>
              </div>
              {apiStatus === 'Error' && (
                <div className="error-box">
                  ⚠️ Your API key has been reported as leaked by Google. Please generate a new one.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
