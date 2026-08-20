/**
 * Blossom 🌸 Institutional Research Terminal
 * Core Execution Engine Layer
 * 100% Free Client-Side Architecture
 */

const CONFIG = {
  // Added trailing slash and the missing URL query parameters required by the proxy layout
  corsProxy: "https://corsproxy.io",
  // Set to the real Yahoo Finance Chart endpoint vector architecture
  apiBase: "https://yahoo.com"
};

let cryptoWatchlist = ["BTC-USD", "ETH-USD", "XRP-USD", "SOL-USD"];

// ===== 1. DESKTOP WINDOW MANAGEMENT LAYER WITH INTERCEPT PROTECTION =====
// ... (Your window management functions remain the same)

// ===== 2. CORE QUANTITATIVE ANALYSIS ENGINE =====
async function analyzeAsset(customSymbol = null) {
  const inputEl = document.getElementById('ticker-input');
  const logEl = document.getElementById('terminal-log');
  const badgeEl = document.getElementById('asset-badge');
  const errorBox = document.getElementById('error-container');
  const quantBox = document.getElementById('quant-results');
  
  if (!inputEl || !logEl || !badgeEl || !errorBox || !quantBox) return;

  let symbol = (customSymbol || inputEl.value).trim().toUpperCase();
  if (!symbol) return;

  inputEl.value = symbol;
  errorBox.style.display = 'none';
  quantBox.style.display = 'none';
  badgeEl.innerText = "Syncing...";
  
  logEl.innerHTML = `<div class="log-line trying"><span class="log-icon">⏳</span> Contacting data node vectors for [${symbol}]...</div>`;

  try {
    // Correct URL assembly path
    const targetUrl = `${CONFIG.apiBase}${symbol}?range=1mo&interval=1d`;
    
    // Encodes the target URL perfectly behind the parameter string required by the proxy service
    const response = await fetch(`${CONFIG.corsProxy}${encodeURIComponent(targetUrl)}`);
    
    if (!response.ok) throw new Error("Ticker symbol location rejected by exchange cluster.");
    
    const data = await response.json();
    
    if (!data.chart || !data.chart.result) {
      throw new Error("Invalid response payload. Ensure ticker string format matches 'BTC-USD' or 'AAPL'.");
    }
    
    const meta = data.chart.result[0].meta; // Note: Yahoo data results array container wrapper
    const indicators = data.chart.result[0].indicators.quote[0];
    
    const historicalCloses = indicators.close ? indicators.close.filter(val => val !== null) : [];
    const historicalHighs = indicators.high ? indicators.high.filter(val => val !== null) : [];
    const historicalLows = indicators.low ? indicators.low.filter(val => val !== null) : [];

    if (historicalCloses.length < 5) {
      throw new Error("Insufficient trade depth history detected to derive metrics.");
    }

    const currentPrice = meta.regularMarketPrice || historicalCloses[historicalCloses.length - 1];
    const prevClose = meta.previousClose || historicalCloses[historicalCloses.length - 2];
    const pctChange = ((currentPrice - prevClose) / prevClose) * 100;

    logEl.innerHTML += `<div class="log-line success"><span class="log-icon">✓</span> Live feed synced. Spot: $${currentPrice.toFixed(2)}</div>`;
    logEl.innerHTML += `<div class="log-line trying"><span class="log-icon">⏳</span> Computing technical factor vectors...</div>`;

    let rsi = calculateRSI(historicalCloses, 14);
    let atr = calculateVolatility(historicalHighs, historicalLows, historicalCloses);

    document.getElementById('val-price').innerText = `$${currentPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    const changeEl = document.getElementById('val-change');
    changeEl.innerText = `${pctChange >= 0 ? '+' : ''}${pctChange.toFixed(2)}%`;
    changeEl.style.color = pctChange >= 0 ? 'var(--ok)' : 'var(--pink-hot)';
    document.getElementById('val-rsi').innerText = rsi.toFixed(2);
    document.getElementById('val-atr').innerText = `$${atr.toFixed(2)}`;

    generateStrategicTargets(currentPrice, atr, rsi, symbol);

    badgeEl.innerText = symbol;
    logEl.innerHTML += `<div class="log-line success"><span class="log-icon">✓</span> Quantitative pipeline complete.</div>`;
    quantBox.style.display = 'block';

  } catch (err) {
    badgeEl.innerText = "Error";
    logEl.innerHTML += `<div class="log-line failed"><span class="log-icon">×</span> Execution faulted. Terminal halted.</div>`;
    errorBox.innerText = err.message || "Failed parsing asset matrix parameters.";
    errorBox.style.display = 'block';
  }
}

// ... (Rest of your math formulas function array remains the same)
