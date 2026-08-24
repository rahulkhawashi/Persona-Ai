import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import WellnessTrendChart from '../components/WellnessTrendChart';
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

export default function WellnessCheckIn() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchHistory = async () => {
    try {
      const res = await client.get('/mental_health/history');
      setHistory(res.data);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'age' || name === 'daily_unlocks' || name.includes('hours'))
        ? (value === '' ? '' : Number(value))
        : value
    }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await client.post('/mental_health/predict', formData);
      const score = res.data.predicted_mental_health_score;
      setPredictionResult(score);
      fetchHistory();
    } catch (err) {
      console.error("Prediction error:", err);
      setErrorMsg(err.response?.data?.detail?.[0]?.msg || 'Error calculating prediction. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const band = predictionResult !== null ? getScoreBand(predictionResult) : null;
  const gaugeArcLength = 314;
  const clampedScore = predictionResult !== null ? Math.min(Math.max(predictionResult, 0), 10) : 0;
  const gaugeOffset = predictionResult !== null ? gaugeArcLength * (1 - clampedScore / 10) : gaugeArcLength;

  // Generate SVG gauge tick lines
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
    <div className="mental-health-root">
      {/* Glowing Ambient Background Orbs */}
      <div className="mh-glow-orb mh-glow-orb-1" aria-hidden="true"></div>
      <div className="mh-glow-orb mh-glow-orb-2" aria-hidden="true"></div>
      <div className="mh-glow-orb mh-glow-orb-3" aria-hidden="true"></div>

      {/* Top Header */}
      <header className="mh-site-header">
        <div className="mh-header-top">
          <button onClick={() => navigate('/assistant')} className="mh-back-btn">
            ← 3D AI Assistant
          </button>
          <span style={{ fontSize: '12px', color: '#8FA099', fontFamily: 'JetBrains Mono' }}>
            LOCAL ML CORE
          </span>
        </div>

        <span className="mh-eyebrow">Student Wellness Analytics</span>
        <h1 className="mh-title">Persona — Mental Health <em>Signal</em></h1>
        <p className="mh-subtitle">
          A quick read on how habits, screen time, and stress are trending — modeled from your daily rhythm, not a diagnosis.
        </p>
      </header>

      {/* Main Layout */}
      <main className="mh-layout">
        
        {/* Left Form Panel */}
        <section className="mh-panel mh-form-panel">
          <form onSubmit={handleSubmit} noValidate>

            {/* 01 Profile */}
            <fieldset className="mh-group">
              <legend className="mh-legend">
                <span className="mh-legend-index">01</span> Profile
              </legend>
              <div className="mh-grid mh-grid-3">
                <div className="mh-field">
                  <label htmlFor="age">Age</label>
                  <div className="mh-input-wrapper">
                    <svg className="mh-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <input type="number" id="age" name="age" min="10" max="100" step="1" required placeholder="e.g. 21" value={formData.age} onChange={handleChange} />
                  </div>
                  <span className="mh-hint">10–100</span>
                </div>

                <div className="mh-field">
                  <label htmlFor="gender">Gender</label>
                  <div className="mh-input-wrapper">
                    <svg className="mh-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    <select id="gender" name="gender" required value={formData.gender} onChange={handleChange}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="mh-field">
                  <label htmlFor="country">Country</label>
                  <div className="mh-input-wrapper">
                    <svg className="mh-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                    <select id="country" name="country" required value={formData.country} onChange={handleChange}>
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
                  <label htmlFor="academic_level">Academic level</label>
                  <div className="mh-input-wrapper">
                    <svg className="mh-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path></svg>
                    <select id="academic_level" name="academic_level" required value={formData.academic_level} onChange={handleChange}>
                      {ACADEMIC_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mh-field">
                  <label htmlFor="most_used_platform">Most-used platform</label>
                  <div className="mh-input-wrapper">
                    <svg className="mh-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                    <select id="most_used_platform" name="most_used_platform" required value={formData.most_used_platform} onChange={handleChange}>
                      {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mh-field">
                  <label htmlFor="purpose_of_use">Primary purpose</label>
                  <div className="mh-input-wrapper">
                    <svg className="mh-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
                    <select id="purpose_of_use" name="purpose_of_use" required value={formData.purpose_of_use} onChange={handleChange}>
                      {PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mh-field">
                  <label htmlFor="avg_daily_usage_hours">Avg. daily screen time</label>
                  <div className="mh-input-wrapper mh-unit-wrapper">
                    <svg className="mh-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    <input type="number" id="avg_daily_usage_hours" name="avg_daily_usage_hours" min="0" max="24" step="0.1" required placeholder="0.0" value={formData.avg_daily_usage_hours} onChange={handleChange} />
                    <span className="mh-unit">hrs</span>
                  </div>
                </div>

                <div className="mh-field mh-field-span">
                  <label htmlFor="daily_unlocks">Daily phone unlocks</label>
                  <div className="mh-input-wrapper">
                    <svg className="mh-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
                    <input type="number" id="daily_unlocks" name="daily_unlocks" min="0" step="1" required placeholder="e.g. 60" value={formData.daily_unlocks} onChange={handleChange} />
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
                  <label htmlFor="study_hours">Study hours / day</label>
                  <div className="mh-input-wrapper mh-unit-wrapper">
                    <svg className="mh-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                    <input type="number" id="study_hours" name="study_hours" min="0" max="24" step="0.1" required placeholder="0.0" value={formData.study_hours} onChange={handleChange} />
                    <span className="mh-unit">hrs</span>
                  </div>
                </div>

                <div className="mh-field">
                  <label htmlFor="physical_activity_hours">Physical activity / day</label>
                  <div className="mh-input-wrapper mh-unit-wrapper">
                    <svg className="mh-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    <input type="number" id="physical_activity_hours" name="physical_activity_hours" min="0" max="24" step="0.1" required placeholder="0.0" value={formData.physical_activity_hours} onChange={handleChange} />
                    <span className="mh-unit">hrs</span>
                  </div>
                </div>

                <div className="mh-field">
                  <label htmlFor="sleep_hours_per_night">Sleep / night</label>
                  <div className="mh-input-wrapper mh-unit-wrapper">
                    <svg className="mh-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                    <input type="number" id="sleep_hours_per_night" name="sleep_hours_per_night" min="0" max="24" step="0.1" required placeholder="0.0" value={formData.sleep_hours_per_night} onChange={handleChange} />
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
                        className={`mh-seg-btn ${formData.stress_level === lvl ? `active-${lvl.replace(' ', '-')}` : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, stress_level: lvl }))}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </fieldset>

            {errorMsg && (
              <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(195, 91, 72, 0.1)', border: '1px solid rgba(195, 91, 72, 0.3)', color: '#C35B48', fontSize: '13px', marginBottom: '16px' }}>
                {errorMsg}
              </div>
            )}

            <div className="mh-form-footer">
              <button type="submit" className="mh-submit-btn" disabled={loading}>
                {loading ? 'Reading the signal...' : 'Read my signal'}
              </button>
            </div>
          </form>
        </section>

        {/* Right Column: Result Gauge & History Trend Chart Directly Below */}
        <div className="mh-right-col">
          
          {/* Result Gauge Card */}
          <aside className="mh-panel mh-result-panel" aria-live="polite">
            <div className="mh-result-inner">
              
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

              {predictionResult !== null ? (
                <>
                  <div className="mh-score-readout">
                    <span className="mh-score-number">{predictionResult.toFixed(2)}</span>
                    <span className="mh-score-max">/10</span>
                  </div>
                  <span className={`mh-score-band ${band.className}`}>
                    {band.label}
                  </span>
                  <p className="mh-score-context">
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

          {/* Historical Trend Chart Placed Directly Below Prediction Score Card */}
          <section className="mh-panel mh-history-panel">
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1F2925', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B6B5E' }}></span>
              Wellness Score Trend History
            </h3>
            <div style={{ height: '220px' }}>
              <WellnessTrendChart data={history} />
            </div>
          </section>

        </div>

      </main>

      <footer className="mh-footer">
        <p>Built for informational purposes only — this is not a clinical assessment. If you're struggling, please talk to someone you trust.</p>
      </footer>
    </div>
  );
}
