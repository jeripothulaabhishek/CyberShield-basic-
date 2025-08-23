const scanBtn = document.getElementById("scanBtn");
const urlInput = document.getElementById("urlInput");
const resultBox = document.getElementById("result");
const loader = document.getElementById("loader");
const historyBody = document.getElementById("historyBody");

// Heuristics: Suspicious words and patterns
const suspiciousPatterns = [
  "login", "verify", "update", "account", "secure", "bank",
  "paypal", "free", "bonus", "gift", "prize", "winner",
  "phish", "confirm", "click", "urgent"
];
const suspiciousTLDs = [".tk", ".xyz", ".top", ".zip", ".cn", ".ru", ".info", ".loan", ".pw"];
const dangerousExtensions = [".exe", ".scr", ".bat", ".cmd", ".zip", ".js"];

scanBtn.addEventListener("click", scanURL);
urlInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") scanURL();
});

function scanURL() {
  const url = urlInput.value.trim();
  if (!url) return showResult("⚠️ Enter a valid URL!", "suspicious");

  loader.style.display = "block";
  resultBox.style.display = "none";

  setTimeout(() => { // simulate scanning delay
    loader.style.display = "none";

    let status = "Safe ✅";
    let statusClass = "safe";

    const urlLower = url.toLowerCase();

    // Check dangerous extensions
    if (dangerousExtensions.some(ext => urlLower.endsWith(ext))) {
      status = "🚨 Dangerous File Link!";
      statusClass = "danger";
    }

    // Check suspicious TLDs
    else if (suspiciousTLDs.some(tld => urlLower.endsWith(tld))) {
      status = "⚠️ Suspicious TLD Detected!";
      statusClass = "suspicious";
    }

    // Check suspicious keywords
    else if (suspiciousPatterns.some(pattern => urlLower.includes(pattern))) {
      status = "⚠️ Suspicious URL Detected!";
      statusClass = "suspicious";
    }

    showResult(status, statusClass, url);
  }, 800); // 0.8s loading simulation
}

function showResult(message, statusClass, url = "") {
  resultBox.textContent = message;
  resultBox.className = "result-box " + statusClass;
  resultBox.style.display = "block";

  if (url) addToHistory(url, statusClass, message);
}

function addToHistory(url, statusClass, message) {
  const row = document.createElement("tr");
  const time = new Date().toLocaleTimeString();
  row.innerHTML = `
    <td>${time}</td>
    <td>${url}</td>
    <td class="${statusClass}">${message}</td>
  `;
  historyBody.prepend(row);
}
