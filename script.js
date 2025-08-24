const scanBtn = document.getElementById("scanBtn");
const urlInput = document.getElementById("urlInput");
const resultBox = document.getElementById("result");
const loader = document.getElementById("loader");
const historyBody = document.getElementById("historyBody");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

// Website info elements
const websiteInfoBox = document.getElementById("websiteInfo");
const siteTitle = document.getElementById("siteTitle");
const siteDesc = document.getElementById("siteDesc");
const siteFavicon = document.getElementById("siteFavicon");

// ------------------- Heuristics -------------------
const suspiciousPatterns = [
  "login","verify","update","account","secure","bank","paypal",
  "free","bonus","gift","prize","winner","phish","confirm",
  "click","urgent","security-alert","password-reset","authenticate","signin","account-update",
  "eval","unescape","base64","redirect","download","script"
];
const suspiciousTLDs = [".tk",".xyz",".top",".zip",".cn",".ru",".info",".loan",".pw",".ml",".gq"];
const dangerousExtensions = [".exe",".scr",".bat",".cmd",".zip",".js",".vbs",".jar",".pif"];
const obfuscatedPatterns = [/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, /%[0-9A-Fa-f]{2}/, /\.(php|html?|asp|aspx)\?.*=/];

// Cache for performance
const cache = {};

// Load history from localStorage
const storedHistory = JSON.parse(localStorage.getItem("scanHistory")) || [];
storedHistory.forEach(h => addToHistory(h.url, h.statusClass, h.message, false));

// ------------------- Event Listeners -------------------
scanBtn.addEventListener("click", () => scanURL(urlInput.value));
urlInput.addEventListener("keypress", e => { if(e.key === "Enter") scanURL(urlInput.value); });

clearHistoryBtn.addEventListener("click", () => {
  if(confirm("Are you sure you want to clear all scan history?")){
    localStorage.removeItem("scanHistory");
    storedHistory.length = 0;
    historyBody.innerHTML = "";
  }
});

// ------------------- Main Scan Function -------------------
async function scanURL(url) {
  const normalizedUrl = normalizeURL(url);
  if (!normalizedUrl) return showResult("⚠️ Enter a valid URL!", "suspicious");

  if (cache[normalizedUrl]) {
    const cached = cache[normalizedUrl];
    showResult(cached.message, cached.statusClass, url);
    fetchWebsiteDetails(normalizedUrl);
    return;
  }

  loader.style.display = "block";
  resultBox.style.display = "none";
  websiteInfoBox.style.display = "none";

  setTimeout(async () => {
    loader.style.display = "none";

    let status = "Safe ✅";
    let statusClass = "safe";

    if(dangerousExtensions.some(ext => normalizedUrl.endsWith(ext))) { status = "🚨 Dangerous File Link!"; statusClass = "danger"; }
    else if(suspiciousTLDs.some(tld => normalizedUrl.endsWith(tld))) { status = "⚠️ Suspicious TLD Detected!"; statusClass = "suspicious"; }
    else if(suspiciousPatterns.some(pattern => normalizedUrl.includes(pattern))) { status = "⚠️ Suspicious URL Detected!"; statusClass = "suspicious"; }
    else if(obfuscatedPatterns.some(regex => regex.test(normalizedUrl))) { status = "⚠️ Obfuscated or IP-based URL Detected!"; statusClass = "suspicious"; }

    const phishStatus = await checkPhishTank(normalizedUrl);
    if(phishStatus === "malicious") { status = "🚨 URL flagged by PhishTank!"; statusClass = "danger"; }

    const gsbStatus = await checkGoogleSafeBrowsing(normalizedUrl);
    if(gsbStatus === "malicious") { status = "🚨 URL flagged by Google Safe Browsing!"; statusClass = "danger"; }

    cache[normalizedUrl] = { message: status, statusClass };
    showResult(status, statusClass, url);
    fetchWebsiteDetails(normalizedUrl);

  }, 600);
}

// ------------------- Helpers -------------------
function normalizeURL(url) {
  try { return new URL(url).href.toLowerCase(); }
  catch(e){ return null; }
}

function showResult(message, statusClass, url="") {
  resultBox.textContent = message;
  resultBox.className = "result-box " + statusClass;
  resultBox.style.display = "block";
  if(url) addToHistory(url, statusClass, message, true);
}

function addToHistory(url, statusClass, message, save=true) {
  const row = document.createElement("tr");
  const time = new Date().toLocaleTimeString();
  row.innerHTML = `<td>${time}</td><td>${url}</td><td class="${statusClass}">${message}</td>`;
  row.style.opacity = 0;
  historyBody.prepend(row);

  let opacity = 0;
  const fade = setInterval(() => { opacity+=0.05; row.style.opacity=opacity; if(opacity>=1) clearInterval(fade); }, 20);

  if(save){
    storedHistory.unshift({url, statusClass, message});
    localStorage.setItem("scanHistory", JSON.stringify(storedHistory));
  }
}

// ------------------- Website Details -------------------
async function fetchWebsiteDetails(url){
  websiteInfoBox.style.display = "none";
  siteTitle.textContent = "Loading...";
  siteDesc.textContent = "Loading...";
  siteFavicon.src = "";

  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl);
    const data = await res.json();
    const parser = new DOMParser();
    const doc = parser.parseFromString(data.contents, "text/html");

    const title = doc.querySelector("title")?.innerText || "N/A";
    const desc = doc.querySelector('meta[name="description"]')?.content || "N/A";

    let favicon = "";
    const iconElem = doc.querySelector('link[rel~="icon"]');
    if(iconElem){
      favicon = iconElem.href.startsWith("http") ? iconElem.href : new URL(iconElem.href, url).href;
    }

    siteTitle.textContent = title;
    siteDesc.textContent = desc;
    siteFavicon.src = favicon || "https://via.placeholder.com/24";
    websiteInfoBox.style.display = "block";

  } catch(e){
    siteTitle.textContent = "N/A";
    siteDesc.textContent = "N/A";
    siteFavicon.src = "https://via.placeholder.com/24";
    websiteInfoBox.style.display = "block";
  }
}

// ------------------- PhishTank API -------------------
async function checkPhishTank(url) {
  try {
    const apiKey = "YOUR_PHISHTANK_API_KEY"; // Replace with your API key
    const response = await fetch(`https://checkurl.phishtank.com/checkurl/?url=${encodeURIComponent(url)}&format=json&app_key=${apiKey}`);
    const data = await response.json();
    if(data.results && data.results.valid === "yes"){ return "malicious"; }
    return "safe";
  } catch(e){ return "safe"; }
}

// ------------------- Google Safe Browsing -------------------
async function checkGoogleSafeBrowsing(url) {
  try {
    const apiKey = "YOUR_GOOGLE_API_KEY"; // Replace with your API key
    const requestBody = {
      client: { clientId: "CyberShield", clientVersion: "1.0" },
      threatInfo: {
        threatTypes: ["MALWARE","SOCIAL_ENGINEERING","UNWANTED_SOFTWARE","POTENTIALLY_HARMFUL_APPLICATION"],
        platformTypes: ["ANY_PLATFORM"],
        threatEntryTypes: ["URL"],
        threatEntries: [{url}]
      }
    };
    const response = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`, {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {"Content-Type":"application/json"}
    });
    const data = await response.json();
    return (data && data.matches) ? "malicious" : "safe";
  } catch(e){ return "safe"; }
}
