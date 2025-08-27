// Helper to extract domain
function getDomain(url) {
  try {
    let hostname = new URL(url).hostname;
    let parts = hostname.split(".");
    return parts.slice(-2).join(".");
  } catch {
    return null;
  }
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "groupDomain") {
    let tabs = await chrome.tabs.query({});
    let targetDomain = message.domain;

    let domainTabs = tabs.filter(tab => getDomain(tab.url) === targetDomain);
    if (domainTabs.length === 0) return;

    // Create new window with first tab
    let newWindow = await chrome.windows.create({ tabId: domainTabs[0].id });

    // Move remaining tabs
    if (domainTabs.length > 1) {
      await chrome.tabs.move(
        domainTabs.slice(1).map(t => t.id),
        { windowId: newWindow.id, index: -1 }
      );
    }
  }
});
