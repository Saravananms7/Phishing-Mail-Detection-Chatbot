import React from 'react';
import { ShieldAlert, BookOpen, FileText, HelpCircle, Terminal } from 'lucide-react';

const Sidebar = ({ 
  apiStatus = { status: 'healthy', gemini_api_key_configured: false, mode: 'Local Heuristics' },
  onLaunchQuiz,
  currentTab = 'chat',
  setCurrentTab
}) => {
  return (
    <aside className="sidebar">
      <div className="brand-section">
        <div className="brand-logo">
          <ShieldAlert size={22} color="white" />
        </div>
        <span className="brand-name">PhishShield AI</span>
      </div>

      <div className="bot-status-container">
        <div className={`status-dot ${apiStatus.gemini_api_key_configured ? 'online' : 'offline'}`}></div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="status-text" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
            System Integrity
          </span>
          <span className="status-text" style={{ fontSize: '0.7rem', opacity: 0.8 }}>
            {apiStatus.mode}
          </span>
        </div>
      </div>

      <div className="sidebar-heading">Navigation</div>
      <ul className="nav-list">
        <li 
          className={`nav-item ${currentTab === 'chat' ? 'active' : ''}`}
          onClick={() => setCurrentTab('chat')}
        >
          <Terminal size={18} />
          <span>Audit Console</span>
        </li>
        <li 
          className={`nav-item ${currentTab === 'tips' ? 'active' : ''}`}
          onClick={() => setCurrentTab('tips')}
        >
          <BookOpen size={18} />
          <span>Cyber Academy</span>
        </li>
      </ul>

      <div className="academy-card">
        <HelpCircle size={24} style={{ color: 'var(--color-primary)', margin: '0 auto 0.5rem auto', display: 'block' }} />
        <h4 className="academy-title">Identify the Threat</h4>
        <p className="academy-desc">
          Think you can spot phishing emails? Test your knowledge with a simulated interactive challenge.
        </p>
        <button className="btn-academy" onClick={onLaunchQuiz}>
          Launch Quiz Challenge
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
