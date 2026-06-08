const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx_7ddWf7HZ138OJmC94AlZ2QP07qI63zi4no4gyqvyOnnkAxJCC1IQMQzZh2UpkitZZg/exec";

const slides = document.querySelector("#slides");
const postCards = Array.from(document.querySelectorAll(".post-card"));
const prevBtn = document.querySelector("#prevBtn");
const nextBtn = document.querySelector("#nextBtn");
const voteForm = document.querySelector("#voteForm");
const submitBtn = document.querySelector("#submitBtn");
const slideCounter = document.querySelector("#slideCounter");
const dotsContainer = document.querySelector("#dots");
const message = document.querySelector("#message");

let currentSlide = 0;

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

document.querySelectorAll(".candidate-card img").forEach(function (image) {
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

prevBtn.addEventListener("click", function () {
  goToSlide(currentSlide - 1);
});

nextBtn.addEventListener("click", function () {
  const selected = postCards[currentSlide].querySelector("input[type='radio']:checked");
  if (!selected) {
    showMessage("Please select one candidate or NOTA before moving to the next post.", true);
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
    return !card.querySelector("input[type='radio']:checked");
  });

  if (missingPost) {
    goToSlide(postCards.indexOf(missingPost));
    showMessage("Please vote for this post or choose NOTA before submitting.", true);
    return;
  }

  if (!GOOGLE_APPS_SCRIPT_URL || GOOGLE_APPS_SCRIPT_URL.indexOf("PASTE_YOUR") === 0) {
    showMessage("Paste your deployed Google Apps Script web app URL in app.js before collecting votes.", true);
    return;
  }

  const payload = {
    submittedAt: new Date().toISOString(),
    posts: {}
  };

  postCards.forEach(function (card) {
    const postName = card.dataset.postName;
    const selectedValue = card.querySelector("input[type='radio']:checked").value;
    const candidateNames = Array.from(card.querySelectorAll("input[type='radio']")).map(function (input) {
      return input.value;
    });

    payload.posts[postName] = {
      selectedCandidate: selectedValue,
      candidateNames: candidateNames
    };
  });

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

function goToSlide(index) {
  currentSlide = Math.max(0, Math.min(index, postCards.length - 1));
  slides.style.transform = "translateX(-" + currentSlide * 100 + "%)";

  postCards.forEach(function (card, cardIndex) {
    card.classList.toggle("active", cardIndex === currentSlide);
  });

  Array.from(dotsContainer.children).forEach(function (dot, dotIndex) {
    dot.classList.toggle("active", dotIndex === currentSlide);
  });

  prevBtn.disabled = currentSlide === 0;
  nextBtn.disabled = currentSlide === postCards.length - 1;
  slideCounter.textContent = "Post " + (currentSlide + 1) + " of " + postCards.length;
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

goToSlide(0);  
