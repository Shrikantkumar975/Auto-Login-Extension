# LPU WiFi Auto Login Extension

## Project Overview
This is a Chrome Extension designed to automatically log users into the LPU WiFi network. It detects the login page, fills in the stored credentials, accepts the terms and conditions, and submits the form. It also includes features like auto-closing the tab after successful login and manual login triggering.

## File Structure & Responsibilities

### 1. `manifest.json`
*   **Role:** The configuration file for the extension.
*   **Key Details:**
    *   **Manifest Version:** 3 (Modern Chrome standard).
    *   **Permissions:** `storage` (saving passwords), `activeTab` (interacting with current tab), `scripting`, `notifications`.
    *   **Host Permissions:** Grants access to `10.10.0.1` and `*internet.lpu.in*`.
    *   **Background:** Defines `background.js` as the service worker.
    *   **Content Scripts:** Inject `content.js` into LPU login pages.

### 2. `background.js` (Service Worker)
*   **Role:** Runs in the background and handles system-level events.
*   **Functions:**
    *   **Tab Management:** Listens for `close_tab` messages to close the login page after success.
    *   **Wake Up:** Detects when you switch tabs (`onActivated`) and sends a `wake_up` message to the content script to ensure it's running.
    *   **Notifications:** Handles `notify_success` to show a "Successfully logged in!" notification and update the extension badge to "ON".

### 3. `content.js` (The "Brain")
*   **Role:** Runs directly on the web page (LPU Login Page).
*   **Functions:**
    *   **`checkAndLogin()`:** The main loop. It looks for the login form (`loginbtn`, `username`, `password`).
    *   **Auto-Fill:** Fills the username and password fields. Triggers `input` and `change` events so the page recognizes the text.
    *   **Terms & Conditions:** Automatically checks the "Agree Policy" checkbox.
    *   **Login:** Clicks the login button.
    *   **Success Detection:** If the login button disappears, it assumes success, sends a notification, and optionally closes the tab.
    *   **Listeners:** Listens for `wake_up` (from background) and `force_login` (from popup).

### 4. `popup.html` & `popup.css`
*   **Role:** The user interface when you click the extension icon.
*   **Features:**
    *   Input fields for Username (Registration No) and Password.
    *   Checkboxes for "Enable Auto Login" and "Close Tab After Login".
    *   "Save Credentials" button.
    *   "Login Now (Manual)" button.

### 5. `popup.js`
*   **Role:** Logic for the popup UI.
*   **Functions:**
    *   **Save/Load:** Saves user settings to `chrome.storage.local` and loads them when opened.
    *   **Manual Login:** Sends a `force_login` message to the active tab when the manual button is clicked.

---

## How to Debug
If the extension stops working or you want to check what it's doing:

1.  **Check Content Script Logs:**
    *   Open the LPU Login Page.
    *   Right-click anywhere on the page -> **Inspect**.
    *   Go to the **Console** tab.
    *   Look for messages starting with `LPU WiFi Auto Login:`. You will see logs like "Login form detected!", "Clicking login button...", etc.

2.  **Check Background Script Logs:**
    *   Go to `chrome://extensions`.
    *   Turn on **Developer mode** (top right).
    *   Find "LPU WiFi Auto Login".
    *   Click on **"service worker"** (link next to "Inspect views").
    *   A new console window will open showing background logs.

3.  **Check Popup Logs:**
    *   Right-click the extension icon in the toolbar -> **Inspect popup**.
    *   Go to the **Console** tab.

---

## How to Extend / Add Features

### Scenario A: The Login Page Changed
If LPU changes their login page (e.g., new ID for the password field), you need to update `content.js`.
1.  Open the new login page and **Inspect** the element.
2.  Find the new ID or Name.
3.  Update the selectors in `content.js`:
    ```javascript
    // Example: changing selector
    const passwordField = document.querySelector('input[name="new_password_field_name"]');
    ```

### Scenario B: Add a New Setting
1.  **Update `popup.html`:** Add the new checkbox or input.
2.  **Update `popup.js`:**
    *   Read the new value in `saveBtn` listener.
    *   Save it to `chrome.storage.local`.
    *   Load it in `DOMContentLoaded`.
3.  **Update `content.js`:**
    *   Read the new setting in `chrome.storage.local.get([...])`.
    *   Use the value in your logic.

### Scenario C: Add Support for a New Site
1.  **Update `manifest.json`:** Add the new URL to `host_permissions` and `content_scripts` -> `matches`.
2.  **Update `content.js`:** Add logic to detect which site you are on (check `window.location.href`) and use appropriate selectors.

---

## Installation (for Development)
1.  Open Chrome and go to `chrome://extensions`.
2.  Enable **Developer mode** (top right).
3.  Click **Load unpacked**.
4.  Select the folder containing these files (`Lpu-wifi`).
