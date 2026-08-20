// ===== Windows OS Core Layer =====
function openWindow(id) {
  const el = document.getElementById(id);
  if (el) {
    el.style.display = 'flex';
    // Bring window to front
    document.querySelectorAll('.win').forEach(w => w.style.zIndex = '10');
    el.style.zIndex = '12';
  }
}

function closeWindow(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

function minimizeWindow(id) {
  // Classic OS minimization toggle simulation
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

// Draggable Titlebar Implementation
document.querySelectorAll('.win-titlebar').forEach(bar => {
  bar.addEventListener('mousedown', function(e) {
    if (e.target.classList.contains('win-btn')) return;
    const win = bar.parentElement;
    
    // Bring clicked window to the top
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

// ===== Hard Quantitative Analysis Engine =====
async function analyzeAsset() {
  const inputEl = document.getElementById('ticker-input');
  const logEl = document.getElementById('terminal-log');
  const badgeEl = document.getElementById('asset-badge');
  const errorBox = document.getElementById('error-container');
  const quantBox = document.getElementById('quant-results');
  
  let symbol = inputEl.value.trim().toUpperCase();
  if (!symbol) return;

  // Clear states
  errorBox.style.display = 'none';
  quantBox.style.display = 'none';
  badgeEl.innerText = "Syncing...";
  
  logEl.innerHTML = `<div class="log-line trying"><span class="log-icon">⏳</span> Contacting international data node vectors for [${symbol}]...</div>`;

  try {
    // Fetch live market data safely utilizing an unauthenticated open historical pipeline
    const response = await fetch(`https://yahoo.com{symbol}?range=1mo&interval=1d`);
    
    if (!response.ok) throw new Error("Ticker symbol location rejected by exchange cluster.");
    
    const data = await response.json();
    const meta = data.chart.result[0].meta;
    const indicators = data.chart.result[0].indicators.quote[0];
    const historicalCloses = indicators.close.filter(val => val !== null);
    const historicalHighs = indicators.high.filter(val => val !== null);
    const historicalLows = indicators.low.filter(val => val !== null);

    if (historicalCloses.length < 5) {
      throw new Error("Insufficient trade depth history detected to derive calculations.");
    }

    // Capture Real Current Spot Statistics
    const currentPrice = meta.regularMarketPrice || historicalCloses[historicalCloses.length - 1];
    const prevClose = meta.previousClose || historicalCloses[historicalCloses.length - 2];
    const pctChange = ((currentPrice - prevClose) / prevClose) * 100;

    logEl.innerHTML += `<div class="log-line success"><span class="log-icon">✓</span> Live feed synced. Spot: $${currentPrice.toFixed(2)}</div>`;
    logEl.innerHTML += `<div class="log-line trying"><span class="log-icon">⏳</span> Computing technical factor vectors...</div>`;

    // 1. Calculate Real Relative Strength Index (RSI - 14 period standard)
    let rsi = calculateRSI(historicalCloses, 14);
    
    // 2. Calculate Volatility Framework (True Range Approximation)
    let atr = calculateVolatility(historicalHighs, historicalLows, historicalCloses);

    // Update Fact Card UI
    document.getElementById('val-price').innerText = `$${currentPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    const changeEl = document.getElementById('val-change');
    changeEl.innerText = `${pctChange >= 0 ? '+' : ''}${pctChange.toFixed(2)}%`;
    changeEl.style.color = pctChange >= 0 ? 'var(--ok)' : 'var(--pink-hot)';
    document.getElementById('val-rsi').innerText = rsi.toFixed(2);
    document.getElementById('val-atr').innerText = `$${atr.toFixed(2)}`;

    // 3. Structural Signal Forecasting Strategy via Pivot Variance Mapping
    generateStrategicTargets(currentPrice, atr, rsi, symbol);

    badgeEl.innerText = symbol;
    logEl.innerHTML += `<div class="log-line success"><span class="log-icon">✓</span> Quantitative pipeline analysis complete.</div>`;
    quantBox.style.display = 'block';

  } catch (err) {
    badgeEl.innerText = "Error";
    logEl.innerHTML += `<div class="log-line failed"><span class="log-icon">×</span> Execution faulted. Terminal halted.</div>`;
    errorBox.innerText = err.message || "Failed parsing asset matrix parameters.";
    errorBox.style.display = 'block';
  }
}

// Mathematical Formula Modules
function calculateRSI(closes, period = 14) {
  if (closes.length <= period) return 50.0; // Fallback default
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
  // Compute recent Average True Range vector slice
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
  
  // Mathematical framework calculation blocks
  let entryZoneStart = spot - (atr * 0.85);
  let entryZoneEnd = spot - (atr * 1.5);
  let stopLoss = spot - (atr * 2.5);
  let takeProfit1 = spot + (atr * 1.2);
  let takeProfit2 = spot + (atr * 2.2);

  let assetCondition = "NEUTRAL SYMMETRY";
  let tacticalInstruction = "Await dynamic structural breakout patterns outside structural volatility bands.";

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

// Initialize interface default on load
window.onload = () => {
  analyzeAsset();
};
