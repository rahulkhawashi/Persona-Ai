import React, { useState, useEffect, useRef } from 'react';
import MicButton from './MicButton';

export default function ChatBox({ messages, onSendMessage }) {
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleVoiceInput = (text) => {
    onSendMessage(text);
  };

  return (
    <div className="glass-panel" style={{ 
      display: 'flex', flexDirection: 'column', height: '400px', width: '350px', 
      position: 'absolute', right: '40px', bottom: '40px', padding: '20px', zIndex: 10 
    }}>
      <h3 style={{ marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
        Chat with PersonaAI
      </h3>
      
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px', paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ 
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            background: msg.role === 'user' ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
            padding: '10px 14px',
            borderRadius: '12px',
            maxWidth: '85%',
            wordWrap: 'break-word',
            fontSize: '14px',
            lineHeight: '1.4'
          }}>
            {msg.message}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
        <input 
          type="text" 
          value={input} 
          onChange={e => setInput(e.target.value)}
          placeholder="Type or speak..." 
          style={{ marginBottom: 0, flex: 1 }}
        />
        <MicButton onTranscript={handleVoiceInput} />
        <button type="submit" style={{ padding: '0 16px' }}>Send</button>
      </form>
    </div>
  );
}
