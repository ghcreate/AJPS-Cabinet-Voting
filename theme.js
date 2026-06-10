(function () {
  const storageKey = "amaraJyothiVotingTheme";
  const savedTheme = localStorage.getItem(storageKey);
  let currentTheme = savedTheme === "dark" ? "dark" : "light";

  document.documentElement.dataset.theme = currentTheme;

  function updateThemeButtons() {
    document.querySelectorAll("[data-theme-toggle]").forEach(function (button) {
      button.textContent = currentTheme === "dark" ? "Sunshine" : "Midnight";
      button.setAttribute(
        "aria-label",
        currentTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      );
    });
  }

  function applyTheme(theme) {
    currentTheme = theme;
    document.documentElement.dataset.theme = currentTheme;
    localStorage.setItem(storageKey, currentTheme);
    updateThemeButtons();
  }

  document.addEventListener("DOMContentLoaded", function () {
    updateThemeButtons();

    document.querySelectorAll("[data-theme-toggle]").forEach(function (button) {
      button.addEventListener("click", function () {
        applyTheme(currentTheme === "dark" ? "light" : "dark");
      });
    });
  });
})(); 
