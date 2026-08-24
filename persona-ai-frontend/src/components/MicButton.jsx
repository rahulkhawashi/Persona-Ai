import React, { useState, useEffect } from 'react';

export default function MicButton({ onTranscript }) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => setIsListening(true);
      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsListening(false);
      };
      rec.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
      rec.onend = () => setIsListening(false);
      
      setRecognition(rec);
    } else {
      console.warn("Speech Recognition API not supported in this browser.");
    }
  }, [onTranscript]);

  const toggleListen = () => {
    if (!recognition) return alert("Voice input not supported in this browser.");
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  return (
    <button 
      onClick={toggleListen}
      type="button"
      style={{
        padding: '0 16px',
        background: isListening ? '#ef4444' : 'var(--primary-color)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: 'none',
        color: 'white',
        fontWeight: 'bold'
      }}
      title={isListening ? "Listening..." : "Click to speak"}
    >
      {isListening ? "🎙️ Recording" : "🎙️"}
    </button>
  );
}
