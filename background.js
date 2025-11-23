// Background script to handle tab closing and activation
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "close_tab" && sender.tab) {
        console.log("LPU WiFi Auto Login: Closing tab", sender.tab.id);
        chrome.tabs.remove(sender.tab.id);
    }
});

// Wake up content script when tab becomes active
chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (tab.url && (tab.url.includes("10.10.0.1") || tab.url.includes("lpu.in"))) {
            console.log("LPU WiFi Auto Login: Tab activated, sending wake_up...");
            chrome.tabs.sendMessage(tab.id, { action: "wake_up" }).catch(() => {
                // Ignore errors if script isn't ready
            });
        }
    });
});

// Handle Notifications and Badges
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "notify_success") {
        // 1. Show Notification
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'LPU WiFi Auto Login',
            message: 'Successfully logged in!',
            priority: 2
        });

        // 2. Set Badge
        chrome.action.setBadgeText({ text: "ON" });
        chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" }); // Green

        // Clear badge after 5 seconds
        setTimeout(() => {
            chrome.action.setBadgeText({ text: "" });
        }, 5000);
    }
});
