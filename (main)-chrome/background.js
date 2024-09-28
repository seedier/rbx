let popupsOpen = 0;

// Listen for messages from other parts of the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'refreshSettings':
            chrome.storage.local.get('settingsSync').then(value => {
                if (value.settingsSync !== false) {
                    // Send update to open popups
                    if (popupsOpen > 0) {
                        chrome.runtime.sendMessage({ type: 'refreshSettings' });
                    }
                    // Update all relevant tabs
                    chrome.tabs.query({ url: '*://*.roblox.com/games/*' }, (tabs) => {
                        tabs.forEach((tab) => {
                            chrome.tabs.sendMessage(tab.id, { type: 'refreshSettings' });
                        });
                    });
                }
            });
            break;

        case 'openAdvancedSettings':
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const index = tabs[0].index;
                chrome.tabs.create({ url: chrome.runtime.getURL('html/advanced-settings.html'), index: index + 1 });
            });
            break;
    }
});

// Manage the number of popups open
chrome.runtime.onConnect.addListener((port) => {
    if (port.name === 'rorsl-popup') {
        popupsOpen++;
        port.onDisconnect.addListener(() => {
            popupsOpen--;
        });
    }
});
