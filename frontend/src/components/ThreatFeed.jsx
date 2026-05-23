import React from 'react';
import { ShieldAlert, Users, Zap, Award } from 'lucide-react';

const ThreatFeed = ({ threats = [], scanStats = { total: 0, danger: 0, suspicious: 0, safe: 0 } }) => {
  // Simple calculation of ratio
  const phishingRatio = scanStats.total > 0 
    ? Math.round(((scanStats.danger + scanStats.suspicious) / scanStats.total) * 100)
    : 0;

  return (
    <aside className="right-panel">
      <div className="right-panel-header">
        <ShieldAlert size={18} style={{ color: 'var(--color-danger)' }} />
        <span>Threat Intel Feed</span>
      </div>

      <div className="live-feed-ticker">
        {threats.map(item => (
          <div key={item.id} className="ticker-item">
            <div className="ticker-icon-wrapper">
              <Zap size={14} />
            </div>
            <div className="ticker-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'space-between', width: '100%' }}>
                <span className={`ticker-badge ${item.severity.toLowerCase() === 'critical' ? 'critical' : 'high'}`}>{item.severity}</span>
                <span className="ticker-time">{item.timestamp}</span>
              </div>
              <span className="ticker-title">{item.title}</span>
              <span className="ticker-time" style={{ fontSize: '0.65rem' }}>
                Tactic: {item.tactic} | Target: {item.target}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="right-panel-header" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
        <Award size={18} style={{ color: 'var(--color-primary)' }} />
        <span>Scan Analytics</span>
      </div>

      <div className="stats-container">
        <div className="stat-box">
          <div className="stat-value">{scanStats.total}</div>
          <div className="stat-label">Total Scans</div>
        </div>
        <div className="stat-box">
          <div className="stat-value" style={{ color: phishingRatio > 50 ? 'var(--color-danger)' : 'var(--color-safe)' }}>
            {phishingRatio}%
          </div>
          <div className="stat-label">Threat Ratio</div>
        </div>
        <div className="stat-box" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <div>🟢 Safe: <strong style={{ color: 'var(--color-safe)' }}>{scanStats.safe}</strong></div>
            <div>🟡 Suspicious: <strong style={{ color: 'var(--color-suspicious)' }}>{scanStats.suspicious}</strong></div>
            <div>🔴 Danger: <strong style={{ color: 'var(--color-danger)' }}>{scanStats.danger}</strong></div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ThreatFeed;
