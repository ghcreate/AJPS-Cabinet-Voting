const RESULTS_URL = "https://script.google.com/macros/s/AKfycbx_-3GLmfMaFMI5b0D2QDh6Tt9NlAzrqguyj-FczKC7XBiD1mCN_arpP-wHmAlS_3UkjQ/exec";
const REFRESH_INTERVAL_MS = 15000;
const REQUEST_TIMEOUT_MS = 30000;

const resultsGrid = document.querySelector("#resultsGrid");
const adminStatus = document.querySelector("#adminStatus");
const refreshBtn = document.querySelector("#refreshBtn");

let callbackCounter = 0;
let refreshTimer;

refreshBtn.addEventListener("click", function () {
  loadResults();
});

function loadResults() {
  clearTimeout(refreshTimer);
  adminStatus.textContent = "Refreshing result...";
  refreshBtn.disabled = true;

  loadResultsWithFetch()
    .catch(function () {
      return loadResultsWithJsonp();
    })
    .then(function (data) {
      renderResults(data);
    })
    .catch(function (error) {
      adminStatus.textContent = "Could not load results: " + error.message;
    })
    .finally(function () {
      refreshBtn.disabled = false;
    });
}

function loadResultsWithFetch() {
  const controller = new AbortController();
  const timeoutId = setTimeout(function () {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  return fetch(RESULTS_URL + "?action=results&t=" + Date.now(), {
    method: "GET",
    cache: "no-store",
    signal: controller.signal
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }
      return response.json();
    })
    .finally(function () {
      clearTimeout(timeoutId);
    });
}

function loadResultsWithJsonp() {
  callbackCounter += 1;
  const callbackName = "handleVotingResults" + callbackCounter;
  const script = document.createElement("script");

  return new Promise(function (resolve, reject) {
    let didFinish = false;
    const timeoutId = setTimeout(function () {
      if (didFinish) {
        return;
      }

      didFinish = true;
      cleanupJsonp(script, callbackName);
      reject(new Error("request timed out after 30 seconds"));
    }, REQUEST_TIMEOUT_MS);

    window[callbackName] = function (data) {
      if (didFinish) {
        return;
      }

      didFinish = true;
      clearTimeout(timeoutId);
      cleanupJsonp(script, callbackName);
      resolve(data);
    };

    script.onerror = function () {
      if (didFinish) {
        return;
      }

      didFinish = true;
      clearTimeout(timeoutId);
      cleanupJsonp(script, callbackName);
      reject(new Error("script request failed"));
    };

    script.src = RESULTS_URL + "?action=results&callback=" + callbackName + "&t=" + Date.now();
    document.body.appendChild(script);
  });
}

function renderResults(data) {
  if (!data || data.status !== "ok") {
    adminStatus.textContent = "Results endpoint returned an error.";
    return;
  }

  const results = data.results || [];
  resultsGrid.innerHTML = "";

  if (results.length === 0) {
    adminStatus.textContent = "No votes recorded yet.";
    return;
  }

  results.forEach(function (post) {
    resultsGrid.appendChild(createResultCard(post));
  });

  const generatedAt = data.generatedAt ? new Date(data.generatedAt) : new Date();
  adminStatus.textContent = "Last updated " + generatedAt.toLocaleString();
  scheduleNextRefresh();
}

function createResultCard(post) {
  const card = document.createElement("article");
  const header = document.createElement("div");
  const title = document.createElement("h3");
  const count = document.createElement("span");
  const list = document.createElement("div");
  const highestTotal = Math.max.apply(
    null,
    post.candidates.map(function (candidate) {
      return candidate.total;
    }).concat([1])
  );

  card.className = "result-card";
  header.className = "result-card-header";
  title.textContent = post.postName;
  count.textContent = post.totalVotes + " votes";
  list.className = "result-list";

  header.appendChild(title);
  header.appendChild(count);
  card.appendChild(header);

  post.candidates.forEach(function (candidate, index) {
    const row = document.createElement("div");
    const name = document.createElement("span");
    const total = document.createElement("strong");
    const barTrack = document.createElement("div");
    const bar = document.createElement("div");
    const percent = highestTotal === 0 ? 0 : Math.round((candidate.total / highestTotal) * 100);

    row.className = "result-row";
    name.className = "result-name";
    total.className = "result-total";
    barTrack.className = "result-bar-track";
    bar.className = "result-bar";

    if (index === 0 && candidate.total > 0) {
      row.classList.add("leading");
    }

    name.textContent = candidate.name;
    total.textContent = candidate.total;
    bar.style.width = percent + "%";

    barTrack.appendChild(bar);
    row.appendChild(name);
    row.appendChild(total);
    row.appendChild(barTrack);
    list.appendChild(row);
  });

  card.appendChild(list);
  return card;
}

function cleanupJsonp(script, callbackName) {
  if (script.parentNode) {
    script.parentNode.removeChild(script);
  }
  delete window[callbackName];
}

function scheduleNextRefresh() {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(loadResults, REFRESH_INTERVAL_MS);
}

loadResults(); 
