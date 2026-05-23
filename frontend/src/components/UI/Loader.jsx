import React, { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';

const Loader = ({ isFile = false }) => {
  const [steps, setSteps] = useState([
    { id: 1, text: 'Opening email container...', status: 'active' },
    { id: 2, text: isFile ? 'Auditing EML metadata headers...' : 'Scrutinizing text payload...', status: 'pending' },
    { id: 3, text: 'Parsing & inspecting embedded URLs...', status: 'pending' },
    { id: 4, text: 'Consulting Gemini LLM Engine...', status: 'pending' },
    { id: 5, text: 'Compiling security risk report...', status: 'pending' }
  ]);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setSteps(prev => prev.map(s => s.id === 1 ? { ...s, status: 'completed' } : s.id === 2 ? { ...s, status: 'active' } : s));
    }, 800);

    const timer2 = setTimeout(() => {
      setSteps(prev => prev.map(s => s.id === 2 ? { ...s, status: 'completed' } : s.id === 3 ? { ...s, status: 'active' } : s));
    }, 1600);

    const timer3 = setTimeout(() => {
      setSteps(prev => prev.map(s => s.id === 3 ? { ...s, status: 'completed' } : s.id === 4 ? { ...s, status: 'active' } : s));
    }, 2400);

    const timer4 = setTimeout(() => {
      setSteps(prev => prev.map(s => s.id === 4 ? { ...s, status: 'completed' } : s.id === 5 ? { ...s, status: 'active' } : s));
    }, 3200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [isFile]);

  return (
    <div className="cyber-loader-container">
      <ShieldAlert className="brand-logo scanning" size={40} style={{ color: 'var(--color-primary)' }} />
      
      <div className="cyber-scanner-bar"></div>
      
      <div className="cyber-loader-statuses">
        {steps.map(step => (
          <div 
            key={step.id} 
            className={`loader-status-step ${step.status}`}
          >
            <span style={{ 
              color: step.status === 'completed' ? 'var(--color-safe)' : 
                     step.status === 'active' ? 'var(--color-primary)' : 'var(--text-muted)'
            }}>
              {step.status === 'completed' ? '●' : step.status === 'active' ? '⚡' : '○'}
            </span>
            <span>{step.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Loader;
