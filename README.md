# 🛡️ PhishShield AI: Phishing-Detection Chatbot & Cyber Console

PhishShield AI is a state-of-the-art, premium cybersecurity console and incident response dashboard designed to audit suspicious emails for threats and train users via a gamified Cybersecurity Academy. 

Built with a gorgeous **glassmorphic dark UI** and a **hybrid AI-heuristic engine**, PhishShield audits emails by inspecting technical headers, tracking domain homograph attacks, validating unsecured links, and analyzing psychological pressure hooks.

---

## ✨ Features

### 1. 🖥️ Incident Response Dashboard (Three-Panel Console)
- **Left Panel (Cyber Academy)**: Instant access to active defense guides, threat summaries, and the **Launch Quiz Challenge** overlay.
- **Center Panel (Audit Console)**:
  - Copy and paste suspicious email headers/bodies for instant processing.
  - Drag-and-drop `.eml` or `.txt` mail containers for deep forensic scanning.
  - Interactive cyber scan loaders detailing active testing phases.
- **Right Panel (Threat Intel Feed)**:
  - **Dynamic Threat Ticker**: Real-time ticker that prepends audited danger/suspicious cases instantly with "Just now" alerts.
  - **Live Scan Analytics**: Visual stats tracker displaying total scans, threat-to-safety ratios, and granular safe/suspicious/danger counters.

### 2. 🧠 Hybrid Threat Scanner & Auditing
- **Link Audits**: Flags unsecured protocols (`http://`), raw IP hosts, subdomain sprawl, and deceptive mismatches (where visible text points to different URLs).
- **Homograph Lookup**: Measures character similarity (SequenceMatcher) to identify lookalike brand domains (e.g., `suspension-netflix.com` impersonating `netflix.com`).
- **Header Audits**: Parses full `.eml` containers, checking for return-path envelope domain mismatches and suspicious public `Reply-To` redirects (e.g. gmail/yahoo claim to be Chase).
- **Attachment Scans**: Audits payloads for malicious extensions (`.exe`, `.vbs`, `.js`) and compressed wrappers (`.zip`, `.rar`) used to conceal malware.
- **AI Social Engineering Analyst**: Invokes **Google Gemini 1.5 Flash** using the official SDK to audit psychological hooks (urgency, credential harvesting, fear).
- **Offline Fallback**: Seamlessly falls back to a high-fidelity local keyword and NLP heuristic processor if no API key is set, ensuring 100% features and scoring parity out-of-the-box.

### 3. 💬 Interactive Cybersecurity Assistant
- Smart router that automatically routes casual conversational queries (greetings like *"hello"*, identity queries like *"who are you"*, appreciations, or general security queries) to a conversational agent rather than running email audits.

### 4. 🎮 Cybersecurity Academy
- A pre-loaded gamified scenario suite containing five realistic emails (phishing vs. legitimate).
- Interactive option selection, immediate grading, and highly educational explanation summaries detailing key threat flags.

---

## 📂 Project Architecture

```
Phishing-Detection Chatbot/
├── backend/
│   ├── analyzer.py          # Core heuristic/Gemini threat scanner
│   ├── main.py              # FastAPI server, REST routes, EML/TXT parser, Chat agent
│   ├── quiz.py              # Cybersecurity Academy scenario database
│   ├── test_analyzer.py     # Deterministic unit test suite
│   ├── test_emails/         # Sample files (Netflix phishing, Chase phishing, Safe news)
│   ├── requirements.txt     # Python backend dependencies
│   └── venv/                # Local Python virtual environment
├── frontend/
│   ├── index.html           # Master index containing SEO metadata
│   ├── package.json         # React + Vite dependencies & run scripts
│   ├── vite.config.js       # Vite configuration
│   └── src/
│       ├── App.jsx          # App orchestrator (layouts, states, event handlers)
│       ├── App.css          # Master stylesheet (HSL tokens, glassmorphism UI rules)
│       ├── index.css        # Basic layout resets
│       ├── mockData.js      # Threat feeds and default welcome assets
│       └── components/
│           ├── Sidebar.jsx      # Left sidebar navigation
│           ├── ThreatFeed.jsx   # Live dynamic Threat Feed & stats
│           ├── ChatContainer.jsx# Central Chat and Drag-and-drop file panel
│           ├── AnalysisReport.jsx# Interactive tabs (URL audit, Headers, Remediation)
│           ├── QuizModal.jsx    # Interactive Academy overlay quiz
│           ├── AcademyTips.jsx  # Cybersecurity handbooks
│           └── UI/
│               ├── Gauge.jsx    # Circular glowing SVG risk indicator
│               └── Loader.jsx   # Checkbox scanning animation pipeline
└── .gitignore               # Master exclusion rules
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Python 3.10+](https://www.python.org/downloads/)
- [Node.js v18+](https://nodejs.org/)

---

### Step 1: Set Up and Run the Backend API
Navigate to the `backend/` directory, set up the virtual environment, install requirements, and run uvicorn:

```bash
# 1. Enter directory
cd backend

# 2. Set up virtual environment
python -m venv venv

# 3. Activate venv
# On Windows PowerShell:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Start the API server
uvicorn main:app --port 8000 --reload
```
*The FastAPI backend is now active at **[http://127.0.0.1:8000](http://127.0.0.1:8000)**.*

---

### Step 2: Set Up and Run the Frontend Console
Open a new terminal window, navigate to the `frontend/` directory, install packages, and run the dev script:

```bash
# 1. Enter directory
cd frontend

# 2. Install node dependencies
npm install

# 3. Start the Vite React client
npm run dev
```
*The application UI console is now active at **[http://localhost:5173/](http://localhost:5173/)**.*

---

### Step 3: (Optional) Activate Gemini 1.5 Flash AI
By default, the application runs fully offline using local heuristics. To activate high-fidelity AI-based assessments:

1. Create a `.env` file in the `backend/` folder:
   ```env
   GEMINI_API_KEY=your_actual_google_gemini_api_key_here
   ```
2. Restart the backend Uvicorn terminal. The system health check will automatically transition to **"Gemini 1.5 Flash (Hybrid)"** mode.

---

## 🧪 Running Security Unit Tests

PhishShield includes a deterministic testing suite to validate sequence matching, homograph lookalikes, URL protocol audits, and header assessments:

```bash
cd backend
venv\Scripts\activate
python test_analyzer.py
```

---

## 🛡️ Best Security Practices Included
- **Envelope Match Check**: Discrepancies between `From` and `Return-Path` headers are instantly flagged.
- **Deceptive Link Check**: Highlights cases where links look like a trusted site (e.g. `chase.com`) but point elsewhere.
- **Remediation Guides**: Delivers actionable remediation steps based on the calculated risk score (Safe, Suspicious, or Danger).
- **Security Education**: Interactive scenarios enable training for corporate employees and general consumers alike.
