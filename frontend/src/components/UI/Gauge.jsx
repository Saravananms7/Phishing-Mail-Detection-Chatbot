import React from 'react';

const Gauge = ({ score = 0, verdict = 'Safe' }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine colors based on verdict/score
  let color = 'var(--color-safe)';
  let glow = 'var(--color-safe-glow)';
  
  if (score >= 70 || verdict.toLowerCase() === 'danger') {
    color = 'var(--color-danger)';
    glow = 'var(--color-danger-glow)';
  } else if (score >= 30 || verdict.toLowerCase() === 'suspicious') {
    color = 'var(--color-suspicious)';
    glow = 'var(--color-suspicious-glow)';
  }

  return (
    <div className="gauge-section">
      <div className="gauge-svg-container">
        <svg width="110" height="110" viewBox="0 0 110 110">
          <circle
            className="gauge-circle-bg"
            cx="55"
            cy="55"
            r={radius}
          />
          <circle
            className="gauge-circle-fill"
            cx="55"
            cy="55"
            r={radius}
            stroke={color}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
              filter: `drop-shadow(0 0 4px ${glow})`
            }}
          />
        </svg>
        <div className="gauge-text">
          <span className="gauge-percentage" style={{ color }}>
            {score}%
          </span>
          <span className="gauge-label">Risk</span>
        </div>
      </div>
    </div>
  );
};

export default Gauge;
