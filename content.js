"use strict";

const RATE_MATE_ATTR = "data-ratemate-original";
const CURRENCY_SYMBOLS = { "$": "USD", "€": "EUR", "£": "GBP", "¥": "JPY", "Rp": "IDR", "A$": "AUD", "C$": "CAD", "S$": "SGD", "RM": "MYR", "₱": "PHP", "฿": "THB", "₩": "KRW", "₹": "INR", "R$": "BRL", "MX$": "MXN" };
const CURRENCY_NAMES = { "USD": "US Dollar", "EUR": "Euro", "GBP": "British Pound", "JPY": "Japanese Yen", "IDR": "Indonesian Rupiah", "AUD": "Australian Dollar", "CAD": "Canadian Dollar", "SGD": "Singapore Dollar", "MYR": "Malaysian Ringgit", "PHP": "Philippine Peso", "THB": "Thai Baht", "KRW": "South Korean Won", "INR": "Indian Rupee", "BRL": "Brazilian Real", "MXN": "Mexican Peso" };

let state = { enabled: true, targetCurrency: "IDR", rates: null };

function parsePrice(text) {
  const cleaned = text.replace(/[^0-9.,]/g, "").replace(/,(\d{2})$/, ".$1").replace(/[.,]/g, (m, i, s) => s.indexOf(m) === s.lastIndexOf(m) && m === "." ? "." : "");
  const val = parseFloat(cleaned);
  return isNaN(val) ? null : val;
}

function detectCurrency(text) {
  for (const [sym, code] of Object.entries(CURRENCY_SYMBOLS)) {
    if (text.includes(sym)) return code;
  }
  return null;
}

function findPriceElements() {
  const selectors = [
    "[class*='price']", "[class*='Price']", "[id*='price']", "[id*='Price']",
    "[class*='amount']", "[class*='Amount']",
    "[itemprop='price']", "[itemprop='lowPrice']", "[itemprop='highPrice']",
    "[data-price]", "[data-product-price]",
    ".a-price", ".a-price-whole", ".a-offscreen",
    ".product-price", ".listing-price", ".sale-price", ".offer-price",
    ".total-price", ".subtotal", ".grand-total",
    "[data-testid='price']",
  ];
  const found = new Set();
  for (const sel of selectors) {
    document.querySelectorAll(sel).forEach((el) => {
      const text = el.innerText.trim();
      if (text && /\d/.test(text) && detectCurrency(text)) {
        found.add(el);
      }
    });
  }
  if (found.size === 0) {
    document.querySelectorAll("*:not(script):not(style)").forEach((el) => {
      if (el.children.length === 0) {
        const text = el.innerText.trim();
        if (text && /\d/.test(text) && detectCurrency(text) && text.length < 80) {
          found.add(el);
        }
      }
    });
  }
  return [...found];
}

function formatCurrency(amount, code) {
  try {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: code, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount);
  } catch {
    return code + " " + amount.toFixed(2);
  }
}

function getCurrencyLabel(code) {
  return CURRENCY_NAMES[code] || code;
}

function createAnnotation(originalText, converted, targetCode) {
  const badge = document.createElement("span");
  badge.className = "ratemate-badge";
  badge.style.cssText = "display:inline-block;font-size:0.75em;color:#059669;background:#ecfdf5;border:1px solid #34d399;border-radius:4px;padding:1px 6px;margin-left:4px;font-weight:600;white-space:nowrap;cursor:help;";
  badge.title = `Original: ${originalText} (${getCurrencyLabel(targetCode)})`;
  badge.textContent = "↔ " + formatCurrency(converted, targetCode);
  return badge;
}

function processPrices() {
  if (!state.enabled || !state.rates) return;

  const els = findPriceElements();
  const sourceCurrency = state.rates._sourceCurrency || "USD";
  const rate = state.rates[state.targetCurrency];
  if (!rate) return;

  els.forEach((el) => {
    if (el.hasAttribute(RATE_MATE_ATTR) || el.querySelector(".ratemate-badge")) return;

    const text = el.innerText.trim();
    const price = parsePrice(text);
    if (price === null) return;

    el.setAttribute(RATE_MATE_ATTR, text);

    const converted = price * rate;
    const annotation = createAnnotation(text, converted, state.targetCurrency);
    el.appendChild(annotation);
  });
}

function restorePrices() {
  document.querySelectorAll(`[${RATE_MATE_ATTR}]`).forEach((el) => {
    el.querySelectorAll(".ratemate-badge").forEach((b) => b.remove());
    el.removeAttribute(RATE_MATE_ATTR);
  });
}

async function loadState() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["enabled", "targetCurrency"], (result) => {
      state.enabled = result.enabled !== false;
      state.targetCurrency = result.targetCurrency || "IDR";
      resolve();
    });
  });
}

async function fetchRates() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "GET_RATES", base: "USD" }, (response) => {
      if (response && response.ok) {
        state.rates = response.rates;
        state.rates._sourceCurrency = response.base;
        state.rates._date = response.date;
      }
      resolve();
    });
  });
}

function init() {
  loadState().then(() => fetchRates()).then(() => {
    if (state.enabled && state.rates) processPrices();
  });
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "STATE_UPDATED") {
    state.enabled = message.enabled;
    state.targetCurrency = message.targetCurrency;
    if (state.enabled) {
      fetchRates().then(() => {
        restorePrices();
        processPrices();
      });
    } else {
      restorePrices();
    }
  }
  if (message.type === "GET_PAGE_INFO") {
    const els = findPriceElements();
    const example = els.length > 0 ? els[0].innerText.trim() : null;
    const detectedCurrency = example ? detectCurrency(example) : null;
    chrome.runtime.sendMessage({
      type: "PAGE_INFO",
      priceCount: els.length,
      examplePrice: example,
      detectedCurrency: detectedCurrency,
      targetCurrency: state.targetCurrency,
      enabled: state.enabled,
      ratesLoaded: !!state.rates,
    });
  }
});

init();
