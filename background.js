function getDomain(url) {
  try {
    let hostname = new URL(url).hostname;
    let parts = hostname.split(".");
    return parts.slice(-2).join(".");
  } catch {
    return null;
  }
}

chrome.runtime.onMessage.addListener(async (message) => {
  let tabs = await chrome.tabs.query({});

  if (message.action === "groupDomain") {
    let domainTabs = tabs.filter(tab => getDomain(tab.url) === message.domain);
    if (domainTabs.length === 0) return;

    let newWindow = await chrome.windows.create({ tabId: domainTabs[0].id });
    if (domainTabs.length > 1) {
      await chrome.tabs.move(
        domainTabs.slice(1).map(t => t.id),
        { windowId: newWindow.id, index: -1 }
      );
    }
  }

  if (message.action === "groupAllDomains") {
    let groups = {};
    for (let tab of tabs) {
      let domain = getDomain(tab.url);
      if (!domain) continue;
      if (!groups[domain]) groups[domain] = [];
      groups[domain].push(tab.id);
    }

    for (let domain in groups) {
      let tabIds = groups[domain];
      if (tabIds.length > 0) {
        let newWindow = await chrome.windows.create({ tabId: tabIds[0] });
        if (tabIds.length > 1) {
          await chrome.tabs.move(tabIds.slice(1), { windowId: newWindow.id, index: -1 });
        }
      }
    }
  }

  if (message.action === "groupAllTabs") {
    if (tabs.length === 0) return;

    let newWindow = await chrome.windows.create({ tabId: tabs[0].id });
    if (tabs.length > 1) {
      await chrome.tabs.move(
        tabs.slice(1).map(t => t.id),
        { windowId: newWindow.id, index: -1 }
      );
    }
  }
});
