import os
import re
import shutil
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import Optional

# Import custom modules
from analyzer import scan_email, parse_eml_file
from quiz import get_all_questions

# Load environment variables
load_dotenv()

app = FastAPI(title="PhishShield AI API", version="1.0.0")

# Setup CORS for React Frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Support wildcard or specific localhost ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Text Scan request schema
class TextScanRequest(BaseModel):
    subject: str
    body: str

# Chat request schema
class ChatRequest(BaseModel):
    message: str
    history: Optional[list] = []

# Predefined static local chatbot FAQ answers for offline fallback
FAQ_RESPONSES = {
    "phishing": (
        "Phishing is a type of cyberattack where attackers masquerade as trusted entities (like banks, subscription services, "
        "or colleagues) to trick you into revealing sensitive information, such as login credentials, credit card details, or SSNs.\n\n"
        "**Common Signs of Phishing:**\n"
        "- urgent or threatening language\n"
        "- generic greetings like 'Dear Customer'\n"
        "- lookalike sender domains (e.g., security-paypal.com instead of paypal.com)\n"
        "- links that direct to suspicious URLs or raw IP addresses"
    ),
    "spf": (
        "**SPF (Sender Policy Framework)** is an email authentication protocol that allows domain owners to specify which "
        "mail servers are authorized to send emails on behalf of their domain. It is published as a TXT record in the DNS.\n\n"
        "When an email server receives a message, it checks the SPF record of the sender's domain to verify if the sending server is authorized. "
        "This helps prevent attackers from easily spoofing the envelope sender domain."
    ),
    "dkim": (
        "**DKIM (DomainKeys Identified Mail)** is an email authentication method that adds a digital cryptographic signature "
        "to emails. It ensures that the email was indeed sent by the domain owner and has not been altered or tampered with "
        "in transit.\n\n"
        "It uses public/private key cryptography, where the public key is hosted in the domain's DNS and the private key signs the headers."
    ),
    "dmarc": (
        "**DMARC (Domain-based Message Authentication, Reporting, and Conformance)** is a powerful email validation system "
        "that builds on SPF and DKIM. It allows the domain owner to define how the receiver should handle emails that fail "
        "SPF or DKIM validation (e.g., do nothing, quarantine in spam, or reject entirely).\n\n"
        "DMARC prevents domain spoofing and provides feedback reporting to domain owners about who is sending mail using their domain."
    ),
    "mfa": (
        "**Multi-Factor Authentication (MFA)** is a security protocol that requires users to provide two or more verification "
        "factors to gain access to an account (e.g., a password plus a temporary SMS code or an authenticator app prompt).\n\n"
        "MFA is highly effective: even if a phisher steals your password, they cannot access your account without your physical authentication device!"
    ),
    "remediation": (
        "If you suspect or click a phishing link, follow these immediate security steps:\n"
        "1. **Change passwords** immediately for the affected account and any other account sharing that password.\n"
        "2. **Enable Multi-Factor Authentication (MFA)** on all your critical applications.\n"
        "3. **Run a full antivirus scan** on your device to check for malware/keyloggers.\n"
        "4. **Report the email** to your system administrator or email provider.\n"
        "5. **Monitor your financial accounts** and credit reports for any suspicious activity."
    )
}

@app.get("/api/health")
def health_check():
    """
    Returns API health status and whether the Gemini API key is configured.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    return {
        "status": "healthy",
        "gemini_api_key_configured": api_key is not None and len(api_key) > 0,
        "mode": "Gemini 1.5 Flash (Hybrid)" if api_key else "Local Heuristics (Offline Fallback)"
    }

@app.post("/api/analyze/text")
def analyze_text(request: TextScanRequest):
    """
    Analyzes raw email subject and body text.
    """
    if not request.subject.strip() and not request.body.strip():
        raise HTTPException(status_code=400, detail="Subject and body content cannot be empty.")
    
    try:
        results = scan_email(
            subject=request.subject,
            body=request.body,
            html_body=""
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/api/analyze/file")
async def analyze_file(file: UploadFile = File(...)):
    """
    Accepts uploaded .eml or .txt files, parses them, and runs the scan pipeline.
    """
    if not file.filename.endswith(('.eml', '.txt')):
        raise HTTPException(status_code=400, detail="Only .eml or .txt files are supported.")
    
    try:
        content_bytes = await file.read()
        
        if file.filename.endswith('.eml'):
            # Parse full EML structures (headers, parts, attachments)
            headers, body_text, body_html, attachments, header_audit = parse_eml_file(content_bytes)
            
            # Run scan pipeline
            analysis = scan_email(
                subject=headers.get("Subject", ""),
                body=body_text,
                html_body=body_html,
                header_audit=header_audit
            )
            
            # Merge file metadata into response
            analysis["headers"] = headers
            analysis["attachments"] = attachments
            analysis["header_audit"] = header_audit
            analysis["filename"] = file.filename
            
            return analysis
        else:
            # Parse .txt as plain email content
            text_content = content_bytes.decode('utf-8', errors='ignore')
            # Extract subject if standard 'Subject:' line exists
            subject = "Scanned Plain Text File"
            body = text_content
            
            subject_match = re.match(r'^Subject:\s*(.*)$', text_content, re.IGNORECASE | re.MULTILINE)
            if subject_match:
                subject = subject_match.group(1)
                body = re.sub(r'^Subject:\s*.*$', '', text_content, count=1, flags=re.IGNORECASE | re.MULTILINE).strip()
            
            analysis = scan_email(subject=subject, body=body)
            analysis["filename"] = file.filename
            analysis["attachments"] = []
            
            return analysis
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File parsing failed: {str(e)}")

@app.post("/api/chat")
async def chat_interaction(request: ChatRequest):
    """
    Manages conversational responses. Utilizes Gemini if configured,
    otherwise resolves questions using high-fidelity local FAQ models.
    """
    user_msg = request.message.strip().lower()
    
    # Check for direct local matches first to give instant response
    for key, response_text in FAQ_RESPONSES.items():
        if key in user_msg:
            return {
                "message": response_text,
                "is_gemini": False
            }
            
    # Help guide the chat
    if any(help_term in user_msg for help_term in ["help", "capabilities", "what can you do", "commands"]):
        return {
            "message": (
                "I am **PhishShield AI**, your digital security assistant! Here is what I can do for you:\n\n"
                "1. **Analyze Emails:** Copy and paste an email, or drag-and-drop a `.eml`/`.txt` file into the chat to run a security audit.\n"
                "2. **Answer FAQs:** Ask me about technical email protocols like **SPF**, **DKIM**, **DMARC**, or general safety questions like **MFA**.\n"
                "3. **Cybersecurity Academy Quiz:** Test your security skills! Click the **'Launch Quiz Challenge'** in the left sidebar to start a mini-game and learn how to spot phishing."
            ),
            "is_gemini": False
        }

    # Greetings
    if any(greet in user_msg for greet in ["hello", "hi", "hey", "greetings", "good morning", "good afternoon", "good evening"]):
        return {
            "message": (
                "Hello! 👋 I am **PhishShield AI**, your digital security coordinator.\n\n"
                "How can I assist you today? You can:\n"
                "- Paste a suspicious email subject and body in the console inputs to perform a scan.\n"
                "- Ask me about security protocols (e.g., **SPF**, **DKIM**, **DMARC**, **MFA**).\n"
                "- Ask general security questions like **'how to avoid phishing'** or **'what are common signs'**."
            ),
            "is_gemini": False
        }

    # Identity
    if any(idn in user_msg for idn in ["who are you", "your name", "what do you do", "your purpose", "what is your role"]):
        return {
            "message": (
                "I am **PhishShield AI**, an elite incident response assistant specialized in protecting you against "
                "email threats, fraudulent links, and identity spoofing.\n\n"
                "I combine a fast rules-based local scanning suite (inspecting URL homographs, sender SPF/Reply-To headers, "
                "and bad TLDs) with high-fidelity conversational guidance. Feel free to paste any email you want audited!"
            ),
            "is_gemini": False
        }

    # Prevention / Stay Safe / Best practices
    if any(prev in user_msg for prev in ["how to prevent", "how to protect", "best practices", "prevention tips", "avoid phishing", "stay safe"]):
        return {
            "message": (
                "To protect yourself from email phishing attacks, establish these **core defensive behaviors**:\n\n"
                "- **Verify the Envelope Sender**: Legitimate organizations send mail from official registered domains (e.g., `paypal.com`), not lookalikes (e.g., `paypal-security-update.com`) or public providers (`@gmail.com`).\n"
                "- **Inspect Before Clicking**: Hover over links to check the true destination URL. Look out for raw IP addresses or suspicious TLDs (`.xyz`, `.buzz`).\n"
                "- **Decline Forced Urgency**: Phishers create artificial panic (e.g., 'Account suspended in 30 minutes!') to bypass critical thinking.\n"
                "- **Enforce Multi-Factor Authentication (MFA)**: Secure all accounts with MFA. Even if a phisher harvests your password, they will be blocked without your physical verification device."
            ),
            "is_gemini": False
        }

    # Appreciations
    if any(thanks in user_msg for thanks in ["thank you", "thanks", "awesome", "great", "cool", "helpful", "good job"]):
        return {
            "message": (
                "You are very welcome! 🛡️ Staying vigilant is the first line of digital defense.\n\n"
                "If you have another email to audit or want to ask more security questions, I am right here and ready!"
            ),
            "is_gemini": False
        }
        
    # Check if Gemini API is available for general chat
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        try:
            from google import genai
            from google.genai import types
            
            client = genai.Client(api_key=api_key)
            
            # Construct chat history contexts
            contents = []
            for turn in request.history[-6:]:  # Keep last 3 turns
                role = "user" if turn.get("role") == "user" else "model"
                contents.append(types.Content(
                    role=role,
                    parts=[types.Part.from_text(text=turn.get("content"))]
                ))
            
            contents.append(types.Content(
                role="user",
                parts=[types.Part.from_text(text=request.message)]
            ))
            
            system_instruction = (
                "You are PhishShield AI, a highly intelligent, friendly, and expert cybersecurity chatbot specializing in phishing, "
                "social engineering, and email security. Help users understand common cyberthreats, keep your language clean and "
                "accessible, and use markdown bullet points for readability. Keep responses concise and practical. Never advise clicking suspicious links."
            )
            
            response = client.models.generate_content(
                model="gemini-1.5-flash",
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.7
                )
            )
            return {
                "message": response.text.strip(),
                "is_gemini": True
            }
        except Exception as e:
            print(f"[ERROR] Gemini Chat generation failed: {e}")
            
    # Fallback default chatbot message
    return {
        "message": (
            "I parsed your question, but since my AI core is currently running in offline heuristic fallback, "
            "I could not generate a custom response. \n\n"
            "Try asking me about key terms like **phishing**, **SPF**, **DKIM**, **DMARC**, or **MFA** for direct interactive assistance!"
        ),
        "is_gemini": False
    }

@app.get("/api/quiz/questions")
def get_quiz():
    """
    Returns the complete list of cybersecurity quiz questions.
    """
    try:
        return get_all_questions()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not load quiz questions: {str(e)}")
