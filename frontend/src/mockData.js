export const DEFAULT_MESSAGES = [
  {
    id: "welcome-1",
    role: "bot",
    content: `Hello! I am **PhishShield AI**, your personal digital defense coordinator. My task is to inspect suspicious messages, identify social engineering patterns, audit technical headers, and scan dangerous links to protect you from cybersecurity threats.

**How to start?**
- **Paste an Email:** Provide the Subject and Body in the input area below.
- **Upload a File:** Drag-and-drop or click to upload a \`.eml\` or \`.txt\` email file.
- **Ask Questions:** Ask me about terms like **SPF**, **DKIM**, **DMARC**, **MFA**, or how to spot email forgery.

Try launching the **'Launch Quiz Challenge'** in the left panel to test your ability to spot phishers!`
  }
];

export const THREAT_TICKER_ITEMS = [
  {
    id: "t1",
    title: "Fake Netflix Subscription Suspension",
    tactic: "Urgency / Financial Bait",
    severity: "Critical",
    timestamp: "12 mins ago",
    target: "Consumers"
  },
  {
    id: "t2",
    title: "IRS Refund Form 1040 scam",
    tactic: "Authority / Tax Refund Lure",
    severity: "Critical",
    timestamp: "45 mins ago",
    target: "US Citizens"
  },
  {
    id: "t3",
    title: "DocuSign impersonation signing request",
    tactic: "Brand Imitation / Deceptive Hrefs",
    severity: "High",
    timestamp: "1 hr ago",
    target: "Corporate Employees"
  },
  {
    id: "t4",
    title: "Coinbase Security Verification scam",
    tactic: "Credential Harvesting / IP Host",
    severity: "High",
    timestamp: "3 hrs ago",
    target: "Crypto Holders"
  },
  {
    id: "t5",
    title: "Office 365 Password Expiry notice",
    tactic: "Artificial Urgency / Spoofed Domain",
    severity: "Critical",
    timestamp: "5 hrs ago",
    target: "Corporate Networks"
  }
];

export const PHISHING_TIPS = [
  {
    id: "tip-1",
    title: "Inspect the From Header Domain",
    detail: "Never trust the Display Name alone. Click on it to inspect the actual sending domain after the '@'. Legitimate companies will send emails from their official domains, not lookalikes (e.g., support-paypal.com) or free mail domains (gmail.com)."
  },
  {
    id: "tip-2",
    title: "Examine Link Destinations (Hover First)",
    detail: "Before clicking any link, hover your cursor over it to preview the actual destination URL in the browser status bar. Phishers often write legitimate-looking text but link it to credential-harvesting pages or malicious IP addresses."
  },
  {
    id: "tip-3",
    title: "Watch out for Forced Urgency",
    detail: "Scammers create artificial urgency ('Act in 24 hours!', 'Account suspended immediately') to induce fear and panic. This bypasses your critical reasoning. Legitimate organizations rarely impose immediate, draconian deadlines."
  },
  {
    id: "tip-4",
    title: "Be Wary of Generic Greetings",
    detail: "Phrases like 'Dear Customer', 'Dear Account Holder', or 'Dear valued member' indicate mass spam distributions. Legitimate institutions you have accounts with will almost always address you by your registered full name."
  }
];
