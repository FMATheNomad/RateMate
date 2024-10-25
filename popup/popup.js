document.getElementById('toggle-extension').addEventListener('click', () => {
    chrome.storage.local.get(['isEnabled'], (result) => {
      const isEnabled = !result.isEnabled;
      chrome.storage.local.set({ isEnabled });
      alert(`Extension is now ${isEnabled ? 'enabled' : 'disabled'}`);
    });
  });
  