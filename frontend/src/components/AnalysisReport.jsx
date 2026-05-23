import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, Link2, Mail, CheckCircle2, AlertOctagon, FileCheck2, Info } from 'lucide-react';
import Gauge from './UI/Gauge';

const AnalysisReport = ({ report }) => {
  const [activeTab, setActiveTab] = useState('assessment');

  if (!report) return null;

  const {
    risk_score = 0,
    verdict = 'Safe',
    social_engineering_tactics = [],
    key_indicators = [],
    remediation_steps = [],
    urls_analysis = [],
    headers = null,
    header_audit = null,
    attachments = [],
    filename = ''
  } = report;

  // Tabs computation
  const hasUrls = urls_analysis && urls_analysis.length > 0;
  const hasHeaders = headers !== null;
  const hasAttachments = attachments && attachments.length > 0;

  return (
    <div className="report-card glass-panel">
      <div className="report-header">
        <div className="report-title-area">
          {verdict.toLowerCase() === 'danger' ? (
            <AlertOctagon style={{ color: 'var(--color-danger)' }} size={20} />
          ) : verdict.toLowerCase() === 'suspicious' ? (
            <AlertTriangle style={{ color: 'var(--color-suspicious)' }} size={20} />
          ) : (
            <ShieldCheck style={{ color: 'var(--color-safe)' }} size={20} />
          )}
          <span className="report-title">
            {filename ? `Audit: ${filename}` : 'Email Security Audit'}
          </span>
        </div>
        <span className={`verdict-badge ${verdict.toLowerCase()}`}>
          {verdict}
        </span>
      </div>

      <div className="report-body">
        <Gauge score={risk_score} verdict={verdict} />

        <div className="report-details-section">
          <div className="report-tabs">
            <button
              className={`report-tab-btn ${activeTab === 'assessment' ? 'active' : ''}`}
              onClick={() => setActiveTab('assessment')}
            >
              Assessment
            </button>
            
            {hasUrls && (
              <button
                className={`report-tab-btn ${activeTab === 'urls' ? 'active' : ''}`}
                onClick={() => setActiveTab('urls')}
              >
                URLs ({urls_analysis.length})
              </button>
            )}

            {hasHeaders && (
              <button
                className={`report-tab-btn ${activeTab === 'headers' ? 'active' : ''}`}
                onClick={() => setActiveTab('headers')}
              >
                Headers
              </button>
            )}

            {hasAttachments && (
              <button
                className={`report-tab-btn ${activeTab === 'attachments' ? 'active' : ''}`}
                onClick={() => setActiveTab('attachments')}
              >
                Attachments ({attachments.length})
              </button>
            )}

            <button
              className={`report-tab-btn ${activeTab === 'remediation' ? 'active' : ''}`}
              onClick={() => setActiveTab('remediation')}
            >
              Remediation
            </button>
          </div>

          <div className="tab-content">
            {/* ASSESSMENT TAB */}
            {activeTab === 'assessment' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <h5 style={{ fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                    Social Engineering Tactics Identified
                  </h5>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {social_engineering_tactics.map((tactic, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.7rem',
                          padding: '0.2rem 0.6rem',
                          background: 'rgba(99, 102, 241, 0.1)',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                          borderRadius: '4px',
                          color: 'var(--color-primary)'
                        }}
                      >
                        {tactic}
                      </span>
                    ))}
                  </div>
                </div>

                {key_indicators.length > 0 && (
                  <div>
                    <h5 style={{ fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                      Suspicious Linguistic Markers
                    </h5>
                    <div className="indicator-list">
                      {key_indicators.map((ind, idx) => (
                        <div key={idx} className="indicator-item" style={{
                          borderLeftColor: verdict.toLowerCase() === 'danger' ? 'var(--color-danger)' : 'var(--color-suspicious)'
                        }}>
                          <div className="indicator-excerpt" style={{
                            color: verdict.toLowerCase() === 'danger' ? 'var(--color-danger)' : 'var(--color-suspicious)'
                          }}>
                            "{ind.excerpt}"
                          </div>
                          <div className="indicator-desc">{ind.analysis}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* URLS TAB */}
            {activeTab === 'urls' && hasUrls && (
              <div>
                <h5 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Link Scrutiny Breakdown</h5>
                {urls_analysis.map((urlData, idx) => (
                  <div key={idx} className="url-card">
                    <div className="url-display-text">
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Text: </span>
                      {urlData.display_text || "(Raw Link)"}
                    </div>
                    <div className="url-destination">
                      <Link2 size={12} />
                      <span>{urlData.url}</span>
                    </div>
                    {urlData.is_suspicious && urlData.flags.map((flag, fIdx) => (
                      <div key={fIdx} className="url-flag-alert">
                        <AlertTriangle size={12} />
                        <span>{flag.desc}</span>
                      </div>
                    ))}
                    {!urlData.is_suspicious && (
                      <div className="url-flag-alert" style={{ background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--color-safe)' }}>
                        <CheckCircle2 size={12} />
                        <span>This link domain displays no immediate anomalies.</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* HEADERS TAB */}
            {activeTab === 'headers' && hasHeaders && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h5 style={{ fontWeight: 700 }}>EML Envelope Headers</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', background: 'rgba(0,0,0,0.15)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                  <div><span style={{ color: 'var(--color-primary)' }}>Subject:</span> {headers.Subject}</div>
                  <div><span style={{ color: 'var(--color-primary)' }}>From:</span> {headers.From}</div>
                  <div><span style={{ color: 'var(--color-primary)' }}>To:</span> {headers.To}</div>
                  {headers.Date && <div><span style={{ color: 'var(--color-primary)' }}>Date:</span> {headers.Date}</div>}
                  {headers['Return-Path'] && <div><span style={{ color: 'var(--color-primary)' }}>Return-Path:</span> {headers['Return-Path']}</div>}
                  {headers['Reply-To'] && <div><span style={{ color: 'var(--color-primary)' }}>Reply-To:</span> {headers['Reply-To']}</div>}
                </div>

                <h5 style={{ fontWeight: 700, marginTop: '0.5rem' }}>Identity Verifications</h5>
                <div className="indicator-list">
                  {header_audit && header_audit.is_suspicious ? (
                    header_audit.flags.map((flag, idx) => (
                      <div key={idx} className="indicator-item" style={{ borderLeftColor: 'var(--color-danger)' }}>
                        <div className="indicator-excerpt" style={{ color: 'var(--color-danger)' }}>
                          FAILED: {flag.type}
                        </div>
                        <div className="indicator-desc">{flag.desc}</div>
                      </div>
                    ))
                  ) : (
                    <div className="indicator-item" style={{ borderLeftColor: 'var(--color-safe)', background: 'rgba(16, 185, 129, 0.02)' }}>
                      <div className="indicator-excerpt" style={{ color: 'var(--color-safe)' }}>
                        PASSED: Envelope Alignments
                      </div>
                      <div className="indicator-desc">
                        From header domains correspond correctly with envelope return routes. No direct sender spoofing anomalies detected.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ATTACHMENTS TAB */}
            {activeTab === 'attachments' && hasAttachments && (
              <div>
                <h5 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Attachment Payloads Scan</h5>
                {attachments.map((file, idx) => {
                  const safetyColor = file.safety === 'Dangerous' ? 'var(--color-danger)' : 
                                      file.safety === 'Suspicious' ? 'var(--color-suspicious)' : 'var(--color-safe)';
                  const safetyGlow = file.safety === 'Dangerous' ? 'var(--color-danger-glow)' : 
                                     file.safety === 'Suspicious' ? 'var(--color-suspicious-glow)' : 'var(--color-safe-glow)';
                  return (
                    <div key={idx} className="url-card" style={{ borderLeft: `3px solid ${safetyColor}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{file.filename}</div>
                        <span style={{ 
                          fontSize: '0.65rem',
                          fontWeight: 700, 
                          color: safetyColor,
                          padding: '0.1rem 0.4rem',
                          background: `rgba(255, 255, 255, 0.05)`,
                          border: `1px solid ${safetyColor}`,
                          borderRadius: '4px'
                        }}>
                          {file.safety}
                        </span>
                      </div>
                      <div className="url-time" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        Size: {Math.round(file.size_bytes / 1024)} KB | Extension: .{file.extension}
                      </div>
                      <div className="url-destination" style={{ marginTop: '0.4rem', color: 'var(--text-secondary)' }}>
                        <Info size={10} />
                        <span>{file.reason}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* REMEDIATION TAB */}
            {activeTab === 'remediation' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h5 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  Cyber Incident Response Protocol
                </h5>
                <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {remediation_steps.map((step, idx) => (
                    <li key={idx} style={{ color: 'var(--text-secondary)' }}>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisReport;
