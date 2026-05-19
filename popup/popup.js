"use strict";

const toggleSwitch = document.getElementById("toggleSwitch");
const currencySelect = document.getElementById("currencySelect");
const statusCard = document.getElementById("statusCard");
const refreshBtn = document.getElementById("refreshBtn");
const toggleHint = document.getElementById("toggleHint");

function renderStatus(info) {
  if (!info || info.priceCount === undefined) {
    statusCard.innerHTML =
      '<div class="empty-state"><i class="fa fa-search"></i><p>No price data yet. Open an e-commerce page and click refresh.</p></div>';
    return;
  }

  const priceStatus = info.priceCount > 0
    ? '<span class="value active">' + info.priceCount + " prices found</span>"
    : '<span class="value inactive">No prices detected</span>';

  const exampleHtml = info.examplePrice
    ? '<div class="row"><span class="label">Example</span><span class="value">' + escapeHtml(info.examplePrice) + "</span></div>"
    : "";

  const currencyHtml = info.detectedCurrency
    ? '<div class="row"><span class="label">Source Currency</span><span class="value">' + info.detectedCurrency + "</span></div>"
    : "";

  const targetHtml = '<div class="row"><span class="label">Converting to</span><span class="value">' + info.targetCurrency + "</span></div>";

  const ratesHtml = info.ratesLoaded
    ? '<div class="row"><span class="label">Rates</span><span class="value active">Loaded</span></div>'
    : '<div class="row"><span class="label">Rates</span><span class="value inactive">Not loaded</span></div>';

  const enabledHtml = info.enabled
    ? '<div class="row"><span class="label">Status</span><span class="value active">Active</span></div>'
    : '<div class="row"><span class="label">Status</span><span class="value inactive">Disabled</span></div>';

  statusCard.innerHTML =
    '<div>' + enabledHtml + priceStatus + currencyHtml + targetHtml + ratesHtml + exampleHtml + "</div>";
}

function escapeHtml(str) {
  const d = document.createElement("div");
  d.appendChild(document.createTextNode(str));
  return d.innerHTML;
}

function getPageInfo() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) {
      renderStatus(null);
      return;
    }
    chrome.tabs.sendMessage(tabs[0].id, { type: "GET_PAGE_INFO" }, (response) => {
      if (chrome.runtime.lastError || !response) {
        renderStatus(null);
        return;
      }
      renderStatus(response);
    });
  });
}

function notifyContentScript(enabled, currency) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;
    chrome.tabs.sendMessage(tabs[0].id, {
      type: "STATE_UPDATED",
      enabled: enabled,
      targetCurrency: currency,
    });
  });
}

// Load saved state
chrome.storage.local.get(["enabled", "targetCurrency"], (result) => {
  const enabled = result.enabled !== false;
  const currency = result.targetCurrency || "IDR";
  toggleSwitch.checked = enabled;
  currencySelect.value = currency;
  toggleHint.textContent = enabled ? "Converting prices on this page" : "Conversion disabled";
  getPageInfo();
});

// Toggle handler
toggleSwitch.addEventListener("change", () => {
  const enabled = toggleSwitch.checked;
  toggleHint.textContent = enabled ? "Converting prices on this page" : "Conversion disabled";
  chrome.storage.local.set({ enabled: enabled });
  notifyContentScript(enabled, currencySelect.value);
});

// Currency change handler
currencySelect.addEventListener("change", () => {
  const currency = currencySelect.value;
  chrome.storage.local.set({ targetCurrency: currency });
  notifyContentScript(toggleSwitch.checked, currency);
});

// Refresh button
refreshBtn.addEventListener("click", getPageInfo);
