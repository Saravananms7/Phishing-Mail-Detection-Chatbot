import React from 'react';
import { BookOpen, ShieldAlert, CheckCircle, HelpCircle } from 'lucide-react';
import { PHISHING_TIPS } from '../mockData';

const AcademyTips = ({ onLaunchQuiz }) => {
  return (
    <div className="center-panel" style={{ overflowY: 'auto', padding: '2rem' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.75rem', marginBottom: '0.25rem' }}>
          Cybersecurity Protection Academy
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Learn the mechanical indicators used by elite threat analysts to spot and dismantle phishing attempts.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {PHISHING_TIPS.map((tip, idx) => (
          <div key={tip.id} className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--color-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <span style={{ 
                fontFamily: 'var(--font-display)', 
                fontWeight: 800, 
                fontSize: '1.25rem', 
                color: 'var(--color-primary)',
                background: 'rgba(99, 102, 241, 0.1)',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {idx + 1}
              </span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                {tip.title}
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6' }}>
              {tip.detail}
            </p>
          </div>
        ))}
      </div>

      <div className="glass-panel" style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(244, 63, 94, 0.05))',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <HelpCircle size={40} style={{ color: 'var(--color-primary)' }} />
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem' }}>Ready to Test Your Instincts?</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '400px', lineHeight: '1.5' }}>
          We have compiled five realistic cyberthreat scenarios representing actual phishing and corporate messages. Try to identify them all!
        </p>
        <button 
          className="btn-academy" 
          onClick={onLaunchQuiz}
          style={{ width: '200px', padding: '0.75rem', fontSize: '0.9rem' }}
        >
          Launch Quiz Challenge
        </button>
      </div>
    </div>
  );
};

export default AcademyTips;
