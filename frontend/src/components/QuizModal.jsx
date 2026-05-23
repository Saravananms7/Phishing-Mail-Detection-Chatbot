import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertOctagon, HelpCircle, Trophy } from 'lucide-react';

const QuizModal = ({ isOpen, onClose, apiPort = '8000' }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAns, setSelectedAns] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch quiz questions from backend
  useEffect(() => {
    if (!isOpen) return;
    
    setLoading(true);
    setQuestions([]);
    setCurrentIdx(0);
    setSelectedAns(null);
    setShowExplanation(false);
    setScore(0);
    setIsFinished(false);

    fetch(`http://127.0.0.1:${apiPort}/api/quiz/questions`)
      .then(res => {
        if (!res.ok) throw new Error("Could not load quiz");
        return res.json();
      })
      .then(data => {
        setQuestions(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        // Fallback local questions just in case API fails
        const fallbackQuestions = [
          {
            id: 1,
            title: "Fake Bank Alert",
            sender: "Chase security <alerts@chase-secure-banking.net>",
            subject: "Notice: Outgoing wire transfer pending",
            body: "A wire transfer of $4,500.00 to receiver 'Mr. Boris' is pending. If you DID NOT authorize this, cancel it immediately at:\nhttp://192.168.4.12/cancel-wire",
            options: ["Phishing Email", "Legitimate Email"],
            correct_answer: 0,
            explanation: "This is Phishing! It uses a lookalike domain (chase-secure-banking.net) and directs you to a raw IP address (192.168.4.12)."
          },
          {
            id: 2,
            title: "Google login notice",
            sender: "Google accounts <no-reply@accounts.google.com>",
            subject: "Security Alert: New sign-in",
            body: "A new sign-in was detected on your Google Account. Verify your activity at:\nhttps://myaccount.google.com/security-checkup",
            options: ["Phishing Email", "Legitimate Email"],
            correct_answer: 1,
            explanation: "This is Legitimate! The sender domain (accounts.google.com) and link destination are official Google assets."
          }
        ];
        setQuestions(fallbackQuestions);
        setLoading(false);
      });
  }, [isOpen, apiPort]);

  if (!isOpen) return null;

  const currentQuestion = questions[currentIdx];

  const handleAnswerSelect = (optionIdx) => {
    if (showExplanation) return; // Answer locked in
    setSelectedAns(optionIdx);
    setShowExplanation(true);
    
    if (optionIdx === currentQuestion.correct_answer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedAns(null);
    setShowExplanation(false);
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  return (
    <div className="quiz-overlay">
      <div className="quiz-modal glass-panel">
        <button className="quiz-close-btn" onClick={onClose}>
          <X size={16} />
        </button>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem' }}>
            <div className="cyber-scanner-bar" style={{ width: '150px' }}></div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Loading Cybersecurity Academy Challenge...</span>
          </div>
        ) : isFinished ? (
          <div className="quiz-results-card">
            <Trophy size={48} style={{ color: 'var(--color-primary)' }} />
            <h3 className="quiz-results-eval">Challenge Completed!</h3>
            
            <div className="quiz-results-score-circle">
              <span className="quiz-results-val">{score}</span>
              <span className="quiz-results-max">/ {questions.length}</span>
            </div>
            
            <p className="academy-desc" style={{ fontSize: '0.85rem', maxWidth: '350px' }}>
              {score === questions.length ? (
                <strong style={{ color: 'var(--color-safe)' }}>Flawless! You are a master at spotting phishing traps. Keep remaining vigilant!</strong>
              ) : score >= Math.ceil(questions.length / 2) ? (
                <strong style={{ color: 'var(--color-suspicious)' }}>Good effort! You spotted most traps, but look out for lookalike domains and TLDs.</strong>
              ) : (
                <strong style={{ color: 'var(--color-danger)' }}>Critical Defense Risk! We recommend studying our analysis reports to sharpen your eyes.</strong>
              )}
            </p>
            
            <button className="btn-academy" onClick={onClose} style={{ width: '150px' }}>
              Close Console
            </button>
          </div>
        ) : (
          <div className="quiz-card">
            <div className="quiz-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HelpCircle size={18} style={{ color: 'var(--color-primary)' }} />
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>
                    Academy Scenario {currentIdx + 1}
                  </h3>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Question {currentIdx + 1} of {questions.length}
                </span>
              </div>
              <div className="quiz-progress-bar-container">
                <div 
                  className="quiz-progress-bar-fill"
                  style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{currentQuestion.title}</h4>
              <div className="quiz-email-preview">
                <div className="preview-header-line">
                  <span>From:</span> {currentQuestion.sender}
                </div>
                <div className="preview-header-line">
                  <span>Subject:</span> {currentQuestion.subject}
                </div>
                <div className="preview-body-content">
                  {currentQuestion.body}
                </div>
              </div>
            </div>

            <div className="quiz-choices">
              {currentQuestion.options.map((option, idx) => {
                let btnClass = "";
                if (showExplanation) {
                  if (idx === currentQuestion.correct_answer) {
                    btnClass = "correct";
                  } else if (idx === selectedAns) {
                    btnClass = "incorrect";
                  }
                }
                return (
                  <button
                    key={idx}
                    className={`btn-choice ${btnClass}`}
                    onClick={() => handleAnswerSelect(idx)}
                    disabled={showExplanation}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <div className={`quiz-explanation-box ${selectedAns === currentQuestion.correct_answer ? 'correct' : 'incorrect'}`}>
                <div className="explanation-title">
                  {selectedAns === currentQuestion.correct_answer ? (
                    <>
                      <CheckCircle size={16} color="var(--color-safe)" />
                      <span style={{ color: 'var(--color-safe)' }}>Correct Analysis!</span>
                    </>
                  ) : (
                    <>
                      <AlertOctagon size={16} color="var(--color-danger)" />
                      <span style={{ color: 'var(--color-danger)' }}>Incorrect Assessment</span>
                    </>
                  )}
                </div>
                <p className="explanation-text">{currentQuestion.explanation}</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button className="btn-quiz-next" onClick={handleNext}>
                    {currentIdx + 1 === questions.length ? "Finish Test" : "Next Scenario"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizModal;
