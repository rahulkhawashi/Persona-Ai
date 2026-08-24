import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import './MentalHealth.css';

export default function Login() {
  const [tab, setTab] = useState('signin'); // 'signin' | 'signup'
  const [signInData, setSignInData] = useState({ usernameOrEmail: '', password: '' });
  const [signUpData, setSignUpData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  // If already authenticated, go directly to assistant
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/assistant');
    }
  }, [navigate]);

  // Ambient signal canvas animation tuned with Sage & Almond Gold
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let w, h, t = 0;

    const resize = () => {
      if (!canvas.parentElement) return;
      w = canvas.width = canvas.parentElement.offsetWidth * (window.devicePixelRatio || 1);
      h = canvas.height = canvas.parentElement.offsetHeight * (window.devicePixelRatio || 1);
    };

    window.addEventListener('resize', resize);
    resize();

    const lines = [
      { color: '59,107,94', amp: 34, speed: 0.026, freq: 0.005, yFactor: 0.42, width: 2.0 },
      { color: '197,168,128', amp: 48, speed: 0.020, freq: 0.0035, yFactor: 0.58, width: 1.6 },
      { color: '46,125,104', amp: 24, speed: 0.030, freq: 0.006, yFactor: 0.70, width: 1.4 },
    ];

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const dpr = window.devicePixelRatio || 1;

      lines.forEach((line) => {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 4) {
          const y =
            h * line.yFactor +
            Math.sin(x * line.freq + t * line.speed) * line.amp * dpr +
            Math.sin(x * line.freq * 2.1 + t * line.speed * 0.7) * (line.amp * 0.35) * dpr;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(${line.color}, 0.75)`;
        ctx.lineWidth = line.width * dpr;
        ctx.shadowColor = `rgba(${line.color}, 0.4)`;
        ctx.shadowBlur = 10;
        ctx.stroke();
      });

      t += 1;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    const { usernameOrEmail, password } = signInData;

    if (!usernameOrEmail || !password) {
      setError('Please enter your username and password.');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('username', usernameOrEmail);
      params.append('password', password);

      const res = await client.post('/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('persona_user', usernameOrEmail.includes('@') ? usernameOrEmail.split('@')[0] : usernameOrEmail);
      navigate('/assistant');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Incorrect username/email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    const { username, email, password } = signUpData;

    if (!username || !email || !password) {
      setError('Fill in every field to continue.');
      return;
    }
    if (password.length < 8) {
      setError('Password needs at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await client.post('/auth/signup', { username, email, password });

      // Automatically sign in after signup
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);

      const loginRes = await client.post('/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      localStorage.setItem('token', loginRes.data.access_token);
      localStorage.setItem('persona_user', username);
      navigate('/assistant');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Could not create account. Username or email may already be taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1.15fr 1fr',
      backgroundColor: '#FDFBF7',
      backgroundImage: 'radial-gradient(at 0% 0%, #F5F7F6 0, transparent 50%), radial-gradient(at 100% 0%, #F7F3E9 0, transparent 50%), radial-gradient(at 50% 100%, #EBF4F1 0, transparent 60%)',
      color: '#1F2925',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Ambient background glowing orbs */}
      <div className="mh-glow-orb mh-glow-orb-1" aria-hidden="true" />
      <div className="mh-glow-orb mh-glow-orb-2" aria-hidden="true" />
      <div className="mh-glow-orb mh-glow-orb-3" aria-hidden="true" />

      {/* Left: Signal Hero */}
      <section style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '52px 64px',
        overflow: 'hidden',
        borderRight: '1px solid rgba(180, 170, 150, 0.22)',
        zIndex: 2
      }}>
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.85, pointerEvents: 'none' }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* PersonaAI Brand Header Pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '12px',
            background: 'rgba(255, 255, 255, 0.85)', padding: '8px 20px 8px 14px',
            borderRadius: '100px', border: '1px solid rgba(59, 107, 94, 0.2)',
            backdropFilter: 'blur(12px)', boxShadow: '0 4px 14px rgba(77, 92, 86, 0.06)'
          }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3B6B5E', boxShadow: '0 0 10px 2px rgba(59, 107, 94, 0.3)' }} />
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.35rem',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: '#1F2925'
            }}>
              PersonaAI
            </span>
          </div>

          <div style={{ maxWidth: '480px', marginTop: '36px' }}>
            <h1 style={{ fontSize: 'clamp(2.3rem, 4vw, 3.2rem)', lineHeight: 1.15, fontFamily: 'var(--font-display)', fontWeight: 500, color: '#1F2925' }}>
              The <span style={{ fontStyle: 'italic', background: 'linear-gradient(135deg, #3B6B5E 20%, #C5A880 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>signal</span><br />
              behind the silence.
            </h1>
            <p style={{ marginTop: '20px', color: '#4D5C56', fontSize: '1.02rem', lineHeight: 1.65 }}>
              A desktop presence that listens, responds, and quietly reads the patterns behind how you live, sleep, and study — so it can actually show up for you, not just answer you.
            </p>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '28px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#8FA099' }}>
          <div><b style={{ color: '#2D5248', fontWeight: 600 }}>Local LLM</b> — runs offline</div>
          <div><b style={{ color: '#2D5248', fontWeight: 600 }}>R² 0.92</b> — wellness model</div>
          <div><b style={{ color: '#2D5248', fontWeight: 600 }}>Private</b> — on this device</div>
        </div>
      </section>

      {/* Right: Auth Card */}
      <section style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '36px', position: 'relative', zIndex: 2 }}>
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '430px',
          padding: '42px 38px',
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '24px',
          border: '1px solid rgba(180, 170, 150, 0.25)',
          boxShadow: '0 20px 45px -10px rgba(77, 92, 86, 0.12), 0 2px 8px rgba(77, 92, 86, 0.04)',
          overflow: 'hidden'
        }}>
          
          {/* Top accent bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
            background: 'linear-gradient(90deg, #3B6B5E 0%, #C5A880 100%)'
          }} />

          {/* PersonaAI Brand Title inside Auth Card */}
          <div style={{ textAlign: 'center', marginBottom: '26px' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.4rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              margin: '0 0 4px 0',
              color: '#1F2925'
            }}>
              PersonaAI
            </h1>
            <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: '#3B6B5E', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
              Your 3D Assistant
            </span>
          </div>

          {/* Segmented Tabs */}
          <div style={{
            display: 'flex',
            gap: '4px',
            background: '#ECEFEF',
            border: '1px solid #D2DBD6',
            borderRadius: '14px',
            padding: '4px',
            marginBottom: '26px'
          }}>
            <button 
              type="button"
              onClick={() => { setTab('signin'); setError(''); }}
              style={{
                flex: 1, textAlign: 'center', padding: '9px 0', borderRadius: '10px',
                fontSize: '0.88rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                color: tab === 'signin' ? '#FFFFFF' : '#4D5C56',
                background: tab === 'signin' ? 'linear-gradient(135deg, #3B6B5E 0%, #608C80 100%)' : 'transparent',
                boxShadow: tab === 'signin' ? '0 2px 8px rgba(59, 107, 94, 0.25)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              Sign in
            </button>
            <button 
              type="button"
              onClick={() => { setTab('signup'); setError(''); }}
              style={{
                flex: 1, textAlign: 'center', padding: '9px 0', borderRadius: '10px',
                fontSize: '0.88rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                color: tab === 'signup' ? '#FFFFFF' : '#4D5C56',
                background: tab === 'signup' ? 'linear-gradient(135deg, #3B6B5E 0%, #608C80 100%)' : 'transparent',
                boxShadow: tab === 'signup' ? '0 2px 8px rgba(59, 107, 94, 0.25)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              Create account
            </button>
          </div>

          {tab === 'signin' ? (
            <div>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '4px', fontWeight: 600, color: '#1F2925' }}>Welcome back</h2>
              <div style={{ color: '#4D5C56', fontSize: '0.86rem', marginBottom: '20px' }}>Sign in to pick up where you left off.</div>
              
              <form onSubmit={handleSignIn} noValidate>
                <div className="field">
                  <label htmlFor="si-username">Username or Email</label>
                  <div className="field-input-wrapper">
                    <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <input 
                      type="text" 
                      id="si-username" 
                      placeholder="you@example.com or username" 
                      autoComplete="username"
                      required
                      value={signInData.usernameOrEmail}
                      onChange={e => setSignInData(prev => ({ ...prev, usernameOrEmail: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="si-password">Password</label>
                  <div className="field-input-wrapper">
                    <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <input 
                      type="password" 
                      id="si-password" 
                      placeholder="••••••••" 
                      autoComplete="current-password"
                      required
                      value={signInData.password}
                      onChange={e => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                </div>

                {error && <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(195, 91, 72, 0.1)', border: '1px solid rgba(195, 91, 72, 0.3)', color: '#C35B48', fontSize: '13px', marginBottom: '14px' }}>{error}</div>}

                <div style={{ marginTop: '16px' }}>
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    disabled={loading}
                  >
                    {loading ? 'Signing in…' : 'Sign in'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '4px', fontWeight: 600, color: '#1F2925' }}>Create your account</h2>
              <div style={{ color: '#4D5C56', fontSize: '0.86rem', marginBottom: '20px' }}>Your assistant remembers you from here on.</div>
              
              <form onSubmit={handleSignUp} noValidate>
                <div className="field">
                  <label htmlFor="su-username">Username</label>
                  <div className="field-input-wrapper">
                    <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <input 
                      type="text" 
                      id="su-username" 
                      placeholder="rahul_k" 
                      autoComplete="username"
                      required
                      value={signUpData.username}
                      onChange={e => setSignUpData(prev => ({ ...prev, username: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="su-email">Email</label>
                  <div className="field-input-wrapper">
                    <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    <input 
                      type="email" 
                      id="su-email" 
                      placeholder="you@example.com" 
                      autoComplete="email"
                      required
                      value={signUpData.email}
                      onChange={e => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="su-password">Password</label>
                  <div className="field-input-wrapper">
                    <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <input 
                      type="password" 
                      id="su-password" 
                      placeholder="At least 8 characters" 
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={signUpData.password}
                      onChange={e => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                </div>

                {error && <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(195, 91, 72, 0.1)', border: '1px solid rgba(195, 91, 72, 0.3)', color: '#C35B48', fontSize: '13px', marginBottom: '14px' }}>{error}</div>}

                <div style={{ marginTop: '16px' }}>
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    disabled={loading}
                  >
                    {loading ? 'Creating account…' : 'Create account'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '0.86rem', color: '#8FA099' }}>
            {tab === 'signin' ? 'New here? ' : 'Already have an account? '}
            <button 
              type="button" 
              onClick={() => { setTab(tab === 'signin' ? 'signup' : 'signin'); setError(''); }}
              style={{ background: 'none', border: 'none', color: '#3B6B5E', fontWeight: 700, padding: 0, cursor: 'pointer', fontSize: '0.86rem' }}
            >
              {tab === 'signin' ? 'Create an account' : 'Sign in'}
            </button>
          </div>

        </div>
      </section>

    </div>
  );
}
