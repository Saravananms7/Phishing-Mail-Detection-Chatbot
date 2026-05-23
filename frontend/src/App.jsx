import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ThreatFeed from './components/ThreatFeed';
import ChatContainer from './components/ChatContainer';
import AcademyTips from './components/AcademyTips';
import QuizModal from './components/QuizModal';
import { DEFAULT_MESSAGES, THREAT_TICKER_ITEMS } from './mockData';
import './App.css';

const API_PORT = '8000';
const API_BASE_URL = `http://127.0.0.1:${API_PORT}/api`;

function App() {
  const [currentTab, setCurrentTab] = useState('chat');
  const [messages, setMessages] = useState(DEFAULT_MESSAGES);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isScanningFile, setIsScanningFile] = useState(false);
  const [apiStatus, setApiStatus] = useState({
    status: 'checking',
    gemini_api_key_configured: false,
    mode: 'Checking connection...'
  });
  const [scanStats, setScanStats] = useState({
    total: 0,
    danger: 0,
    suspicious: 0,
    safe: 0
  });
  const [threats, setThreats] = useState(THREAT_TICKER_ITEMS);

  // Verify backend health on startup
  useEffect(() => {
    fetch(`${API_BASE_URL}/health`)
      .then(res => {
        if (!res.ok) throw new Error("Offline");
        return res.json();
      })
      .then(data => {
        setApiStatus({
          status: 'healthy',
          gemini_api_key_configured: data.gemini_api_key_configured,
          mode: data.mode
        });
      })
      .catch(() => {
        setApiStatus({
          status: 'offline',
          gemini_api_key_configured: false,
          mode: 'Offline Heuristic Mode'
        });
      });
  }, []);

  const updateStats = (verdict) => {
    setScanStats(prev => {
      const updated = { ...prev, total: prev.total + 1 };
      const vLower = verdict.toLowerCase();
      if (vLower === 'danger') updated.danger += 1;
      else if (vLower === 'suspicious') updated.suspicious += 1;
      else updated.safe += 1;
      return updated;
    });
  };

  const addScanToThreatFeed = (data, filename) => {
    const vLower = data.verdict?.toLowerCase();
    if (vLower === 'danger' || vLower === 'suspicious') {
      const tacticStr = data.social_engineering_tactics && data.social_engineering_tactics.length > 0
        ? data.social_engineering_tactics[0]
        : "Suspicious Indicators";
        
      const displayTitle = filename 
        ? `File: ${filename}` 
        : (data.subject?.trim() || "Pasted Email Audit");

      const newTickerItem = {
        id: `dyn-${Date.now()}`,
        title: displayTitle,
        tactic: tacticStr,
        severity: vLower === 'danger' ? 'Critical' : 'High',
        timestamp: 'Just now',
        target: 'Console User'
      };

      setThreats(prev => [newTickerItem, ...prev]);
    }
  };

  // Handle standard text copy-paste scanning or conversational questions
  const handleSendMessage = async (subject, body) => {
    const cleanBody = body.trim().toLowerCase();
    const isGreeting = ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'who are you', 'how are you', 'what is', 'tell me', 'can you', 'help'].some(g => cleanBody.includes(g));
    const isQuestionMark = cleanBody.includes('?');
    const isChatKeyword = ['spf', 'dkim', 'dmarc', 'mfa', 'phishing', 'security', 'remediation', 'scam', 'hack'].some(k => cleanBody.includes(k));
    
    // Treat as interactive chat request if there is no subject, and it is short or contains chat triggers
    const isChatMessage = !subject.trim() && (
      body.trim().length < 350 ||
      isGreeting ||
      isQuestionMark ||
      isChatKeyword
    ) && !body.includes('Subject:') && !body.includes('From:');

    if (isChatMessage) {
      const userMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: body
      };
      setMessages(prev => [...prev, userMessage]);
      setIsScanning(true);
      setIsScanningFile(false);

      try {
        // Compile short history
        const chatHistory = messages.map(m => ({
          role: m.role,
          content: m.content
        }));

        const response = await fetch(`${API_BASE_URL}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: body, history: chatHistory })
        });

        if (!response.ok) throw new Error("Chat failed");
        
        const data = await response.json();
        setMessages(prev => [...prev, {
          id: `bot-${Date.now()}`,
          role: 'bot',
          content: data.message
        }]);
      } catch (err) {
        setMessages(prev => [...prev, {
          id: `bot-${Date.now()}`,
          role: 'bot',
          content: "I encountered an error connecting to my conversational interface. You can type **'phishing'**, **'SPF'**, **'DKIM'**, **'DMARC'**, or **'MFA'** for direct local FAQ responses."
        }]);
      } finally {
        setIsScanning(false);
      }
      return;
    }

    // 2. Email Heuristic/LLM Scan flow
    const userMsgContent = subject.trim() 
      ? `[Audit Request]\nSubject: ${subject}\nBody Excerpt: ${body.substring(0, 100)}...`
      : `[Audit Request]\nBody Excerpt: ${body.substring(0, 100)}...`;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMsgContent
    };

    setMessages(prev => [...prev, userMessage]);
    setIsScanning(true);
    setIsScanningFile(false);

    try {
      const response = await fetch(`${API_BASE_URL}/analyze/text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body })
      });

      if (!response.ok) throw new Error("Analysis failed");

      const data = await response.json();
      
      // Inject bot response with attachment analysis report
      const botMessage = {
        id: `bot-${Date.now()}`,
        role: 'bot',
        content: `Audit Completed. Calculated an overall **${data.verdict}** threat risk of **${data.risk_score}%**. Please inspect the detailed breakdown in the card below:`,
        analysisReport: data
      };

      setMessages(prev => [...prev, botMessage]);
      updateStats(data.verdict);
      addScanToThreatFeed(data, null);
    } catch (err) {
      console.error(err);
      // Fallback response for complete offline simulation
      setMessages(prev => [...prev, {
        id: `bot-err-${Date.now()}`,
        role: 'bot',
        content: "Error: The backend scanner was unreachable. Please verify your FastAPI backend is running on http://127.0.0.1:8000."
      }]);
    } finally {
      setIsScanning(false);
    }
  };

  // Handle uploaded EML or TXT files
  const handleSendFile = async (file) => {
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: `[File Upload Audit] Opened file container: ${file.name}`
    };

    setMessages(prev => [...prev, userMessage]);
    setIsScanning(true);
    setIsScanningFile(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/analyze/file`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error("File analysis failed");

      const data = await response.json();
      
      const botMessage = {
        id: `bot-${Date.now()}`,
        role: 'bot',
        content: `Container Audit Complete. Calculated a **${data.verdict}** risk score of **${data.risk_score}%** for container **${file.name}**. Detailed parameters scanned are listed below:`,
        analysisReport: data
      };

      setMessages(prev => [...prev, botMessage]);
      updateStats(data.verdict);
      addScanToThreatFeed(data, file.name);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: `bot-err-${Date.now()}`,
        role: 'bot',
        content: `Failed to audit file container '${file.name}'. Ensure the backend FastAPI server is online.`
      }]);
    } finally {
      setIsScanning(false);
      setIsScanningFile(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar 
        apiStatus={apiStatus} 
        onLaunchQuiz={() => setIsQuizOpen(true)}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />
      
      {currentTab === 'chat' ? (
        <ChatContainer 
          messages={messages}
          onSendMessage={handleSendMessage}
          onSendFile={handleSendFile}
          isScanning={isScanning}
          isScanningFile={isScanningFile}
        />
      ) : (
        <AcademyTips onLaunchQuiz={() => setIsQuizOpen(true)} />
      )}

      <ThreatFeed threats={threats} scanStats={scanStats} />

      <QuizModal 
        isOpen={isQuizOpen} 
        onClose={() => setIsQuizOpen(false)} 
        apiPort={API_PORT}
      />
    </div>
  );
}

export default App;
