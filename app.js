const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwjBfOZ3hPoUlsjR5KcHIaDPm1oJUzkHAfV6RuSHGRhkleSPaucHB123ejft1OokcAADA/exec";

const housePage = document.querySelector("#housePage");
const housePanel = document.querySelector(".house-panel");
const votingPage = document.querySelector("#votingPage");
const submitFrame = document.querySelector("#submitFrame");
const houseSubmitBtn = document.querySelector("#houseSubmitBtn");
const houseMessage = document.querySelector("#houseMessage");
const selectedHouseStrip = document.querySelector("#selectedHouseStrip");
const slides = document.querySelector("#slides");
const prevBtn = document.querySelector("#prevBtn");
const nextBtn = document.querySelector("#nextBtn");
const voteForm = document.querySelector("#voteForm");
const submitBtn = document.querySelector("#submitBtn");
const slideCounter = document.querySelector("#slideCounter");
const dotsContainer = document.querySelector("#dots");
const message = document.querySelector("#message");
const DESKTOP_CANDIDATE_WIDTH = 140;
const TABLET_CANDIDATE_WIDTH = 150;
const CANDIDATE_GAP = 14;
const POST_CARD_HORIZONTAL_PADDING = 44;
const SHARED_CANDIDATES = {
  "Head Boy": [["Aarav Nair", "Class X - A"], ["Kabir Sharma", "Class X - C"], ["Rohan Iyer", "Class IX - A"], ["Dev Patel", "Class IX - D"], ["Nikhil Das", "Class VIII - B"], ["Vihaan Rao", "Class VIII - D"]],
  "Head Girl": [["Diya Menon", "Class X - B"], ["Meera Rao", "Class X - D"], ["Sara Khan", "Class IX - B"], ["Ananya Gupta", "Class IX - C"], ["Ishita Roy", "Class VIII - A"], ["Prisha S", "Class VIII - C"]]
};
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

const generatedHousePosts = {
  "Sports Captain": {
    "Yellow House": [["Anvith Rao", "Class X - C"], ["Bhavana Shetty", "Class IX - C"], ["Chirag Naik", "Class VIII - C"], ["Diksha Hegde", "Class X - D"], ["Eshan Kulkarni", "Class IX - D"], ["Faria Joseph", "Class VIII - D"]],
    "Red House": [["Gagan Murthy", "Class X - A"], ["Harini Prabhu", "Class IX - A"], ["Ishaan Thomas", "Class VIII - A"], ["Jasleen Kaur", "Class X - B"], ["Kavin Rao", "Class IX - B"], ["Lekha Suresh", "Class VIII - B"]],
    "Blue House": [["Manas Pai", "Class X - C"], ["Nivedita Roy", "Class IX - C"], ["Ojas Menon", "Class VIII - C"], ["Pavitra Das", "Class X - D"], ["Qadir Ali", "Class IX - D"], ["Ritika Shah", "Class VIII - D"]],
    "Green House": [["Samarjit Nair", "Class X - A"], ["Tanisha Bhat", "Class IX - A"], ["Uday Prakash", "Class VIII - A"], ["Vaidehi Pillai", "Class X - B"], ["Waseem Khan", "Class IX - B"], ["Yamini Reddy", "Class VIII - B"]]
  },
  "Cultural Secretary": {
    "Yellow House": [["Aarohi Desai", "Class X - A"], ["Bhuvika Jain", "Class IX - B"], ["Charan Lal", "Class VIII - C"], ["Devanshi Rao", "Class X - C"], ["Eklavya Sinha", "Class IX - D"], ["Falak Ahmed", "Class VIII - A"]],
    "Red House": [["Garima Kapoor", "Class X - B"], ["Hrishikesh Iyer", "Class IX - A"], ["Ipsita Ghosh", "Class VIII - D"], ["Jatin Verma", "Class X - D"], ["Kashvi Dutta", "Class IX - C"], ["Lakshya Bose", "Class VIII - B"]],
    "Blue House": [["Manya George", "Class X - C"], ["Nakul Bansal", "Class IX - C"], ["Oviya Raman", "Class VIII - C"], ["Pranav Shekar", "Class X - D"], ["Rhea Thomas", "Class IX - D"], ["Siddharth Joshi", "Class VIII - D"]],
    "Green House": [["Tara Mishra", "Class X - A"], ["Utkarsh Nambiar", "Class IX - A"], ["Vanya Chawla", "Class VIII - A"], ["Yogesh Patil", "Class X - B"], ["Zara Fernandes", "Class IX - B"], ["Advik Shenoy", "Class VIII - B"]]
  },
  "Discipline Captain": {
    "Yellow House": [["Bhargav Menon", "Class X - A"], ["Celine Mathew", "Class X - B"], ["Darshan K", "Class IX - A"], ["Eesha Varma", "Class IX - B"], ["Farid Khan", "Class VIII - A"], ["Gayatri Rao", "Class VIII - B"]],
    "Red House": [["Harshith Gowda", "Class X - C"], ["Ira Mehta", "Class X - D"], ["Jayant Kulal", "Class IX - C"], ["Keisha Jain", "Class IX - D"], ["Lalit Narayan", "Class VIII - C"], ["Mitali Sen", "Class VIII - D"]],
    "Blue House": [["Naman Sood", "Class X - A"], ["Oorja S", "Class X - C"], ["Prithvi Raj", "Class IX - A"], ["Radhika N", "Class IX - C"], ["Sahil D", "Class VIII - A"], ["Trisha P", "Class VIII - C"]],
    "Green House": [["Umesh Pai", "Class X - B"], ["Vidya S", "Class X - D"], ["Wahid Rahman", "Class IX - B"], ["Yashika L", "Class IX - D"], ["Zubin Irani", "Class VIII - B"], ["Anmol Batra", "Class VIII - D"]]
  },
  "Literary Secretary": {
    "Yellow House": [["Bina Joseph", "Class X - C"], ["Chetan Reddy", "Class X - D"], ["Disha Agarwal", "Class IX - C"], ["Elvin Dsouza", "Class IX - D"], ["Fiza Ansari", "Class VIII - C"], ["Girish Hebbar", "Class VIII - D"]],
    "Red House": [["Hema Krishnan", "Class X - A"], ["Ivan Pinto", "Class X - B"], ["Jeevika S", "Class IX - A"], ["Keshav R", "Class IX - B"], ["Lina Paul", "Class VIII - A"], ["Moksh S", "Class VIII - B"]],
    "Blue House": [["Niharika D", "Class X - C"], ["Omar Siddiqui", "Class IX - C"], ["Parina Shah", "Class VIII - C"], ["Raghavendra P", "Class X - D"], ["Samaira K", "Class IX - D"], ["Tanish R", "Class VIII - D"]],
    "Green House": [["Urvi Anand", "Class X - A"], ["Vikram B", "Class IX - A"], ["Wamika S", "Class VIII - A"], ["Yatin B", "Class X - B"], ["Zeenat F", "Class IX - B"], ["Abhinav H", "Class VIII - B"]]
  },
  "House Captain": {
    "Yellow House": [["Amitesh Saxena", "Class X - C"], ["Brinda Nair", "Class IX - C"], ["Chandan Rao", "Class VIII - C"], ["Divya Kamath", "Class X - D"], ["Ebrahim Shaikh", "Class IX - D"], ["Freya Thomas", "Class VIII - D"]],
    "Red House": [["Gokul N", "Class X - A"], ["Hiral Mehta", "Class IX - A"], ["Ishanveer Singh", "Class VIII - A"], ["Jiya Menon", "Class X - B"], ["Kartikeya S", "Class IX - B"], ["Lasya R", "Class VIII - B"]],
    "Blue House": [["Madhur B", "Class X - C"], ["Nandita S", "Class IX - C"], ["Omisha K", "Class VIII - C"], ["Pradyumna H", "Class X - D"], ["Rishika P", "Class IX - D"], ["Sujay R", "Class VIII - D"]],
    "Green House": [["Tharun P", "Class X - A"], ["Urvashi N", "Class IX - A"], ["Vedika B", "Class VIII - A"], ["Warren D", "Class X - B"], ["Yuvan M", "Class IX - B"], ["Zaina K", "Class VIII - B"]]
  },
  "House Vice Captain": {
    "Yellow House": [["Anirudh P", "Class X - A"], ["Bhairavi S", "Class IX - A"], ["Chirayu M", "Class VIII - A"], ["Dhanvi R", "Class X - B"], ["Evan Lobo", "Class IX - B"], ["Falguni P", "Class VIII - B"]],
    "Red House": [["Gauransh V", "Class X - C"], ["Hemika T", "Class IX - C"], ["Indrajit S", "Class VIII - C"], ["Jasmeet B", "Class X - D"], ["Kaira S", "Class IX - D"], ["Lavan D", "Class VIII - D"]],
    "Blue House": [["Mitesh K", "Class X - A"], ["Neysa F", "Class IX - C"], ["Ojasvi R", "Class VIII - A"], ["Parthiv A", "Class X - C"], ["Raniya M", "Class IX - A"], ["Sarthak J", "Class VIII - C"]],
    "Green House": [["Tanya P", "Class X - B"], ["Ujjwal S", "Class IX - D"], ["Veda Iyer", "Class VIII - B"], ["Wihan N", "Class X - D"], ["Yamini J", "Class IX - B"], ["Zeeshan M", "Class VIII - D"]]
  },
  "House Prefect": {
    "Yellow House": [["Apeksha V", "Class X - A"], ["Basil K", "Class IX - B"], ["Chinmayi D", "Class VIII - C"], ["Druv S", "Class X - C"], ["Esha N", "Class IX - D"], ["Firoz A", "Class VIII - A"]],
    "Red House": [["Gitali P", "Class X - B"], ["Haroon K", "Class IX - A"], ["Inaya S", "Class VIII - D"], ["Jeet M", "Class X - D"], ["Krupali D", "Class IX - C"], ["Lohith G", "Class VIII - B"]],
    "Blue House": [["Mehul T", "Class X - C"], ["Nisarga H", "Class IX - C"], ["Oindrila B", "Class VIII - C"], ["Prakash V", "Class X - D"], ["Rumana A", "Class IX - D"], ["Saket N", "Class VIII - D"]],
    "Green House": [["Tisha C", "Class X - A"], ["Udayan K", "Class IX - A"], ["Vishaka M", "Class VIII - A"], ["Wasim P", "Class X - B"], ["Yagnesh R", "Class IX - B"], ["Zoya Fernandes", "Class VIII - B"]]
  },
  "House Secretary": {
    "Yellow House": [["Akhila Raman", "Class X - C"], ["Benedict Paul", "Class IX - C"], ["Cheshta J", "Class VIII - C"], ["Deepansh M", "Class X - D"], ["Eva Fernandes", "Class IX - D"], ["Fahad Salim", "Class VIII - D"]],
    "Red House": [["Gauri N", "Class X - A"], ["Hitesh B", "Class IX - A"], ["Ishita S", "Class VIII - A"], ["Jovita L", "Class X - B"], ["Krishang P", "Class IX - B"], ["Leona D", "Class VIII - B"]],
    "Blue House": [["Mahika R", "Class X - C"], ["Nirav Shah", "Class IX - D"], ["Oshin D", "Class VIII - C"], ["Punit S", "Class X - D"], ["Roshni M", "Class IX - C"], ["Shaan K", "Class VIII - D"]],
    "Green House": [["Tenzin L", "Class X - A"], ["Urvil P", "Class IX - B"], ["Vanshika G", "Class VIII - A"], ["Wafa K", "Class X - B"], ["Yashraj D", "Class IX - A"], ["Zehra Ali", "Class VIII - B"]]
  }
};

let selectedHouse = "";
let currentSlide = 0;

renderCandidateRows(buildLocalCandidateRows());
const postCards = Array.from(document.querySelectorAll(".post-card"));

postCards.forEach(function (_card, index) {
  const dot = document.createElement("button");
  dot.className = "dot";
  dot.type = "button";
  dot.setAttribute("aria-label", "Go to post " + (index + 1));
  dot.addEventListener("click", function () {
    goToSlide(index);
  });
  dotsContainer.appendChild(dot);
});

installImageFallbacks();

if (shouldUseSheetCandidates()) {
  loadCandidateRowsFromSheet();
}

document.querySelectorAll("input[name='selected_house']").forEach(function (input) {
  input.addEventListener("change", function () {
    document.body.dataset.house = input.value.toLowerCase().replace(" house", "");
    houseMessage.textContent = "";
  });
});

houseSubmitBtn.addEventListener("click", function () {
  const selectedInput = document.querySelector("input[name='selected_house']:checked");

  if (!selectedInput) {
    houseMessage.textContent = "Please select your house before proceeding.";
    return;
  }

  selectedHouse = selectedInput.value;
  document.body.dataset.house = selectedHouse.toLowerCase().replace(" house", "");
  selectedHouseStrip.textContent = selectedHouse + " voting ballot";
  applyHouseSelection();
  housePage.classList.add("hidden");
  votingPage.classList.remove("hidden");
  submitFrame.classList.remove("hidden");
  goToSlide(0);
});

prevBtn.addEventListener("click", function () {
  goToSlide(currentSlide - 1);
});

nextBtn.addEventListener("click", function () {
  const selected = getVisibleSelection(postCards[currentSlide]);
  if (!selected) {
    // showMessage("Please select one candidate or NOTA before moving to the next post.", true);
    showMessage("Please select one candidate before moving to the next post.", true);
    return;
  }
  goToSlide(currentSlide + 1);
});

voteForm.addEventListener("change", function (event) {
  const selectedInput = event.target;
  if (!selectedInput.matches("input[type='radio']")) {
    return;
  }

  selectedInput.closest(".post-card").querySelectorAll(".candidate-card").forEach(function (card) {
    card.classList.remove("selected");
  });
  selectedInput.closest(".candidate-card").classList.add("selected");
  showMessage("", false);
});

voteForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const missingPost = postCards.find(function (card) {
    return !getVisibleSelection(card);
  });

  if (missingPost) {
    goToSlide(postCards.indexOf(missingPost));
    // showMessage("Please vote for this post or choose NOTA before submitting.", true);
    showMessage("Please vote for this post before submitting.", true);
    return;
  }

  const payload = {
    submittedAt: new Date().toISOString(),
    selectedHouse: selectedHouse,
    posts: {}
  };

  postCards.forEach(function (card) {
    const postName = getSubmittedPostName(card);
    const selectedValue = getVisibleSelection(card).value;
    const candidateNames = getVisibleInputs(card).map(function (input) {
      return input.value;
    });

    payload.posts[postName] = {
      selectedCandidate: selectedValue,
      candidateNames: candidateNames
    };
  });

  const missingPayloadPosts = getExpectedSubmittedPostNames().filter(function (postName) {
    return !payload.posts[postName];
  });

  if (missingPayloadPosts.length > 0) {
    showMessage("Vote not submitted. Missing posts: " + missingPayloadPosts.join(", "), true);
    return;
  }

  submitBtn.disabled = true;
  showMessage("Submitting vote...", false);

  fetch(GOOGLE_APPS_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    body: buildFormBody(payload)
  })
    .then(function () {
      voteForm.reset();
      document.querySelectorAll(".candidate-card").forEach(function (card) {
        card.classList.remove("selected");
      });
      housePage.classList.remove("hidden");
      votingPage.classList.add("hidden");
      submitFrame.classList.add("hidden");
      houseMessage.textContent = "";
      selectedHouse = "";
      document.body.removeAttribute("data-house");
      goToSlide(0);
      showMessage("Vote submitted to Google Sheets.", false, true);
    })
    .catch(function () {
      showMessage("Vote could not be submitted. Check the Apps Script URL and deployment permissions.", true);
    })
    .finally(function () {
      submitBtn.disabled = false;
    });
});

function loadCandidateRowsFromSheet() {
  fetch(GOOGLE_APPS_SCRIPT_URL + "?action=candidates&t=" + Date.now(), {
    method: "GET",
    cache: "no-store"
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }
      return response.json();
    })
    .then(function (data) {
      if (!data || data.status !== "ok" || !Array.isArray(data.posts) || data.posts.length === 0) {
        throw new Error("Candidate sheet returned no usable rows.");
      }

      renderCandidateRows(data.posts);
      installImageFallbacks();

      if (selectedHouse) {
        applyHouseSelection();
      }

      goToSlide(currentSlide);
    })
    .catch(function () {
      renderCandidateRows(buildLocalCandidateRows());
      installImageFallbacks();
    });
}

function shouldUseSheetCandidates() {
  const params = new URLSearchParams(window.location.search);
  return params.get("source") === "sheet" || params.get("candidates") === "sheet";
}

function buildLocalCandidateRows() {
  const rows = [];

  Object.keys(SHARED_CANDIDATES).forEach(function (postName) {
    rows.push({
      post: postName,
      candidates: SHARED_CANDIDATES[postName].map(function (candidate) {
        return {
          name: candidate[0],
          className: candidate[1]
        };
      })
    });
  });

  HOUSE_ORDER.forEach(function (houseName) {
    HOUSE_POST_ORDER.forEach(function (postName) {
      rows.push({
        post: houseName + " - " + postName,
        candidates: generatedHousePosts[postName][houseName].map(function (candidate) {
          return {
            name: candidate[0],
            className: candidate[1]
          };
        })
      });
    });
  });

  return rows;
}

function renderCandidateRows(candidateRows) {
  const rowsByPost = {};

  candidateRows.forEach(function (row) {
    rowsByPost[row.post] = row.candidates || [];
  });

  renderSharedPostCandidates("Head Boy", rowsByPost["Head Boy"] || []);
  renderSharedPostCandidates("Head Girl", rowsByPost["Head Girl"] || []);

  HOUSE_POST_ORDER.forEach(function (postName) {
    const card = document.querySelector(".house-post[data-post-name='" + postName + "']");

    if (!card) {
      return;
    }

    card.querySelectorAll(".candidate-set").forEach(function (existingSet) {
      existingSet.remove();
    });

    HOUSE_ORDER.forEach(function (houseName) {
      const fullPostName = houseName + " - " + postName;
      const grid = document.createElement("div");
      grid.className = "candidate-grid candidate-set";
      grid.dataset.house = houseName;

      (rowsByPost[fullPostName] || []).forEach(function (candidate) {
        grid.appendChild(createCandidateCard(postName, houseName, candidate.name, candidate.className));
      });

      card.appendChild(grid);
    });
  });
}

function renderSharedPostCandidates(postName, candidates) {
  const card = document.querySelector(".post-card[data-post-name='" + postName + "']");
  const grid = card ? card.querySelector(".candidate-grid") : null;

  if (!grid) {
    return;
  }

  grid.innerHTML = "";

  candidates.forEach(function (candidate) {
    grid.appendChild(createCandidateCard(postName, "", candidate.name, candidate.className));
  });
}

function createCandidateCard(postName, houseName, candidateName, candidateClass) {
  const label = document.createElement("label");
  const input = document.createElement("input");
  const image = document.createElement("img");
  const name = document.createElement("span");
  const className = document.createElement("span");
  const campaignLogo = document.createElement("img");
  const radioName = makeRadioName(postName, houseName);

  label.className = "candidate-card";
  input.type = "radio";
  input.name = radioName;
  input.value = candidateName;
  image.className = "candidate-photo";
  image.src = "images/" + radioName + "-" + slugify(candidateName) + ".jpg";
  image.alt = candidateName;
  name.className = "candidate-name";
  name.textContent = candidateName;
  className.className = "candidate-class";
  className.textContent = candidateClass;
  campaignLogo.className = "campaign-logo";
  campaignLogo.src = "images/" + radioName + "-" + slugify(candidateName) + "-logo.png";
  campaignLogo.alt = candidateName + " campaign logo";

  label.appendChild(input);
  label.appendChild(image);
  label.appendChild(name);
  label.appendChild(className);
  label.appendChild(campaignLogo);
  return label;
}

// function createNotaCard(postName, houseName) {
//   const label = document.createElement("label");
//   const input = document.createElement("input");
//   const mark = document.createElement("span");
//   const name = document.createElement("span");
//   const className = document.createElement("span");
//
//   label.className = "candidate-card nota-card";
//   input.type = "radio";
//   input.name = makeRadioName(postName, houseName);
//   input.value = "NOTA";
//   mark.className = "nota-mark";
//   mark.textContent = "NOTA";
//   name.className = "candidate-name";
//   name.textContent = "None of the Above";
//   className.className = "candidate-class";
//   className.textContent = "No candidate selected";
//
//   label.appendChild(input);
//   label.appendChild(mark);
//   label.appendChild(name);
//   label.appendChild(className);
//   return label;
// }

function applyHouseSelection() {
  document.querySelectorAll(".candidate-set").forEach(function (set) {
    const isVisible = set.dataset.house === selectedHouse;
    set.classList.toggle("hidden", !isVisible);
    set.querySelectorAll("input").forEach(function (input) {
      input.disabled = !isVisible;
    });
  });

  postCards.forEach(function (card) {
    const heading = card.querySelector("h2");
    const baseName = card.dataset.postName;
    heading.textContent = card.dataset.sharedPost === "true" ? baseName : selectedHouse + " - " + baseName;
  });
}

function getSubmittedPostName(card) {
  const baseName = card.dataset.postName;
  return card.dataset.sharedPost === "true" ? baseName : selectedHouse + " - " + baseName;
}

function getExpectedSubmittedPostNames() {
  return postCards.map(function (card) {
    return getSubmittedPostName(card);
  });
}

function getVisibleInputs(card) {
  const visibleSet = card.querySelector(".candidate-set:not(.hidden)");
  const scope = visibleSet || card;
  return Array.from(scope.querySelectorAll("input[type='radio']")).filter(function (input) {
    return !input.disabled;
  });
}

function getVisibleSelection(card) {
  return getVisibleInputs(card).find(function (input) {
    return input.checked;
  });
}

function goToSlide(index) {
  currentSlide = Math.max(0, Math.min(index, postCards.length - 1));
  updateSliderSize();
  slides.style.transform = "translateX(-" + currentSlide * 100 + "%)";

  postCards.forEach(function (card, cardIndex) {
    card.classList.toggle("active", cardIndex === currentSlide);
  });

  votingPage.classList.toggle("house-post-active", postCards[currentSlide].dataset.sharedPost !== "true");

  Array.from(dotsContainer.children).forEach(function (dot, dotIndex) {
    dot.classList.toggle("active", dotIndex === currentSlide);
  });

  prevBtn.disabled = currentSlide === 0;
  nextBtn.disabled = currentSlide === postCards.length - 1;
  slideCounter.textContent = "Post " + (currentSlide + 1) + " of " + postCards.length;
}

function updateSliderSize() {
  const visibleCandidateCount = Math.max(1, getVisibleInputs(postCards[currentSlide]).length);
  let visibleColumns = visibleCandidateCount;
  let cardWidth = DESKTOP_CANDIDATE_WIDTH;

  if (window.innerWidth <= 420) {
    visibleColumns = 1;
    voteForm.style.width = "";
  } else if (window.innerWidth <= 720) {
    visibleColumns = Math.min(2, visibleCandidateCount);
    voteForm.style.width = "";
  } else if (window.innerWidth <= 1100) {
    visibleColumns = Math.min(4, visibleCandidateCount);
    cardWidth = TABLET_CANDIDATE_WIDTH;
  }

  const sliderWidth = (visibleColumns * cardWidth) + ((visibleColumns - 1) * CANDIDATE_GAP) + POST_CARD_HORIZONTAL_PADDING;
  votingPage.style.setProperty("--visible-candidate-columns", visibleColumns);
  votingPage.style.setProperty("--slider-window-width", sliderWidth + "px");
}

function installImageFallbacks() {
  document.querySelectorAll(".candidate-photo").forEach(function (image) {
    image.addEventListener("error", function () {
      const label = image.closest(".candidate-card");
      const candidateName = label.querySelector(".candidate-name").textContent.trim();
      const initials = candidateName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(function (part) {
          return part.charAt(0).toUpperCase();
        })
        .join("");

      const svg =
        "<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'>" +
        "<rect width='220' height='220' rx='18' fill='%23e7edf5'/>" +
        "<circle cx='110' cy='82' r='38' fill='%2391a7bd'/>" +
        "<path d='M45 190c10-45 42-68 65-68s55 23 65 68' fill='%2391a7bd'/>" +
        "<text x='110' y='206' text-anchor='middle' font-family='Arial' font-size='26' font-weight='700' fill='%23172033'>" +
        initials +
        "</text></svg>";

      image.src = "data:image/svg+xml," + svg;
    });
  });

  document.querySelectorAll(".campaign-logo").forEach(function (image) {
    image.addEventListener("error", function () {
      const svg =
        "<svg xmlns='http://www.w3.org/2000/svg' width='180' height='64' viewBox='0 0 180 64'>" +
        "<rect width='180' height='64' rx='8' fill='%23ffffff'/>" +
        "<rect x='1' y='1' width='178' height='62' rx='7' fill='none' stroke='%23d6deea' stroke-width='2'/>" +
        "<text x='90' y='39' text-anchor='middle' font-family='Arial' font-size='18' font-weight='700' fill='%235d687d'>LOGO</text>" +
        "</svg>";

      image.src = "data:image/svg+xml," + svg;
    });
  });
}

function showMessage(text, isError, isSuccess) {
  message.textContent = text;
  message.classList.toggle("error", Boolean(isError));
  message.classList.toggle("success", Boolean(isSuccess));
}

function buildFormBody(payload) {
  const body = new URLSearchParams();
  body.append("payload", JSON.stringify(payload));
  return body;
}

function makeRadioName(postName, houseName) {
  return slugify(houseName + " " + postName).replace(/-/g, "_");
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

goToSlide(0);

window.addEventListener("resize", function () {
  updateSliderSize();
});  