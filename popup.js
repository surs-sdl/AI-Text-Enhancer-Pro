// popup.js - saves API keys

document.addEventListener('DOMContentLoaded', () => {
  const geminiInput = document.getElementById('geminiKey');
  const openrouterInput = document.getElementById('openrouterKey');
  const saveBtn = document.getElementById('saveBtn');
  const statusDiv = document.getElementById('statusMsg');

  // Load previously saved API keys
  chrome.storage.local.get(
    ['geminiApiKey', 'openrouterApiKey'],
    (result) => {
      if (result.geminiApiKey) {
        geminiInput.value = result.geminiApiKey;
      }

      if (result.openrouterApiKey) {
        openrouterInput.value = result.openrouterApiKey;
      }
    }
  );

  // Save API keys
  saveBtn.addEventListener('click', async () => {
    const geminiKey = geminiInput.value.trim();
    const openrouterKey = openrouterInput.value.trim();

    try {
      await chrome.storage.local.set({
        geminiApiKey: geminiKey,
        openrouterApiKey: openrouterKey
      });

      const saved = await chrome.storage.local.get([
        'geminiApiKey',
        'openrouterApiKey'
      ]);

      if (
        saved.geminiApiKey === geminiKey &&
        saved.openrouterApiKey === openrouterKey
      ) {
        statusDiv.textContent = '✅ API keys saved!';
        statusDiv.className = 'status success';
      } else {
        throw new Error('Settings could not be verified.');
      }
    } catch (error) {
      console.error('Failed to save API keys:', error);

      statusDiv.textContent = '❌ Failed to save API keys.';
      statusDiv.className = 'status error';
    }

    setTimeout(() => {
      statusDiv.textContent = '';
      statusDiv.className = 'status';
    }, 3000);
  });
});