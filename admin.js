const RESULTS_URL = "https://script.google.com/macros/s/AKfycbx_-3GLmfMaFMI5b0D2QDh6Tt9NlAzrqguyj-FczKC7XBiD1mCN_arpP-wHmAlS_3UkjQ/exec";
const REFRESH_INTERVAL_MS = 15000;
const REQUEST_TIMEOUT_MS = 30000;

const resultsGrid = document.querySelector("#resultsGrid");
const adminStatus = document.querySelector("#adminStatus");
const refreshBtn = document.querySelector("#refreshBtn");
const SHARED_POST_ORDER = ["Head Boy", "Head Girl"];
const HOUSE_ORDER = ["Yellow House", "Red House", "Blue House", "Green House"];
const HOUSE_POST_ORDER = [
  "Sports Captain",
  "Cultural Secretary",
  "Discipline Captain",
  "Literary Secretary",
  "House Captain",
  "House Vice Captain",
  "House Prefect",
  "House Secretary"
];

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

  renderSharedResults(results);
  renderHouseResults(results);

  const generatedAt = data.generatedAt ? new Date(data.generatedAt) : new Date();
  adminStatus.textContent = "Last updated " + generatedAt.toLocaleString();
  scheduleNextRefresh();
}

function renderSharedResults(results) {
  const sharedGrid = document.createElement("section");
  sharedGrid.className = "shared-results-grid";

  SHARED_POST_ORDER.forEach(function (postName) {
    const post = findPost(results, postName) || createEmptyPost(postName);
    sharedGrid.appendChild(createResultCard(post));
  });

  resultsGrid.appendChild(sharedGrid);
}

function renderHouseResults(results) {
  const housesContainer = document.createElement("section");
  housesContainer.className = "house-results";

  HOUSE_ORDER.forEach(function (houseName) {
    const houseSection = createHouseSection(houseName, results);

    if (houseSection) {
      housesContainer.appendChild(houseSection);
    }
  });

  if (housesContainer.children.length > 0) {
    resultsGrid.appendChild(housesContainer);
  }
}

function createHouseSection(houseName, results) {
  const details = document.createElement("details");
  const summary = document.createElement("summary");
  const arrow = document.createElement("span");
  const title = document.createElement("span");
  const count = document.createElement("strong");
  const cards = document.createElement("div");

  details.className = "house-result-section " + slugify(houseName);
  details.open = true;
  summary.className = "house-result-summary";
  arrow.className = "house-result-arrow";
  arrow.textContent = ">";
  title.textContent = houseName;
  title.className = "house-result-title";
  cards.className = "house-result-cards";

  HOUSE_POST_ORDER.forEach(function (postName) {
    const fullPostName = houseName + " - " + postName;
    const post = findPost(results, fullPostName) || createEmptyPost(fullPostName);
    cards.appendChild(createResultCard(post));
  });

  count.textContent = HOUSE_POST_ORDER.length + " posts";
  summary.appendChild(arrow);
  summary.appendChild(title);
  summary.appendChild(count);
  details.appendChild(summary);
  details.appendChild(cards);
  return details;
}

function findPost(results, postName) {
  return results.find(function (post) {
    return post.postName === postName;
  });
}

function createEmptyPost(postName) {
  return {
    postName: postName,
    totalVotes: 0,
    candidates: []
  };
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
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

  if (post.candidates.length === 0) {
    const empty = document.createElement("p");
    empty.className = "result-empty";
    empty.textContent = "No votes recorded yet.";
    card.appendChild(empty);
    return card;
  }

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