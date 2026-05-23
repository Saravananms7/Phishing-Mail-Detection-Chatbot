QUIZ_QUESTIONS = [
    {
        "id": 1,
        "title": "Netflix Account Suspension Alert",
        "sender": "Netflix Support <no-reply@suspension-netflix.com>",
        "subject": "Urgent: Your subscription is about to be terminated",
        "body": "Dear Customer,\n\nWe were unable to process your monthly subscription payment. As a result, your account has been temporarily suspended. To restore access, please click the link below within 24 hours to update your billing credentials:\n\nhttps://netflix.com/restore-billing-portal\n\nIf you do not update your details, your account will be permanently deactivated.\n\nSincerely,\nNetflix Billing Team",
        "options": ["Phishing Email", "Legitimate Email"],
        "correct_answer": 0,
        "explanation": "This is a Phishing Email! Several major red flags are present:\n1. **Sender Domain Mismatch**: The email domain is 'suspension-netflix.com', which is a lookalike domain, NOT the official 'netflix.com'.\n2. **Deceptive Link Mismatch**: The visible text of the link says 'netflix.com/...', but in a real attack, hovering over it would reveal it redirects to a different malicious server.\n3. **Extreme Urgency**: It demands action within 24 hours and threatens permanent account deactivation to induce panic.",
        "difficulty": "Easy"
    },
    {
        "id": 2,
        "title": "Google Security Alert",
        "sender": "Google Security <no-reply@accounts.google.com>",
        "subject": "Security alert: New login detected on Chrome",
        "body": "A new sign-in was detected on your Google Account from a Windows device in London, UK. \n\nIf this was you, no action is needed. If this wasn't you, please check your recent activity and secure your account immediately via the Google Security console at:\n\nhttps://myaccount.google.com/security-checkup\n\nGoogle Security Team",
        "options": ["Phishing Email", "Legitimate Email"],
        "correct_answer": 1,
        "explanation": "This is a Legitimate Email! Here is why:\n1. **Official Sender Domain**: The email originates from 'accounts.google.com', which is Google's official subdomain.\n2. **Clean Link destination**: The URL points directly to Google's official security hub 'myaccount.google.com'.\n3. **No Coercion**: It doesn't use hostile language or demand password input. It simply alerts you and leaves verification to your discretion.",
        "difficulty": "Medium"
    },
    {
        "id": 3,
        "title": "Bank Wire Transfer Notification",
        "sender": "Chase Alerts <wire-notification@chase-secure-banking.net>",
        "subject": "Notice: Pending outgoing wire transfer of $4,500.00",
        "body": "Dear Customer,\n\nA pending wire transfer in the amount of $4,500.00 to receiver 'Mr. Boris Kovak' has been initiated from your checking account. This transaction is currently on hold for security verification.\n\nIf you DID NOT authorize this wire transfer, you MUST cancel it immediately to prevent funds disbursement. Click here to abort this transfer and secure your checking account:\n\nhttp://192.168.4.12/cancel-wire-txn\n\nFailure to cancel within 30 minutes will result in final execution of the transfer.\n\nChase Security Dept.",
        "options": ["Phishing Email", "Legitimate Email"],
        "correct_answer": 0,
        "explanation": "This is a Phishing Email! It contains multiple critical red flags:\n1. **IP Address Link**: The cancellation link directs to a raw IP address ('http://192.168.4.12/...'), which no legitimate bank ever does.\n2. **Lookalike Sender**: The sender domain is 'chase-secure-banking.net', which is a lookalike domain spoofing the brand Chase.\n3. **High Financial Fear Lure**: It uses a shocking transaction warning and an extremely short deadline (30 minutes) to scare the recipient into clicking the link immediately without thinking.",
        "difficulty": "Easy"
    },
    {
        "id": 4,
        "title": "Routine Corporate IT MFA Policy",
        "sender": "IT Support Desk <it-help@company-internal.com>",
        "subject": "System Upgrade: Setting up Multi-Factor Authentication (MFA)",
        "body": "Hello Everyone,\n\nAs part of our commitment to safeguarding corporate data, the IT department is rolling out an updated Multi-Factor Authentication (MFA) policy. Starting next Tuesday, all employees will be prompted to register their mobile devices on the identity portal.\n\nPlease refer to the internal documentation page on the corporate intranet at:\nhttps://intranet.company-internal.com/it/mfa-setup.html\n\nIf you have any questions or require hands-on assistance, please stop by the IT helpdesk on the 3rd floor or open a ticket in the ticketing portal.\n\nThanks,\nIT Security Ops",
        "options": ["Phishing Email", "Legitimate Email"],
        "correct_answer": 1,
        "explanation": "This is a Legitimate Email! Here is why:\n1. **Internal Domain**: It originates from 'company-internal.com', which represents the official corporate domain.\n2. **Intranet Links**: The link points to an internal intranet site ('intranet.company-internal.com').\n3. **Local Alternatives**: It suggests concrete, real-world contact channels, like visiting the physical helpdesk on the 3rd floor, which a remote phisher could never offer.",
        "difficulty": "Hard"
    },
    {
        "id": 5,
        "title": "DocuSign Shared Purchase Agreement",
        "sender": "DocuSign Envelope Service <docusign@docusign-contracts-sign.info>",
        "subject": "Signature Requested: Purchase Agreement and NDA",
        "body": "Dear User,\n\nMr. Robert Vance has sent you a document for review and electronic signature. Please review and sign the attached Purchase Agreement and Non-Disclosure Agreement as soon as possible to conclude the current business transaction.\n\nClick the link below to access your secure DocuSign envelope:\n\nhttps://docusign.com/signing-envelope-09419\n\nDo not share this link. Thank you for choosing DocuSign.\n\nDocuSign Inc.",
        "options": ["Phishing Email", "Legitimate Email"],
        "correct_answer": 0,
        "explanation": "This is a Phishing Email! It is a very sophisticated attack:\n1. **Lookalike TLD & Domain**: The sender is 'docusign-contracts-sign.info', using a cheap/suspicious TLD (.info) and lookalike keywords, NOT the official 'docusign.com'.\n2. **Deceptive Link**: The text displays 'docusign.com/...', but in the actual email, the hidden HTML href points to the attacker's harvesting page.\n3. **Generic greeting**: It addresses you as 'Dear User' instead of your real name, which is common in automated spear-phishing campaigns.",
        "difficulty": "Hard"
    }
]

def get_all_questions():
    """
    Returns the complete list of educational quiz questions, removing answers for initial delivery.
    """
    safe_questions = []
    for q in QUIZ_QUESTIONS:
        safe_q = q.copy()
        # Keep explanation and answer hidden if we were doing a real state-locked challenge,
        # but for our simple client-side local interactive mode, we can supply it all and let
        # the client handle UI transitions! It is more performant and cleaner.
        safe_questions.append(safe_q)
    return safe_questions
