import React, { useRef, useEffect, useState } from 'react';
import { Send, Upload, Shield, User, FileText, AlertCircle } from 'lucide-react';
import AnalysisReport from './AnalysisReport';
import Loader from './UI/Loader';

const ChatContainer = ({ 
  messages = [], 
  onSendMessage, 
  onSendFile,
  isScanning = false,
  isScanningFile = false
}) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isScanning]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedFile) {
      onSendFile(selectedFile);
      setSelectedFile(null);
    } else if (body.trim()) {
      onSendMessage(subject, body);
      setSubject('');
      setBody('');
    }
  };

  // Drag and Drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.eml') || file.name.endsWith('.txt')) {
        setSelectedFile(file);
      } else {
        alert("Only EML (.eml) or Text (.txt) email containers are supported.");
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="center-panel">
      <header className="chat-header">
        <div className="chat-header-info">
          <h2>PhishShield Audit Console</h2>
          <p>Analyzing emails for social engineering tactics and technical forgery</p>
        </div>
      </header>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div 
            key={msg.id || index} 
            className={`message-wrapper ${msg.role === 'user' ? 'user' : 'bot'}`}
          >
            <div className={`message-avatar ${msg.role === 'user' ? 'user' : 'bot'}`}>
              {msg.role === 'user' ? <User size={18} /> : <Shield size={18} />}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <div className="message-bubble">
                {/* Parse basic markdown format simple representation */}
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </div>
              </div>

              {/* Inject the interactive analysis report if present */}
              {msg.analysisReport && (
                <AnalysisReport report={msg.analysisReport} />
              )}
            </div>
          </div>
        ))}

        {/* Scan progress loader inside the chat stream */}
        {isScanning && (
          <div className="message-wrapper bot">
            <div className="message-avatar bot">
              <Shield size={18} className="scanning" />
            </div>
            <div style={{ width: '100%' }}>
              <Loader isFile={isScanningFile} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        {/* Drag and Drop Container */}
        <div 
          className={`dropzone ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
        >
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".eml,.txt"
            style={{ display: 'none' }}
          />
          <div className="dropzone-content">
            <Upload size={20} />
            {selectedFile ? (
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                Selected container: {selectedFile.name} (Click 'Analyze' to begin scanning)
              </span>
            ) : (
              <span>
                Drag & Drop a <strong>.eml</strong> or <strong>.txt</strong> email file here, or click to browse.
              </span>
            )}
          </div>
        </div>

        {selectedFile && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>File size: {Math.round(selectedFile.size / 1024)} KB</span>
            <button 
              onClick={clearSelectedFile}
              style={{ background: 'transparent', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
            >
              Cancel File Upload
            </button>
          </div>
        )}

        {/* Form Input area */}
        <form onSubmit={handleSubmit} className="form-inputs">
          {!selectedFile ? (
            <div className="chat-input-wrapper">
              <input 
                type="text"
                className="chat-input-subject"
                placeholder="Subject Line (Optional)..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={isScanning}
              />
              <textarea 
                className="chat-input-body"
                placeholder="Paste the raw email header + body content here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                disabled={isScanning}
                onKeyDown={(e) => {
                  // Allow pressing Shift+Enter for newline, Enter to send
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (body.trim()) handleSubmit(e);
                  }
                }}
              />
            </div>
          ) : (
            <div className="chat-input-wrapper" style={{ justifyContent: 'center', height: '80px', alignItems: 'center', background: 'rgba(99,102,241,0.05)', borderColor: 'var(--color-primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                <FileText size={18} />
                <span>Ready to scan: {selectedFile.name}</span>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn-send"
            disabled={isScanning || (!selectedFile && !body.trim())}
            title={selectedFile ? "Scan Uploaded EML File" : "Scan Text Content"}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatContainer;
