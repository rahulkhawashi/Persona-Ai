import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AvatarScene from '../components/AvatarScene';
import WellnessTrendChart from '../components/WellnessTrendChart';
import client from '../api/client';
import './MentalHealth.css';

const TOP_COUNTRIES = [
  'India', 'USA', 'Canada', 'Australia', 'UK',
  'Germany', 'Mexico', 'Turkey', 'France', 'Other'
];

const PLATFORMS = [
  'Facebook', 'Instagram', 'Snapchat', 'Twitter', 'YouTube',
  'TikTok', 'LinkedIn', 'LINE', 'KakaoTalk', 'VKontakte', 'WhatsApp', 'WeChat'
];

const PURPOSES = ['Networking', 'Education', 'Entertainment', 'News'];
const ACADEMIC_LEVELS = ['High School', 'Undergraduate', 'Graduate'];
const STRESS_LEVELS = ['Low', 'Medium', 'High', 'Very High'];

export default function Assistant() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('persona_user') || 'rahul';

  // Assistant & 3D Core state: 'idle' | 'listening' | 'talking'
  const [coreState, setCoreState] = useState('idle');
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [isMicActive, setIsMicActive] = useState(false);

  // Wellness Side Window Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [wellnessData, setWellnessData] = useState({
    age: 21,
    gender: 'Male',
    country: 'India',
    academic_level: 'Undergraduate',
    most_used_platform: 'Instagram',
    purpose_of_use: 'Entertainment',
    avg_daily_usage_hours: 4.5,
    daily_unlocks: 60,
    study_hours: 4.0,
    physical_activity_hours: 1.0,
    sleep_hours_per_night: 7.0,
    stress_level: 'Medium'
  });
  const [wellnessScore, setWellnessScore] = useState(null);
  const [wellnessLoading, setWellnessLoading] = useState(false);
  const [wellnessError, setWellnessError] = useState('');
  const [history, setHistory] = useState([]);

  const wsRef = useRef(null);
  const audioRef = useRef(null);
  const chatLogRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auth guard
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Connect to WebSocket for real-time local Ollama LLM chat & TTS
  useEffect(() => {
    if (!token) return;

    const ws = new WebSocket(`ws://localhost:8000/chat/ws?token=${token}`);

    ws.onopen = () => {
      console.log('[PersonaAI] Connected to Ollama WebSocket');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) {
          console.error(data.error);
          return;
        }

        setMessages((prev) => [...prev, { role: data.role, message: data.message }]);
        setCoreState('talking');

        if (data.audio) {
          if (audioRef.current) {
            audioRef.current.pause();
          }
          const audio = new Audio('data:audio/wav;base64,' + data.audio);
          audioRef.current = audio;
          audio.play().catch((e) => console.error('Audio playback error:', e));

          audio.onended = () => {
            setCoreState('idle');
            audioRef.current = null;
          };
        } else {
          setTimeout(() => {
            setCoreState('idle');
          }, Math.min(Math.max(data.message.length * 40, 2000), 6000));
        }
      } catch (err) {
        console.error(err);
      }
    };

    ws.onclose = () => {
      console.log('[PersonaAI] WebSocket Disconnected');
    };

    wsRef.current = ws;

    return () => {
      ws.close();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [token]);

  // Auto-scroll chat log
  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [messages]);

  // Load history from backend
  const fetchHistory = () => {
    if (!token) return;
    client.get('/mental_health/history')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setHistory(res.data);
          const latest = res.data[res.data.length - 1];
          if (latest && latest.predicted_score) {
            setWellnessScore(Number(latest.predicted_score));
          }
        }
      })
      .catch((err) => console.error('History fetch error:', err));
  };

  useEffect(() => {
    fetchHistory();
  }, [token]);

  // Voice recognition (Web Speech API)
  const toggleMic = () => {
    if (isMicActive) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsMicActive(false);
      setCoreState('idle');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsMicActive(true);
      setCoreState('listening');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript.trim()) {
        handleSendMessage(transcript);
      }
    };

    recognition.onerror = (e) => {
      console.error('Speech recognition error', e);
      setIsMicActive(false);
      setCoreState('idle');
    };

    recognition.onend = () => {
      setIsMicActive(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSendMessage = (text) => {
    const query = text || inputVal;
    if (!query.trim()) return;

    if (query.trim().toLowerCase() === 'stop') {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setCoreState('idle');
      setMessages((prev) => [
        ...prev,
        { role: 'user', message: query },
        { role: 'assistant', message: '[Voice playback stopped]' }
      ]);
      setInputVal('');
      return;
    }

    setMessages((prev) => [...prev, { role: 'user', message: query }]);
    setInputVal('');
    setCoreState('talking');

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ message: query }));
    }
  };

  const handleWellnessChange = (e) => {
    const { name, value } = e.target;
    setWellnessData(prev => ({
      ...prev,
      [name]: (name === 'age' || name === 'daily_unlocks' || name.includes('hours'))
        ? (value === '' ? '' : Number(value))
        : value
    }));
  };

  const handleWellnessSubmit = async (e) => {
    e.preventDefault();
    setWellnessLoading(true);
    setWellnessError('');

    try {
      const res = await client.post('/mental_health/predict', wellnessData);
      const score = res.data.predicted_mental_health_score;
      setWellnessScore(score);
      fetchHistory();
    } catch (err) {
      console.error(err);
      setWellnessError(err.response?.data?.detail?.[0]?.msg || 'Error calculating prediction score. Please check your inputs.');
    } finally {
      setWellnessLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('persona_user');
    navigate('/login');
  };

  const stateLabels = {
    idle: 'idle · waiting',
    listening: 'listening · capturing',
    talking: 'talking · responding'
  };

  const getScoreBand = (score) => {
    if (score < 4.0) {
      return {
        label: 'Signal: Strained',
        className: 'mh-band-strained',
        context: 'Your responses suggest elevated strain right now. Small shifts in sleep or screen time can go a long way.'
      };
    } else if (score < 7.0) {
      return {
        label: 'Signal: Balanced',
        className: 'mh-band-balanced',
        context: 'Your rhythm looks fairly steady, with some room to recover and reset.'
      };
    } else {
      return {
        label: 'Signal: Strong',
        className: 'mh-band-strong',
        context: 'Your habits point to a well-supported, resilient baseline. Keep it up.'
      };
    }
  };

  const band = wellnessScore !== null ? getScoreBand(wellnessScore) : null;
  const gaugeArcLength = 314;
  const clampedScore = wellnessScore !== null ? Math.min(Math.max(wellnessScore, 0), 10) : 0;
  const gaugeOffset = wellnessScore !== null ? gaugeArcLength * (1 - clampedScore / 10) : gaugeArcLength;

  const renderTicks = () => {
    const ticks = [];
    const cx = 120, cy = 140, rOuter = 100, rInner = 90;
    for (let i = 0; i <= 10; i += 2) {
      const angle = Math.PI - (i / 10) * Math.PI;
      const x1 = (cx + rOuter * Math.cos(angle)).toFixed(1);
      const y1 = (cy - rOuter * Math.sin(angle)).toFixed(1);
      const x2 = (cx + rInner * Math.cos(angle)).toFixed(1);
      const y2 = (cy - rInner * Math.sin(angle)).toFixed(1);
      ticks.push(<line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />);
    }
    return ticks;
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateRows: '64px 1fr',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      backgroundColor: 'var(--bg-dark)',
      backgroundImage: 'radial-gradient(at 0% 0%, #F5F7F6 0, transparent 50%), radial-gradient(at 100% 0%, #F7F3E9 0, transparent 50%), radial-gradient(at 50% 100%, #EBF4F1 0, transparent 60%)',
      color: 'var(--text-main)',
      position: 'relative'
    }}>
      
      {/* Ambient background glowing orbs */}
      <div className="mh-glow-orb mh-glow-orb-1" aria-hidden="true" />
      <div className="mh-glow-orb mh-glow-orb-2" aria-hidden="true" />
      <div className="mh-glow-orb mh-glow-orb-3" aria-hidden="true" />

      {/* Top Bar (Warm Frosted Glass) */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        borderBottom: '1px solid var(--border-glass)',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(16px)',
        zIndex: 20,
        boxShadow: '0 2px 10px rgba(77, 92, 86, 0.04)'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3B6B5E', boxShadow: '0 0 10px 2px rgba(59, 107, 94, 0.3)' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600, color: '#1F2925' }}>PersonaAI</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.12em', color: '#2D5248', background: 'rgba(59, 107, 94, 0.08)', padding: '2px 8px', borderRadius: '100px', textTransform: 'uppercase', fontWeight: 700 }}>3D Assistant</span>
        </div>

        {/* Nav Tabs */}
        <nav style={{ display: 'flex', gap: '8px' }}>
          <button 
            type="button" 
            style={{
              background: '#FFFFFF', color: '#1F2925', fontSize: '0.86rem', fontWeight: 600,
              padding: '8px 18px', borderRadius: '100px', border: '1px solid rgba(59, 107, 94, 0.25)',
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(77, 92, 86, 0.06)'
            }}
          >
            Assistant
          </button>
          <button 
            type="button" 
            className="wellness-signal-btn"
            onClick={() => setDrawerOpen(true)}
            title="Open ML Behavioral Wellness Intelligence Drawer"
          >
            <div className="wellness-icon-badge">
              <div className="wellness-radar-ring" />
              <svg className="wellness-brain-svg" viewBox="0 0 24 24">
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z"/>
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z"/>
              </svg>
            </div>
            <span style={{ fontWeight: 700, letterSpacing: '0.01em', color: '#1F2925' }}>Wellness Signal</span>
            <span className="wellness-live-dot" />
            {wellnessScore !== null && (
              <span className="wellness-score-pill">
                {wellnessScore.toFixed(1)}
              </span>
            )}
          </button>
        </nav>

        {/* User Pill & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#4D5C56', fontFamily: 'var(--font-mono)' }}>
            <span style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #3B6B5E, #C5A880)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#FFFFFF', fontWeight: 700, fontSize: '0.75rem', fontFamily: 'var(--font-display)',
              boxShadow: '0 2px 6px rgba(59, 107, 94, 0.2)'
            }}>
              {user.charAt(0).toUpperCase()}
            </span>
            <span style={{ fontWeight: 600, color: '#1F2925' }}>{user}</span>
          </div>
          <button 
            type="button" 
            onClick={handleLogout}
            style={{
              background: 'rgba(195, 91, 72, 0.08)', color: '#C35B48', fontSize: '0.8rem', fontWeight: 600,
              padding: '6px 12px', borderRadius: '100px', border: '1px solid rgba(195, 91, 72, 0.2)', cursor: 'pointer'
            }}
          >
            Log out
          </button>
        </div>
      </header>

      {/* Main Workspace (3D Stage + Right Chat Transcript) */}
      <main style={{ display: 'grid', gridTemplateColumns: '1fr 380px', height: '100%', minHeight: 0, position: 'relative', zIndex: 2 }}>
        
        {/* 3D Core Stage */}
        <section style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          
          {/* Test State Buttons */}
          <div style={{ position: 'absolute', top: '18px', left: '50%', transform: 'translateX(-50%)', zIndex: 2, display: 'flex', gap: '6px' }}>
            {['idle', 'listening', 'talking'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setCoreState(st)}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase',
                  background: coreState === st ? '#3B6B5E' : 'rgba(255, 255, 255, 0.8)',
                  border: `1px solid ${coreState === st ? '#3B6B5E' : 'rgba(180, 170, 150, 0.3)'}`,
                  color: coreState === st ? '#FFFFFF' : '#4D5C56',
                  fontWeight: 600,
                  padding: '5px 14px', borderRadius: '999px', cursor: 'pointer',
                  boxShadow: coreState === st ? '0 2px 8px rgba(59, 107, 94, 0.25)' : '0 1px 4px rgba(77, 92, 86, 0.04)',
                  transition: 'all 0.2s ease'
                }}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Floating HUD Telemetry Card (Top Left Background) */}
          <div style={{
            position: 'absolute', top: '24px', left: '24px', zIndex: 3,
            padding: '10px 14px', borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(59, 107, 94, 0.2)',
            boxShadow: '0 4px 14px rgba(77, 92, 86, 0.05)',
            display: 'flex', flexDirection: 'column', gap: '4px',
            pointerEvents: 'none'
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', fontWeight: 700, color: '#3B6B5E', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34D399', boxShadow: '0 0 6px #34D399' }} />
              NEURAL TELEMETRY
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#1F2925', fontWeight: 600 }}>
              Model: Ollama Local • 60 FPS
            </div>
          </div>

          {/* Floating Quick Action Card (Top Right Background) */}
          <div style={{
            position: 'absolute', top: '24px', right: '24px', zIndex: 3,
            padding: '8px 12px', borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(180, 170, 150, 0.3)',
            boxShadow: '0 4px 14px rgba(77, 92, 86, 0.05)',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#4D5C56' }}>Mode:</span>
            <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#3B6B5E', background: 'rgba(59,107,94,0.1)', padding: '2px 8px', borderRadius: '100px' }}>3D Interactive</span>
          </div>

          {/* Three.js Holographic Core Canvas */}
          <AvatarScene state={coreState} />

          {/* State Indicator Pill */}
          <div style={{
            position: 'relative', zIndex: 2, marginTop: 'auto', marginBottom: '8px',
            fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase',
            color: '#2D5248', display: 'flex', alignItems: 'center', gap: '8px',
            padding: '7px 16px', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.85)',
            border: '1px solid rgba(59, 107, 94, 0.2)', backdropFilter: 'blur(12px)',
            boxShadow: '0 2px 8px rgba(77, 92, 86, 0.06)'
          }}>
            <span style={{
              width: '7px', height: '7px', borderRadius: '50%', background: '#2E7D68',
              animation: 'dotpulse 1.6s ease-in-out infinite'
            }} />
            <span>{stateLabels[coreState] || coreState}</span>
          </div>

          {/* Floating Bottom Dock */}
          <div style={{
            position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '12px',
            width: 'min(580px, 88%)', margin: '16px 0 28px 0', padding: '8px 10px 8px 22px',
            borderRadius: '999px', background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(20px)', border: '1.5px solid rgba(180, 170, 150, 0.3)',
            boxShadow: '0 12px 35px -10px rgba(77, 92, 86, 0.15), 0 2px 6px rgba(77, 92, 86, 0.04)'
          }}>
            <input 
              type="text" 
              placeholder="Ask PersonaAI anything…" 
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: '#1F2925', fontSize: '0.96rem', fontFamily: 'var(--font-body)', fontWeight: 500
              }}
            />

            <button 
              type="button" 
              onClick={() => handleSendMessage()}
              aria-label="Send message"
              style={{
                width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
                background: 'rgba(59, 107, 94, 0.1)', border: '1px solid rgba(59, 107, 94, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px', fill: '#3B6B5E' }}>
                <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
              </svg>
            </button>

            <button 
              type="button" 
              onClick={toggleMic}
              aria-label="Toggle microphone"
              style={{
                width: '46px', height: '46px', borderRadius: '50%', flexShrink: 0,
                background: isMicActive ? 'linear-gradient(135deg, #C35B48, #A83E2D)' : 'linear-gradient(135deg, #3B6B5E, #608C80)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                boxShadow: isMicActive ? '0 0 0 8px rgba(195, 91, 72, 0.25)' : '0 4px 14px rgba(59, 107, 94, 0.3)',
                border: 'none', transition: 'all 0.2s ease'
              }}
            >
              <svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px', fill: '#FFFFFF' }}>
                <path d="M12 14a3 3 0 003-3V6a3 3 0 00-6 0v5a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 006 6.92V21h2v-3.08A7 7 0 0019 11h-2z"/>
              </svg>
            </button>
          </div>

        </section>

        {/* Right Chat Transcript Panel (Warm Light Frosted Glass) */}
        <aside style={{
          borderLeft: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', minHeight: 0,
          background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(20px)',
          boxShadow: '-4px 0 20px rgba(77, 92, 86, 0.04)'
        }}>
          {/* Transcript Head */}
          <div style={{ padding: '18px 22px 14px 22px', borderBottom: '1px solid var(--border-glass)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#3B6B5E', fontWeight: 700, marginBottom: '2px' }}>
              Transcript
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 600, color: '#1F2925' }}>
              Conversation
            </div>
          </div>

          {/* Chat Log */}
          <div ref={chatLogRef} style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {messages.length === 0 ? (
              <div style={{ color: '#8FA099', fontSize: '0.88rem', textAlign: 'center', marginTop: '50px', padding: '0 20px', lineHeight: 1.6, fontStyle: 'italic' }}>
                Nothing here yet. Say hello, or ask PersonaAI to open an app or assess your wellness.
              </div>
            ) : (
              messages.map((msg, i) => (
                <div 
                  key={i} 
                  style={{
                    maxWidth: '88%', padding: '12px 16px', borderRadius: '16px', fontSize: '0.9rem', lineHeight: 1.5,
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    background: msg.role === 'user' ? 'linear-gradient(135deg, rgba(59,107,94,0.12), rgba(197,168,128,0.12))' : '#FFFFFF',
                    border: msg.role === 'user' ? '1px solid rgba(59, 107, 94, 0.25)' : '1px solid rgba(180, 170, 150, 0.3)',
                    borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                    borderBottomLeftRadius: msg.role === 'user' ? '16px' : '4px',
                    color: msg.role === 'user' ? '#1F2925' : '#334155',
                    boxShadow: '0 2px 8px rgba(77, 92, 86, 0.04)'
                  }}
                >
                  <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.64rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px', color: msg.role === 'user' ? '#3B6B5E' : '#8FA099', fontWeight: 700 }}>
                    {msg.role === 'user' ? 'You' : 'PersonaAI'}
                  </span>
                  {msg.message}
                </div>
              ))
            )}
          </div>
        </aside>

      </main>

      {/* Wellness Side Window Backdrop */}
      <div 
        onClick={() => setDrawerOpen(false)}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(31, 41, 37, 0.45)', zIndex: 30,
          opacity: drawerOpen ? 1 : 0, pointerEvents: drawerOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s var(--ease)', backdropFilter: 'blur(8px)'
        }}
      />

      {/* Expansive Full Side Window for Mental Health Signal */}
      <aside style={{
        position: 'fixed', top: 0, right: 0, height: '100vh',
        width: 'min(1100px, 94vw)',
        background: '#FDFBF7',
        borderLeft: '1px solid rgba(180, 170, 150, 0.25)',
        zIndex: 31,
        transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.38s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-30px 0 70px -15px rgba(77, 92, 86, 0.25)',
        overflowY: 'auto'
      }}>
        
        {/* Drawer Close Bar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 28px', background: 'rgba(253, 251, 247, 0.92)',
          backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(180, 170, 150, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B6B5E' }}></span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#2D5248' }}>
              ML Behavioral Intelligence Signal
            </span>
          </div>
          <button 
            type="button" 
            onClick={() => setDrawerOpen(false)}
            style={{
              background: 'rgba(59, 107, 94, 0.08)', border: '1px solid rgba(59, 107, 94, 0.2)',
              color: '#1F2925', fontSize: '1.1rem', fontWeight: 600,
              width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease'
            }}
          >
            ✕
          </button>
        </div>

        {/* Drawer Inner Content - Light Sage Glassmorphism Layout */}
        <div className="mental-health-root" style={{ padding: '24px 32px 48px', minHeight: 'auto' }}>
          
          <header className="mh-site-header" style={{ padding: '20px 0 28px' }}>
            <span className="mh-eyebrow">Student Wellness Analytics</span>
            <h1 className="mh-title" style={{ fontSize: 'clamp(2rem, 3.8vw, 2.8rem)' }}>Persona — Mental Health <em>Signal</em></h1>
            <p className="mh-subtitle" style={{ fontSize: '14px' }}>
              A quick read on how habits, screen time, and stress are trending — modeled from your daily rhythm, not a diagnosis.
            </p>
          </header>

          <main className="mh-layout" style={{ padding: 0, gap: '24px' }}>
            
            {/* Form Panel (12 Parameters) */}
            <section className="mh-panel mh-form-panel" style={{ padding: '24px 28px' }}>
              <form onSubmit={handleWellnessSubmit} noValidate>

                {/* 01 Profile */}
                <fieldset className="mh-group">
                  <legend className="mh-legend">
                    <span className="mh-legend-index">01</span> Profile
                  </legend>
                  <div className="mh-grid mh-grid-3">
                    <div className="mh-field">
                      <label htmlFor="w-age">Age</label>
                      <div className="mh-input-wrapper">
                        <svg className="mh-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        <input type="number" id="w-age" name="age" min="10" max="100" step="1" required placeholder="e.g. 21" value={wellnessData.age} onChange={handleWellnessChange} />
                      </div>
                      <span className="mh-hint">10–100</span>
                    </div>

                    <div className="mh-field">
                      <label htmlFor="w-gender">Gender</label>
                      <div className="mh-input-wrapper">
                        <svg className="mh-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        <select id="w-gender" name="gender" required value={wellnessData.gender} onChange={handleWellnessChange}>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                    </div>

                    <div className="mh-field">
                      <label htmlFor="w-country">Country</label>
                      <div className="mh-input-wrapper">
                        <svg className="mh-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                        <select id="w-country" name="country" required value={wellnessData.country} onChange={handleWellnessChange}>
                          {TOP_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <span className="mh-hint">Not listed? Select Other.</span>
                    </div>
                  </div>
                </fieldset>

                {/* 02 Academic & Digital Habits */}
                <fieldset className="mh-group">
                  <legend className="mh-legend">
                    <span className="mh-legend-index">02</span> Academic &amp; Digital Habits
                  </legend>
                  <div className="mh-grid mh-grid-2">
                    <div className="mh-field">
                      <label htmlFor="w-academic">Academic level</label>
                      <div className="mh-input-wrapper">
                        <svg className="mh-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path></svg>
                        <select id="w-academic" name="academic_level" required value={wellnessData.academic_level} onChange={handleWellnessChange}>
                          {ACADEMIC_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="mh-field">
                      <label htmlFor="w-platform">Most-used platform</label>
                      <div className="mh-input-wrapper">
                        <svg className="mh-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                        <select id="w-platform" name="most_used_platform" required value={wellnessData.most_used_platform} onChange={handleWellnessChange}>
                          {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="mh-field">
                      <label htmlFor="w-purpose">Primary purpose</label>
                      <div className="mh-input-wrapper">
                        <svg className="mh-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
                        <select id="w-purpose" name="purpose_of_use" required value={wellnessData.purpose_of_use} onChange={handleWellnessChange}>
                          {PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="mh-field">
                      <label htmlFor="w-usage">Avg. daily screen time</label>
                      <div className="mh-input-wrapper mh-unit-wrapper">
                        <svg className="mh-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        <input type="number" id="w-usage" name="avg_daily_usage_hours" min="0" max="24" step="0.1" required placeholder="0.0" value={wellnessData.avg_daily_usage_hours} onChange={handleWellnessChange} />
                        <span className="mh-unit">hrs</span>
                      </div>
                    </div>

                    <div className="mh-field mh-field-span">
                      <label htmlFor="w-unlocks">Daily phone unlocks</label>
                      <div className="mh-input-wrapper">
                        <svg className="mh-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
                        <input type="number" id="w-unlocks" name="daily_unlocks" min="0" step="1" required placeholder="e.g. 60" value={wellnessData.daily_unlocks} onChange={handleWellnessChange} />
                      </div>
                    </div>
                  </div>
                </fieldset>

                {/* 03 Lifestyle & Stress */}
                <fieldset className="mh-group">
                  <legend className="mh-legend">
                    <span className="mh-legend-index">03</span> Lifestyle &amp; Stress
                  </legend>
                  <div className="mh-grid mh-grid-3">
                    <div className="mh-field">
                      <label htmlFor="w-study">Study hours / day</label>
                      <div className="mh-input-wrapper mh-unit-wrapper">
                        <svg className="mh-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                        <input type="number" id="w-study" name="study_hours" min="0" max="24" step="0.1" required placeholder="0.0" value={wellnessData.study_hours} onChange={handleWellnessChange} />
                        <span className="mh-unit">hrs</span>
                      </div>
                    </div>

                    <div className="mh-field">
                      <label htmlFor="w-activity">Activity / day</label>
                      <div className="mh-input-wrapper mh-unit-wrapper">
                        <svg className="mh-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                        <input type="number" id="w-activity" name="physical_activity_hours" min="0" max="24" step="0.1" required placeholder="0.0" value={wellnessData.physical_activity_hours} onChange={handleWellnessChange} />
                        <span className="mh-unit">hrs</span>
                      </div>
                    </div>

                    <div className="mh-field">
                      <label htmlFor="w-sleep">Sleep / night</label>
                      <div className="mh-input-wrapper mh-unit-wrapper">
                        <svg className="mh-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                        <input type="number" id="w-sleep" name="sleep_hours_per_night" min="0" max="24" step="0.1" required placeholder="0.0" value={wellnessData.sleep_hours_per_night} onChange={handleWellnessChange} />
                        <span className="mh-unit">hrs</span>
                      </div>
                    </div>

                    <div className="mh-field mh-field-span">
                      <label>Perceived stress level</label>
                      <div className="mh-segmented">
                        {STRESS_LEVELS.map(lvl => (
                          <button
                            type="button"
                            key={lvl}
                            className={`mh-seg-btn ${wellnessData.stress_level === lvl ? `active-${lvl.replace(' ', '-')}` : ''}`}
                            onClick={() => setWellnessData(prev => ({ ...prev, stress_level: lvl }))}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </fieldset>

                {wellnessError && (
                  <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(195, 91, 72, 0.1)', border: '1px solid rgba(195, 91, 72, 0.3)', color: '#C35B48', fontSize: '13px', marginBottom: '16px' }}>
                    {wellnessError}
                  </div>
                )}

                <div className="mh-form-footer">
                  <button type="submit" className="mh-submit-btn" disabled={wellnessLoading}>
                    {wellnessLoading ? 'Reading the signal...' : 'Read my signal'}
                  </button>
                </div>
              </form>
            </section>

            {/* Right Column: Result Gauge & History Chart */}
            <div className="mh-right-col">
              
              {/* Live Gauge Result Card */}
              <aside className="mh-panel mh-result-panel" style={{ minHeight: '400px' }} aria-live="polite">
                <div className="mh-result-inner" style={{ padding: '32px 24px' }}>
                  
                  <svg className="mh-gauge" viewBox="0 0 240 160" aria-hidden="true">
                    <defs>
                      <linearGradient id="mhGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FB7185"/>
                        <stop offset="45%" stopColor="#FBBF24"/>
                        <stop offset="100%" stopColor="#34D399"/>
                      </linearGradient>
                    </defs>
                    <path className="mh-gauge-track" d="M 30 140 A 100 100 0 0 1 210 140" />
                    <path 
                      className="mh-gauge-fill" 
                      d="M 30 140 A 100 100 0 0 1 210 140" 
                      style={{ strokeDashoffset: String(gaugeOffset) }}
                    />
                    <g className="mh-gauge-ticks">
                      {renderTicks()}
                    </g>
                    <circle className="mh-gauge-needle-hub" cx="120" cy="140" r="5" />
                  </svg>

                  {wellnessScore !== null ? (
                    <>
                      <div className="mh-score-readout">
                        <span className="mh-score-number">{wellnessScore.toFixed(2)}</span>
                        <span className="mh-score-max">/10</span>
                      </div>
                      <span className={`mh-score-band ${band.className}`}>
                        {band.label}
                      </span>
                      <p className="mh-score-context" style={{ fontSize: '13px', marginBottom: '16px' }}>
                        {band.context}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="mh-idle-label">Your score will appear here</p>
                      <p className="mh-idle-copy">
                        Fill in the form and submit to generate a predicted mental health score from 0–10.
                      </p>
                    </>
                  )}

                  <div className="mh-ai-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mh-sparkle-icon"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg>
                    <span>AI Prediction Core Active</span>
                  </div>

                </div>
              </aside>

              {/* History Graph Directly Below */}
              <section className="mh-panel mh-history-panel" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1F2925', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B6B5E' }}></span>
                  Wellness Score Trend History
                </h3>
                <div style={{ height: '180px' }}>
                  <WellnessTrendChart data={history} />
                </div>
              </section>

            </div>

          </main>

        </div>
      </aside>

    </div>
  );
}
