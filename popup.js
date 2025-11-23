document.addEventListener('DOMContentLoaded', () => {
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const autoLoginCheckbox = document.getElementById('autoLogin');
  const autoCloseCheckbox = document.getElementById('autoClose');
  const saveBtn = document.getElementById('saveBtn');
  const statusDiv = document.getElementById('status');

  // Load saved settings
  chrome.storage.local.get(['lpu_username', 'lpu_password', 'lpu_auto_login', 'lpu_auto_close'], (result) => {
    if (result.lpu_username) {
      usernameInput.value = result.lpu_username;
    }
    if (result.lpu_password) {
      passwordInput.value = result.lpu_password;
    }
    if (result.lpu_auto_login !== undefined) {
      autoLoginCheckbox.checked = result.lpu_auto_login;
    }
    if (result.lpu_auto_close !== undefined) {
      autoCloseCheckbox.checked = result.lpu_auto_close;
    }
  });

  // Save settings
  saveBtn.addEventListener('click', () => {
    const username = usernameInput.value;
    const password = passwordInput.value;
    const autoLogin = autoLoginCheckbox.checked;
    const autoClose = autoCloseCheckbox.checked;

    chrome.storage.local.set({
      lpu_username: username,
      lpu_password: password,
      lpu_auto_login: autoLogin,
      lpu_auto_close: autoClose
    }, () => {
      statusDiv.textContent = 'Settings saved!';
      setTimeout(() => {
        statusDiv.textContent = '';
      }, 2000);
    });
  });

  // Manual Login Trigger
  document.getElementById('manualLoginBtn').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "force_login" }, (response) => {
          if (chrome.runtime.lastError) {
            statusDiv.textContent = "Error: Open the Login Page first!";
            statusDiv.style.color = "red";
          } else {
            statusDiv.textContent = "Command Sent!";
            statusDiv.style.color = "blue";
          }
        });
      }
    });
  });
});
