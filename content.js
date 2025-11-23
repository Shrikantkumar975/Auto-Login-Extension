// Content script for LPU WiFi Auto Login

console.log("LPU WiFi Auto Login: Script loaded (Persistent Mode v3)");

let loginAttempted = false;
let intervalId = null;

function checkAndLogin() {
    if (loginAttempted) {
        const loginBtn = document.getElementById('loginbtn');
        if (!loginBtn) {
            // Success (No reload case)
            if (!window.hasAlerted) {
                chrome.runtime.sendMessage({ action: "notify_success" });
                window.hasAlerted = true;
                chrome.storage.local.set({ 'lpu_just_logged_in': false });
            }

            chrome.storage.local.get(['lpu_auto_close'], (result) => {
                if (result.lpu_auto_close) {
                    console.log("LPU WiFi Auto Login: Auto-close enabled and login button gone. Closing tab...");
                    chrome.runtime.sendMessage({ action: "close_tab" });
                    stopChecking();
                }
            });
        }
        return;
    }

    chrome.storage.local.get(['lpu_username', 'lpu_password', 'lpu_auto_login', 'lpu_auto_close', 'lpu_just_logged_in'], (result) => {
        if (!result.lpu_auto_login) return;

        const loginBtn = document.getElementById('loginbtn');
        const usernameField = document.querySelector('input[name="username"]');
        const passwordField = document.querySelector('input[name="password"]');
        const termsCheckbox = document.getElementById('agreepolicy');

        if (loginBtn && usernameField && passwordField) {
            console.log("LPU WiFi Auto Login: Login form detected!");

            if (!result.lpu_username || !result.lpu_password) return;

            // 1. Handle Terms
            if (termsCheckbox && !termsCheckbox.checked) {
                termsCheckbox.click();
            }

            // 2. Fill Credentials
            let cleanUsername = result.lpu_username.trim();
            if (cleanUsername.toLowerCase().endsWith('@lpu.com')) {
                cleanUsername = cleanUsername.slice(0, -8);
            }

            if (usernameField.value !== cleanUsername) {
                usernameField.value = cleanUsername;
                usernameField.dispatchEvent(new Event('input', { bubbles: true }));
                usernameField.dispatchEvent(new Event('change', { bubbles: true }));
            }

            if (passwordField.value !== result.lpu_password) {
                passwordField.value = result.lpu_password;
                passwordField.dispatchEvent(new Event('input', { bubbles: true }));
                passwordField.dispatchEvent(new Event('change', { bubbles: true }));
            }

            // 3. Click Login
            if (loginBtn.disabled) {
                loginBtn.disabled = false;
            }

            console.log("LPU WiFi Auto Login: Clicking login button...");
            chrome.storage.local.set({ 'lpu_just_logged_in': true });
            loginBtn.click();
            loginAttempted = true;
        } else if (!loginBtn) {
            // Success (Reload case)
            if (result.lpu_just_logged_in) {
                chrome.runtime.sendMessage({ action: "notify_success" });
                chrome.storage.local.set({ 'lpu_just_logged_in': false });
            }

            // If no login button, check if we should auto-close (assuming logged in)
            if (result.lpu_auto_close && document.readyState === 'complete') {
                console.log("LPU WiFi Auto Login: Page loaded, no login button. Closing...");
                chrome.runtime.sendMessage({ action: "close_tab" });
                stopChecking();
            }
        }
    });
}

function startChecking() {
    if (!intervalId) {
        console.log("LPU WiFi Auto Login: Starting checks...");
        intervalId = setInterval(checkAndLogin, 500);
        checkAndLogin(); // Run immediately
    }
}

function stopChecking() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

// Start immediately
startChecking();

// React to visibility changes (tab switch)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        console.log("LPU WiFi: Tab became visible, restarting checks...");
        loginAttempted = false; // Reset this to allow re-checking if the page reloaded or state changed
        startChecking();
    }
});

// React to window focus
window.addEventListener('focus', () => {
    console.log("LPU WiFi: Window focused, restarting checks...");
    startChecking();
});

// Listen for background messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "wake_up") {
        console.log("LPU WiFi: Received wake_up command...");
        startChecking();
    }
    if (request.action === "force_login") {
        console.log("LPU WiFi: Received FORCE LOGIN command...");
        alert("LPU Extension: Force Login Triggered!"); // Visual confirmation
        loginAttempted = false; // Reset attempt flag
        checkAndLogin(); // Run immediately
    }
});
