import os
from analyzer import scan_email

def run_tests():
    print("==================================================")
    print("PHISHSHIELD SECURITY ANALYSIS ENGINE UNIT TESTS")
    print("==================================================")
    
    # Path to test files
    test_dir = "test_emails"
    
    # 1. Test Safe Email
    safe_path = os.path.join(test_dir, "safe_newsletter.txt")
    if os.path.exists(safe_path):
        with open(safe_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Simple subject & body parser
        lines = content.split('\n')
        subject = lines[0].replace("Subject:", "").strip()
        body = "\n".join(lines[1:]).strip()
        
        print("\n[TEST 1] Analyzing SAFE Email...")
        result = scan_email(subject, body)
        print(f"Risk Score: {result['risk_score']}%")
        print(f"Verdict: {result['verdict']}")
        print(f"Social Engineering: {result['social_engineering_tactics']}")
        
        # Verify
        assert result['risk_score'] < 30, f"Safe email scored too high: {result['risk_score']}%"
        assert result['verdict'] == "Safe", f"Safe email verdict is incorrect: {result['verdict']}"
        print("[SUCCESS] TEST 1 PASSED: Safe email identified correctly.")
    else:
        print("[FAILED] TEST 1 FAILED: test_emails/safe_newsletter.txt not found.")

    # 2. Test Phishing Chase Email
    chase_path = os.path.join(test_dir, "phishing_chase.txt")
    if os.path.exists(chase_path):
        with open(chase_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        lines = content.split('\n')
        subject = lines[0].replace("Subject:", "").strip()
        body = "\n".join(lines[1:]).strip()
        
        print("\n[TEST 2] Analyzing PHISHING Chase Email...")
        result = scan_email(subject, body)
        print(f"Risk Score: {result['risk_score']}%")
        print(f"Verdict: {result['verdict']}")
        print(f"Social Engineering: {result['social_engineering_tactics']}")
        print(f"Key indicators count: {len(result['key_indicators'])}")
        
        # Verify
        assert result['risk_score'] >= 60, f"Phishing email scored too low: {result['risk_score']}%"
        assert result['verdict'] in ["Suspicious", "Danger"], f"Phishing email verdict is incorrect: {result['verdict']}"
        assert any("ip address" in f['desc'].lower() for u in result['urls_analysis'] for f in u['flags']), "Failed to detect IP address link"
        print("[SUCCESS] TEST 2 PASSED: Phishing Chase email identified correctly.")
    else:
        print("[FAILED] TEST 2 FAILED: test_emails/phishing_chase.txt not found.")

    # 3. Test Phishing Netflix Email
    netflix_path = os.path.join(test_dir, "phishing_netflix.txt")
    if os.path.exists(netflix_path):
        with open(netflix_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        lines = content.split('\n')
        subject = lines[0].replace("Subject:", "").strip()
        body = "\n".join(lines[1:]).strip()
        
        print("\n[TEST 3] Analyzing PHISHING Netflix Email...")
        result = scan_email(subject, body)
        print(f"Risk Score: {result['risk_score']}%")
        print(f"Verdict: {result['verdict']}")
        print(f"Social Engineering: {result['social_engineering_tactics']}")
        
        # Verify
        assert result['risk_score'] >= 60, f"Phishing email scored too low: {result['risk_score']}%"
        assert result['verdict'] in ["Suspicious", "Danger"], f"Phishing email verdict is incorrect: {result['verdict']}"
        assert any("lookalike" in f['type'] or "impersonation" in f['type'] for u in result['urls_analysis'] for f in u['flags']), "Failed to detect lookalike Netflix link"
        print("[SUCCESS] TEST 3 PASSED: Phishing Netflix email identified correctly.")
    else:
        print("[FAILED] TEST 3 FAILED: test_emails/phishing_netflix.txt not found.")

    print("\n==================================================")
    print("ALL TESTS COMPLETED SUCCESSFULLY!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
