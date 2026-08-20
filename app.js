/**
 * Blossom 🌸 Institutional Research Terminal
 * Core Execution Engine Layer
 * 100% Free Client-Side Architecture
 */

const CONFIG = {
  corsProxy: "https://corsproxy.io",
  apiBase: "https://yahoo.com"
};

let cryptoWatchlist = ["BTC-USD", "ETH-USD", "XRP-USD", "SOL-USD"];

// ===== 1. DESKTOP WINDOW MANAGEMENT LAYER WITH INTERCEPT PROTECTION =====
function openWindow(id) {
  const el = document.getElementById(id);
  if (!el) {
    console.error(`Layout engine mismatch: window target [${id}] not found.`);
    return;
  }
  el.style.display = 'flex';
  document.querySelectorAll('.win').forEach(w => w.style.zIndex = '10');
  el.style.zIndex = '12';
}

function closeWindow(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

function minimizeWindow(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

// Draggable Window Handler with Active Boundary Checks
function initializeDraggables() {
  document.querySelectorAll('.win-titlebar').forEach(bar => {
    bar.addEventListener('mousedown', function(e) {
      if (e.target.classList.contains('win-btn') || e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
      
      const win = bar.parentElement;
      if (!win) return;
      
      document.querySelectorAll('.win').forEach(w => w.style.zIndex = '10');
      win.style.zIndex = '12';

      let shiftX = e.clientX - win.getBoundingClientRect().left;
      let shiftY = e.clientY - win.getBoundingClientRect().top;

      function moveAt(clientX, clientY) {
        win.style.left = (clientX - shiftX) + 'px';
        win.style.top = (clientY - shiftY) + 'px';
      }

      function onMouseMove(event) {
        moveAt(event.clientX, event.clientY);
      }

      document.addEventListener('mousemove', onMouseMove);

      document.onmouseup = function() {
        document.removeEventListener('mousemove', onMouseMove);
        document.onmouseup = null;
      };
    });
  });
}

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
    const targetUrl = `${CONFIG.apiBase}${symbol}?range=1mo&interval=1d`;
    const response = await fetch(`${CONFIG.corsProxy}${encodeURIComponent(targetUrl)}`);
    
    if (!response.ok) throw new Error("Ticker symbol location rejected by exchange cluster.");
    
    const data = await response.json();
    
    if (!data.chart || !data.chart.result) {
      throw new Error("Invalid response payload. Ensure ticker string format matches 'BTC-USD' or 'AAPL'.");
    }
    
    const meta = data.chart.result.meta;
    const indicators = data.chart.result.indicators.quote;
    
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

function calculateRSI(closes, period = 14) {
  if (closes.length <= period) return 50.0;
  let gains = 0;
  let losses = 0;

  for (let i = closes.length - period; i < closes.length; i++) {
    let diff = closes[i] - closes[i - 1];
    if (diff > 0) gains += diff;
    else losses += Math.abs(diff);
  }

  if (losses === 0) return 100;
  let rs = (gains / period) / (losses / period);
  return 100 - (100 / (1 + rs));
}

function calculateVolatility(highs, lows, closes) {
  let totalRange = 0;
  let count = 0;
  const depth = Math.min(closes.length - 1, 10);
  
  for (let i = closes.length - depth; i < closes.length; i++) {
    let tr = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    );
    totalRange += tr;
    count++;
  }
  return count > 0 ? (totalRange / count) : (closes[closes.length - 1] * 0.02);
}

function generateStrategicTargets(spot, atr, rsi, symbol) {
  const targetOutput = document.getElementById('target-output');
  if (!targetOutput) return;
  
  let entryZoneStart = spot - (atr * 0.85);
  let entryZoneEnd = spot - (atr * 1.5);
  let stopLoss = spot - (atr * 2.5);
  let takeProfit1 = spot + (atr * 1.2);
  let takeProfit2 = spot + (atr * 2.2);

  let assetCondition = "NEUTRAL SYMMETRY";
  let tacticalInstruction = "Await dynamic structural breakout patterns outside baseline volatility bands.";

  if (rsi < 35) {
    assetCondition = "OVERSOLD DISLOCATION EXTENSION";
    tacticalInstruction = `High probability institutional accumulation window active. Scale entry brackets carefully between $${entryZoneStart.toFixed(2)} and $${entryZoneEnd.toFixed(2)}.`;
  } else if (rsi > 65) {
    assetCondition = "OVERBOUGHT MOMENTUM SATURATION";
    tacticalInstruction = `Saturated upward trajectory detected. Do not chase market pricing at current spot. Defer buying actions or realize partial exits near $${takeProfit1.toFixed(2)}.`;
  }

  targetOutput.innerHTML = `
=== INST-STRATEGY REPORT MATRIX [${symbol}] ===
CONSTRAINTS CONFIG: ATR-BASED VOLATILITY ARCHITECTURE
CURRENT STATE     : ${assetCondition}

[⚡ BUY ENTRY TARGET RANGE]
► Accumulation Alpha Window: $${entryZoneStart.toFixed(2)} down to $${entryZoneEnd.toFixed(2)}

[🚨 RISK EXCLUSION POINT / STOP-LOSS]
► Absolute Hard Stop Safety Node: $${stopLoss.toFixed(2)}

[🎯 LIQUIDITY TAKEOFF EXIT POINTS]
► Target Objective 1 (Take Profit): $${takeProfit1.toFixed(2)}
► Target Objective 2 (Macro Range): $${takeProfit2.toFixed(2)}

QUANT PIPELINE TACTICAL FIELD NOTE:
"${tacticalInstruction}"
  `.trim();
}

// ===== 3. DYNAMIC CRYPTO WATCHLIST PIPELINE MAPPING =====
async function updateWatchlistUI() {
  const container = document.getElementById('watchlist-items-box');
  if (!container) return;
  
  let htmlString = "";

  for (let symbol of cryptoWatchlist) {
    try {
      const targetUrl = `${CONFIG.apiBase}${symbol}?range=2d&interval=1d`;
      const response = await fetch(`${CONFIG.corsProxy}${encodeURIComponent(targetUrl)}`);
      if (!response.ok) throw new Error();
      
      const data = await response.json();
      const meta = data.chart.result.meta;
      const price = meta.regularMarketPrice;
      const prevClose = meta.previousClose;
      const pctChange = ((price - prevClose) / prevClose) * 100;
      
      const changeSign = pctChange >= 0 ? "+" : "";
      const changeColor = pctChange >= 0 ? "var(--ok)" : "var(--pink-hot)";

      htmlString += `
        <div class="vault-card" style="cursor: pointer; margin-bottom: 8px;" onclick="analyzeAsset('${symbol}')">
          <div class="vault-card-head" style="justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div class="vault-rank" style="background: var(--teal);">★</div>
              <strong>${symbol}</strong>
            </div>
            <span style="font-weight: 700; color: ${changeColor};">${changeSign}${pctChange.toFixed(2)}%</span>
          </div>
          <p class="muted" style="margin-top: 4px; font-size: 13px; font-family: monospace; font-weight: 700;">
            Spot: $${price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </p>
        </div>
      `;
    } catch (e) {
      htmlString += `
