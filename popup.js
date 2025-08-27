function getDomain(url) {
  try {
    let hostname = new URL(url).hostname;
    let parts = hostname.split(".");
    return parts.slice(-2).join(".");
  } catch {
    return null;
  }
}

async function loadDomains() {
  let tabs = await chrome.tabs.query({});
  let domains = new Set();

  tabs.forEach(tab => {
    let d = getDomain(tab.url);
    if (d) domains.add(d);
  });

  let container = document.getElementById("domain-list");
  container.innerHTML = "";

  domains.forEach(domain => {
    let btn = document.createElement("button");
    btn.textContent = domain;
    btn.onclick = () => {
      chrome.runtime.sendMessage({ action: "groupDomain", domain: domain });
    };
    container.appendChild(btn);
  });
}

loadDomains();
