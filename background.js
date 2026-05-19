const CACHE_KEY = "rateCache";
const API_BASE = "https://api.frankfurter.app";

async function fetchRates(base) {
  const resp = await fetch(`${API_BASE}/latest?from=${encodeURIComponent(base)}`);
  if (!resp.ok) throw new Error("Failed to fetch rates");
  return resp.json();
}

chrome.runtime.onInstalled.addListener(() => {
  fetchRates("USD").then((data) => {
    chrome.storage.local.set({ [CACHE_KEY]: { data, timestamp: Date.now() } });
  }).catch(() => {});
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_RATES") {
    chrome.storage.local.get([CACHE_KEY], async (result) => {
      try {
        const cache = result[CACHE_KEY];
        if (cache && Date.now() - cache.timestamp < 3600000) {
          sendResponse({ ok: true, rates: cache.data.rates, base: cache.data.base, date: cache.data.date });
          return;
        }
        const data = await fetchRates(message.base || "USD");
        chrome.storage.local.set({ [CACHE_KEY]: { data, timestamp: Date.now() } });
        sendResponse({ ok: true, rates: data.rates, base: data.base, date: data.date });
      } catch (err) {
        sendResponse({ ok: false, error: err.message });
      }
    });
    return true;
  }

  if (message.type === "GET_STORAGE") {
    chrome.storage.local.get(message.keys || null, (result) => {
      sendResponse(result);
    });
    return true;
  }

  if (message.type === "SET_STORAGE") {
    chrome.storage.local.set(message.data, () => {
      sendResponse({ ok: true });
    });
    return true;
  }
});
