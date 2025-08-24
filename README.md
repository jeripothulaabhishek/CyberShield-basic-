# 🛡️ CyberShield – Smart Phishing & Malicious URL Detector  

CyberShield is a **real-time web security scanner** that helps detect **phishing links, malware URLs, suspicious domains, and dangerous file downloads**.  
It uses a mix of **heuristics**, **pattern analysis**, and **security APIs** (PhishTank, Google Safe Browsing) to protect users from malicious websites.  

---

## ✨ Features  

✅ **Heuristic Analysis** – Detects suspicious keywords (`login`, `verify`, `bank`, `free`, etc.), risky TLDs (`.tk`, `.xyz`, `.ru`), obfuscated URLs, and dangerous file extensions (`.exe`, `.zip`, `.js`, etc.).  

✅ **API Integration** – Cross-checks URLs with:  
- [PhishTank API](https://phishtank.org/)  
- [Google Safe Browsing API](https://developers.google.com/safe-browsing)  

✅ **Website Info Preview** – Fetches and displays website **title, description, and favicon** before visiting.  

✅ **Scan History** – Keeps track of scanned URLs (with localStorage persistence).  

✅ **Cache System** – Saves scan results for faster re-checks.  

✅ **Interactive UI** – Loader animation, risk messages (`Safe ✅`, `⚠️ Suspicious`, `🚨 Dangerous`), and history table with fade-in effect.  

✅ **Clear History Option** – Easily remove old scans from storage.  

---

## 🚀 Demo  

- Enter a URL (e.g., `https://example.com`)  
- Click **Scan**  
- Get results with threat level + website info  

![screenshot-placeholder](https://via.placeholder.com/800x400?text=CyberShield+UI+Preview)  

---

## 🛠️ Tech Stack  

- **Frontend:** HTML, CSS, JavaScript  
- **APIs:** PhishTank, Google Safe Browsing, AllOrigins Proxy  
- **Storage:** Browser LocalStorage  

---

## 📂 Project Structure  

cybershield/
├── client/
│ ├── index.html # Scanner UI
│ ├── style.css # Main styles
│ ├── script.js # Core logic (scanning + heuristics + API calls)
👨‍💻 Author

Abhishek
🐙 GitHub