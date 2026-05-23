import re
import os
import json
import difflib
from urllib.parse import urlparse
from bs4 import BeautifulSoup
from email import message_from_bytes, message_from_file
from email.policy import default
from google import genai
from google.genai import types

# Predefined famous brands susceptible to spoofing
FAMOUS_BRANDS = {
    "paypal": "paypal.com",
    "google": "google.com",
    "gmail": "gmail.com",
    "microsoft": "microsoft.com",
    "outlook": "outlook.com",
    "apple": "apple.com",
    "amazon": "amazon.com",
    "netflix": "netflix.com",
    "chase": "chase.com",
    "wellsfargo": "wellsfargo.com",
    "bankofamerica": "bankofamerica.com",
    "bofa": "bankofamerica.com",
    "citi": "citi.com",
    "citibank": "citi.com",
    "facebook": "facebook.com",
    "instagram": "instagram.com",
    "linkedin": "linkedin.com",
    "twitter": "twitter.com",
    "x": "x.com",
    "yahoo": "yahoo.com",
    "dropbox": "dropbox.com",
    "docusign": "docusign.com",
    "adobe": "adobe.com",
    "binance": "binance.com",
    "coinbase": "coinbase.com",
    "steam": "steampowered.com",
    "steamcommunity": "steamcommunity.com",
    "fedex": "fedex.com",
    "ups": "ups.com",
    "dhl": "dhl.com"
}

# Suspicious top-level domains (TLDs)
SUSPICIOUS_TLDS = {
    "xyz", "top", "club", "info", "work", "click", "buzz", "gq", "cf", "tk", "ml", "ga", 
    "date", "loan", "win", "bid", "men", "racing", "download", "stream", "trade", "account"
}

# Heuristic category phrases (lowercase for case-insensitive matching)
PHISHING_PHRASES = {
    "urgency": [
        "urgent", "immediate action", "act fast", "within 24 hours", "hours left", 
        "expire", "suspension", "terminated", "critical alert", "final warning",
        "action required", "consequences", "immediately", "hurry"
    ],
    "threat_fear": [
        "account suspended", "unauthorized access", "suspicious activity", "security breach",
        "deactivated", "compromised", "restrict access", "legal action", "law enforcement",
        "penalty", "fine", "arrest", "locked"
    ],
    "financial": [
        "lottery", "inheritance", "refund pending", "tax refund", "wire transfer", 
        "won", "millions", "invoice attached", "unpaid invoice", "bonus", "winner",
        "claims your fund", "crypto", "bitcoin", "earnings", "payout"
    ],
    "credentials": [
        "verify your account", "update password", "log in to restore", "confirm identity",
        "click here to login", "billing details", "credential verification", "reset request",
        "security question", "validate credentials", "access code", "two-factor update"
    ]
}

def extract_registered_domain(hostname):
    """
    Extracts a basic registered domain (domain.tld) from a hostname.
    Note: A simple implementation for lookups.
    """
    if not hostname:
        return ""
    parts = hostname.lower().split('.')
    if len(parts) <= 2:
        return hostname.lower()
    
    # Handle double TLDs like co.uk, com.au, etc.
    if parts[-2] in ["com", "co", "org", "net", "gov", "edu", "mil"] and len(parts) > 2:
        return ".".join(parts[-3:])
    return ".".join(parts[-2:])

def analyze_url(url, display_text=""):
    """
    Performs rich static analysis on a URL.
    Returns diagnostic flags and descriptions.
    """
    analysis = {
        "url": url,
        "display_text": display_text,
        "is_suspicious": False,
        "flags": []
    }
    
    # Parse URL
    try:
        parsed = urlparse(url)
        scheme = parsed.scheme.lower()
        netloc = parsed.netloc.lower()
    except Exception:
        analysis["is_suspicious"] = True
        analysis["flags"].append({
            "type": "malformed_url",
            "severity": "High",
            "desc": f"The URL '{url}' is malformed and could not be parsed."
        })
        return analysis

    if not netloc:
        return analysis

    # 1. Check Scheme
    if scheme == "http":
        analysis["flags"].append({
            "type": "unsecured_protocol",
            "severity": "Medium",
            "desc": "Uses unsecured 'http://' protocol instead of encrypted 'https://'."
        })

    # 2. Check IP Address Host
    # Simple regex for IPv4
    if re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', netloc):
        analysis["is_suspicious"] = True
        analysis["flags"].append({
            "type": "ip_address_host",
            "severity": "High",
            "desc": f"The URL hosts a raw IP address ({netloc}) instead of a registered domain. Legit brands never do this."
        })

    # 3. Check Suspicious TLD
    tld = netloc.split('.')[-1]
    if tld in SUSPICIOUS_TLDS:
        analysis["is_suspicious"] = True
        analysis["flags"].append({
            "type": "suspicious_tld",
            "severity": "Medium",
            "desc": f"Uses a low-reputation or suspicious Top-Level Domain (.{tld})."
        })

    # 4. Check Subdomain Sprawl
    subdomain_count = len(netloc.split('.')) - 2
    if subdomain_count >= 4:
        analysis["is_suspicious"] = True
        analysis["flags"].append({
            "type": "subdomain_sprawl",
            "severity": "Medium",
            "desc": f"Excessive subdomains ({subdomain_count}) are often used to hide the true registered domain (e.g. login.brand.com.malicioussite.net)."
        })

    # 5. Lookalike Brand / Homograph Attack
    registered_domain = extract_registered_domain(netloc)
    domain_body = registered_domain.split('.')[0] if '.' in registered_domain else registered_domain
    
    # Check if a famous brand name is embedded in the subdomain/path but is NOT the true domain
    for brand, brand_domain in FAMOUS_BRANDS.items():
        # Check if the brand name is present in netloc but the registered domain is NOT the brand domain
        if brand in netloc and registered_domain != brand_domain:
            analysis["is_suspicious"] = True
            analysis["flags"].append({
                "type": "brand_impersonation",
                "severity": "High",
                "desc": f"Impersonates a reputable brand: The URL contains '{brand}' but the actual destination domain is '{registered_domain}' (not '{brand_domain}')."
            })
            break
        
        # Check for homograph similarity (e.g. paypal vs paypa1, wellsfargo vs wellsfarg0)
        if domain_body != brand:
            # SequenceMatcher ratio
            ratio = difflib.SequenceMatcher(None, brand, domain_body).ratio()
            if 0.75 <= ratio < 1.0:
                analysis["is_suspicious"] = True
                analysis["flags"].append({
                    "type": "homograph_lookalike",
                    "severity": "High",
                    "desc": f"Lookalike domain detected: '{registered_domain}' is highly similar to the official brand '{brand}' ({int(ratio*100)}% match)."
                })
                break

    # 6. Text-to-Href Mismatch
    if display_text:
        display_text_clean = display_text.strip().lower()
        # If display text looks like a URL/domain
        if re.search(r'\.[a-z]{2,}', display_text_clean):
            # Try to see if it points to a different domain
            disp_match = re.search(r'([a-z0-9\-]+\.[a-z0-9\-]+(?:\.[a-z]+)?)', display_text_clean)
            if disp_match:
                disp_domain = disp_match.group(1)
                href_domain = registered_domain
                if disp_domain not in href_domain and href_domain not in disp_domain:
                    analysis["is_suspicious"] = True
                    analysis["flags"].append({
                        "type": "url_mismatch",
                        "severity": "High",
                        "desc": f"Deceptive Link: The visible text displays a trusted link ({display_text}), but clicking it redirects to a completely different destination ({netloc})."
                    })

    if len(analysis["flags"]) > 0:
        analysis["is_suspicious"] = True
        
    return analysis


def analyze_heuristics_local(subject, body, urls_analysis):
    """
    Robust local fallback scanner utilizing keywords and URL properties.
    """
    full_text = f"{subject} \n {body}".lower()
    
    detected_phrases = {}
    total_matches = 0
    
    for category, phrases in PHISHING_PHRASES.items():
        detected_phrases[category] = []
        for phrase in phrases:
            # Look for word boundaries or direct matching
            matches = re.findall(rf'\b{phrase}\b', full_text)
            if matches:
                detected_phrases[category].append({
                    "phrase": phrase,
                    "count": len(matches)
                })
                total_matches += len(matches)

    # Calculate NLP risk components
    # We assign weights to different categories
    cat_scores = {
        "urgency": len(detected_phrases["urgency"]) * 12,
        "threat_fear": len(detected_phrases["threat_fear"]) * 15,
        "financial": len(detected_phrases["financial"]) * 10,
        "credentials": len(detected_phrases["credentials"]) * 18
    }
    
    text_risk = min(sum(cat_scores.values()), 85) # Cap local text-only risk at 85%
    
    # Calculate URL risk components
    suspicious_urls = [u for u in urls_analysis if u["is_suspicious"]]
    url_risk = 0
    if urls_analysis:
        high_severity_flags = 0
        med_severity_flags = 0
        for u in suspicious_urls:
            for flag in u["flags"]:
                if flag["severity"] == "High":
                    high_severity_flags += 1
                elif flag["severity"] == "Medium":
                    med_severity_flags += 1
        
        if high_severity_flags > 0:
            url_risk = min(50 + (high_severity_flags * 15), 100)
        elif med_severity_flags > 0:
            url_risk = min(25 + (med_severity_flags * 10), 75)
    
    # Combine risks
    if url_risk > 0:
        overall_risk = int(max(text_risk * 0.4 + url_risk * 0.6, url_risk))
    else:
        overall_risk = int(text_risk)
        
    # Make overall risk within 0-100
    overall_risk = max(0, min(overall_risk, 100))
    
    if overall_risk >= 70:
        verdict = "Danger"
    elif overall_risk >= 30:
        verdict = "Suspicious"
    else:
        verdict = "Safe"
        
    # Generate list of text highlights
    key_indicators = []
    for cat, matches in detected_phrases.items():
        for m in matches:
            phrase = m["phrase"]
            desc = f"Phishing indicator in the '{cat}' category. Attackers use this to manipulate your behavior."
            if cat == "urgency":
                desc = "Urgency trigger: Creates panic to bypass critical reasoning."
            elif cat == "threat_fear":
                desc = "Threat trigger: Uses fear of account suspension/penalties to force action."
            elif cat == "financial":
                desc = "Financial lure: Promises refunds, lotteries, or payouts to entice clicks."
            elif cat == "credentials":
                desc = "Credential harvest lure: Prompting for verification or logins on insecure destinations."
            
            key_indicators.append({
                "excerpt": phrase,
                "analysis": desc
            })
            
    # Map categories to social engineering tactics
    tactics = []
    if len(detected_phrases["urgency"]) > 0:
        tactics.append("Creating Artificial Urgency")
    if len(detected_phrases["threat_fear"]) > 0:
        tactics.append("Exploiting Fear or Authority Spoofing")
    if len(detected_phrases["financial"]) > 0:
        tactics.append("Financial Lures & Unsolicited Rewards")
    if len(detected_phrases["credentials"]) > 0:
        tactics.append("Credential Harvesting Traps")
        
    return {
        "risk_score": overall_risk,
        "verdict": verdict,
        "social_engineering_tactics": tactics if tactics else ["None Identified"],
        "key_indicators": key_indicators,
        "is_fallback": True
    }


def parse_eml_file(file_content_bytes):
    """
    Parses EML binary content.
    Extracts headers, attachments list, and text/html bodies.
    """
    msg = message_from_bytes(file_content_bytes, policy=default)
    
    # Extract basic headers
    headers = {
        "Subject": msg.get("Subject", "(No Subject)"),
        "From": msg.get("From", ""),
        "To": msg.get("To", ""),
        "Date": msg.get("Date", ""),
        "Return-Path": msg.get("Return-Path", ""),
        "Reply-To": msg.get("Reply-To", ""),
        "Message-ID": msg.get("Message-ID", ""),
    }
    
    # Extract body and attachments
    body_text = ""
    body_html = ""
    attachments = []
    
    for part in msg.walk():
        content_type = part.get_content_type()
        content_disposition = part.get("Content-Disposition", "")
        
        # Check for attachment
        if "attachment" in content_disposition or part.get_filename():
            filename = part.get_filename() or "unnamed_attachment"
            size = len(part.get_payload(decode=True) or b"")
            
            # File safety assessment
            ext = filename.split('.')[-1].lower() if '.' in filename else ""
            safety = "Safe"
            reason = "Standard non-executable file format."
            
            dangerous_extensions = {
                "exe", "scr", "bat", "pif", "lnk", "vbs", "js", "ps1", "wsf", "hta", "docm", "xlsm", "jar"
            }
            compressed_extensions = {
                "zip", "rar", "7z", "iso", "img", "cab", "tar", "gz"
            }
            
            if ext in dangerous_extensions:
                safety = "Dangerous"
                reason = f"Executable or active script format (.{ext}). Can execute malware immediately upon opening."
            elif ext in compressed_extensions:
                safety = "Suspicious"
                reason = f"Compressed archive format (.{ext}). Phishers use archives to conceal malicious executables from scanners."
                
            attachments.append({
                "filename": filename,
                "size_bytes": size,
                "extension": ext,
                "safety": safety,
                "reason": reason
            })
            continue

        # Extract text bodies
        if content_type == "text/plain":
            try:
                body_text += part.get_payload(decode=True).decode(part.get_content_charset() or 'utf-8', errors='ignore')
            except Exception:
                pass
        elif content_type == "text/html":
            try:
                body_html += part.get_payload(decode=True).decode(part.get_content_charset() or 'utf-8', errors='ignore')
            except Exception:
                pass

    # If only HTML body was found, extract text
    if not body_text and body_html:
        soup = BeautifulSoup(body_html, "html.parser")
        body_text = soup.get_text(separator='\n')

    # Audit headers for basic discrepancies
    header_audit = {
        "is_suspicious": False,
        "flags": []
    }
    
    # 1. From & Return-Path Check
    from_header = headers["From"]
    return_path = headers["Return-Path"]
    
    # Extract email addresses using regex
    from_email_match = re.search(r'<([^>]+)>', from_header) or re.search(r'([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', from_header)
    return_email_match = re.search(r'<([^>]+)>', return_path) or re.search(r'([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', return_path)
    
    from_email = from_email_match.group(1) if from_email_match else ""
    return_email = return_email_match.group(1) if return_email_match else ""
    
    if from_email and return_email:
        from_domain = from_email.split('@')[-1].lower()
        return_domain = return_email.split('@')[-1].lower()
        
        # If domains don't match, this is highly suspicious (possible spoofing)
        if from_domain != return_domain:
            header_audit["is_suspicious"] = True
            header_audit["flags"].append({
                "type": "sender_domain_mismatch",
                "severity": "High",
                "desc": f"Sender envelope mismatch: The email displays as from '{from_domain}', but returns bounces to '{return_domain}'. Attackers use this to fake their identity."
            })
            
    # 2. Reply-To & From mismatch
    reply_to = headers["Reply-To"]
    reply_email_match = re.search(r'<([^>]+)>', reply_to) or re.search(r'([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', reply_to)
    reply_email = reply_email_match.group(1) if reply_email_match else ""
    
    if from_email and reply_email and from_email.lower() != reply_email.lower():
        reply_domain = reply_email.split('@')[-1].lower()
        from_domain = from_email.split('@')[-1].lower()
        # If domain or target is free service like gmail claiming to be from Chase
        free_providers = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "protonmail.com", "aol.com"]
        if reply_domain in free_providers and from_domain not in free_providers:
            header_audit["is_suspicious"] = True
            header_audit["flags"].append({
                "type": "deceptive_reply_to",
                "severity": "High",
                "desc": f"Deceptive Reply-To: This mail claims to be from '{from_domain}', but replies are redirected to a free public address ({reply_email})."
            })
            
    return headers, body_text, body_html, attachments, header_audit


def scan_email(subject, body, html_body="", header_audit=None):
    """
    Main analysis pipeline.
    1. Extracts and audits links.
    2. Invokes Gemini 1.5 Flash if GEMINI_API_KEY is active.
    3. Falls back to a local heuristic pipeline if Gemini fails or is unconfigured.
    """
    # 1. URL Analysis
    urls = []
    
    # Extract links from HTML if available
    if html_body:
        soup = BeautifulSoup(html_body, "html.parser")
        for a_tag in soup.find_all('a', href=True):
            href = a_tag['href']
            text = a_tag.get_text()
            # Avoid repeating exactly identical hrefs
            if href.startswith(('http://', 'https://')):
                urls.append((href, text))
                
    # Extract raw text links with regex just in case
    raw_urls = re.findall(r'(https?://[^\s>"\']+)', body)
    for ru in raw_urls:
        # Strip trailing punctuation common in regex matches
        ru_clean = ru.rstrip('.,:;!?()[]{}')
        # If not already extracted from HTML
        if not any(u[0] == ru_clean for u in urls):
            urls.append((ru_clean, ""))

    # Analyze URLs
    urls_analysis = []
    for href, text in urls:
        urls_analysis.append(analyze_url(href, text))

    # Check for GEMINI_API_KEY
    api_key = os.getenv("GEMINI_API_KEY")
    
    if api_key:
        try:
            # Initialize official GenAI SDK
            client = genai.Client(api_key=api_key)
            
            # Format inputs for Gemini
            email_payload = {
                "subject": subject,
                "body_content": body[:8000],  # Truncate to preserve safety
                "extracted_links": [{"url": u["url"], "text": u["display_text"], "is_suspicious": u["is_suspicious"], "flags": [f["desc"] for f in u["flags"]]} for u in urls_analysis]
            }
            
            system_prompt = (
                "You are an elite, highly technical Phishing Incident Response Engineer. Your role is to perform a rigorous "
                "security audit on the provided email to detect phishing, business email compromise (BEC), malware lures, "
                "or social engineering. You must evaluate the headers, body text, and links. You are highly efficient and "
                "rational. Your output must be a valid, structured JSON object with exactly the following keys. Do not "
                "add markdown formatting outside of JSON (or wrap the JSON in ```json blocks, that is fine). The keys are:\n"
                "1. 'risk_score': An integer from 0 to 100 expressing absolute phishing risk.\n"
                "2. 'verdict': String: 'Safe' (0-29), 'Suspicious' (30-69), or 'Danger' (70-100).\n"
                "3. 'social_engineering_tactics': A list of identified psychological manipulation tactics (e.g., 'Artificial Urgency', 'Authority Lure', 'Fear Appeal', etc.).\n"
                "4. 'key_indicators': A list of JSON objects, each with 'excerpt' (exact suspicious phrase/indicator) and 'analysis' (why it is a lure).\n"
                "5. 'remediation_steps': A list of actionable bullet points instructing a user on how to handle this email safely."
            )
            
            prompt = (
                f"Perform a complete security audit on this email payload:\n{json.dumps(email_payload, indent=2)}\n\n"
                "Ensure your assessment is fully analytical, accurate, and identifies lookalike URLs and psychological pressure."
            )
            
            # Request structured JSON content
            response = client.models.generate_content(
                model="gemini-1.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    response_mime_type="application/json",
                    temperature=0.1
                )
            )
            
            # Parse the JSON response
            raw_response = response.text.strip()
            # Clean up markdown fences if present
            if raw_response.startswith("```json"):
                raw_response = raw_response[7:]
            if raw_response.endswith("```"):
                raw_response = raw_response[:-3]
            raw_response = raw_response.strip()
            
            llm_result = json.loads(raw_response)
            
            # Build structured return object
            return {
                "risk_score": max(0, min(int(llm_result.get("risk_score", 0)), 100)),
                "verdict": llm_result.get("verdict", "Suspicious"),
                "social_engineering_tactics": llm_result.get("social_engineering_tactics", []),
                "key_indicators": llm_result.get("key_indicators", []),
                "remediation_steps": llm_result.get("remediation_steps", []),
                "urls_analysis": urls_analysis,
                "is_fallback": False
            }
            
        except Exception as e:
            # Log error internally and trigger fallback
            print(f"[ERROR] Gemini API scan failed, falling back to local heuristics: {e}")
            
    # Heuristic fallback pipeline
    fallback_result = analyze_url_and_heuristics_fallback(subject, body, urls_analysis, header_audit)
    return fallback_result


def analyze_url_and_heuristics_fallback(subject, body, urls_analysis, header_audit=None):
    """
    Orchestrator for fallback analysis combining local heuristics and header inspections.
    """
    analysis = analyze_heuristics_local(subject, body, urls_analysis)
    
    # Adjust score if technical headers have critical flags
    if header_audit and header_audit["is_suspicious"]:
        has_high_header = any(f["severity"] == "High" for f in header_audit["flags"])
        if has_high_header:
            analysis["risk_score"] = min(analysis["risk_score"] + 30, 100)
            if analysis["risk_score"] >= 70:
                analysis["verdict"] = "Danger"
            elif analysis["risk_score"] >= 30:
                analysis["verdict"] = "Suspicious"
                
            # Insert header alert into social engineering/indicators
            analysis["social_engineering_tactics"].append("Technical Identity Spoofing")
            for flag in header_audit["flags"]:
                analysis["key_indicators"].append({
                    "excerpt": f"Header Field Discrepancy: {flag['type']}",
                    "analysis": flag["desc"]
                })
                
    # Generate generic remediation steps based on verdict
    remediation_steps = [
        "Do NOT click on any links inside this email unless you have verified the sender via another independent channel.",
        "Check the sender's actual email domain by clicking/tapping their display name.",
        "Do NOT download or open any attachments associated with this message."
    ]
    if analysis["verdict"] == "Danger":
        remediation_steps.extend([
            "Mark this email as phishing and delete it immediately.",
            "Report this incident to your organization's IT Security operations center."
        ])
    elif analysis["verdict"] == "Suspicious":
        remediation_steps.extend([
            "Confirm the transaction or request using the official website or customer support phone number.",
            "If in doubt, inspect URLs in a sandbox or safe browser preview before interacting."
        ])
    else:
        remediation_steps = [
            "This email appears typical and displays no immediate phishing indicators.",
            "Always remain cautious when entering credentials, regardless of the sender's apparent identity."
        ]
        
    analysis["remediation_steps"] = remediation_steps
    analysis["urls_analysis"] = urls_analysis
    return analysis
