// Utility Functions
function navigate(url) {
  document.body.classList.add("fade-out");
  setTimeout(() => (window.location.href = url), 2000);
}

function openModal(modalId) {
  document.getElementById(modalId).style.display = "block";
  updateMenuIconAndContent(false);
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}

function toggleMenu() {
  var menuIcon = document.querySelector(".menu-icon");
  menuIcon.classList.toggle("open");
  var menuContent = document.getElementById("menuContent");
  menuContent.style.display =
    menuContent.style.display === "block" ? "none" : "block";
}

function updateMenuIconAndContent(reset) {
  var menuIcon = document.querySelector(".menu-icon");
  var menuContent = document.getElementById("menuContent");

  if (reset && menuIcon.classList.contains("open")) {
    menuIcon.classList.remove("open");
  }
  menuContent.style.display = reset ? "none" : menuContent.style.display;
}

function loadModalContent(modalId, contentId, filePath) {
  fetch(filePath)
    .then((response) => response.text())
    .then((htmlText) => {
      const contentElement = document.getElementById(contentId);
      contentElement.innerHTML = htmlText; // Use innerHTML to render HTML content
    })
    .catch((error) =>
      console.error("Error loading content for " + modalId + ":", error)
    );
}

// Function to handle window resize
function handleWindowResize() {
  const minWidth = 1024;
  const minHeight = 768;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const resolutionWarning = document.getElementById("resolution-warning");
  resolutionWarning.style.display =
    width < minWidth || height < minHeight ? "block" : "none";
}

// Event Binding Functions
function bindEventListeners() {
  const createGameBtn = document.getElementById("createGameBtn");
  const closeModalButton = document.getElementById("closeModalButton");
  const centerImage = document.getElementById("centerImage");

  if (createGameBtn) {
    createGameBtn.addEventListener("click", () => navigate("gameA.html"));
  }

  if (closeModalButton) {
    closeModalButton.addEventListener("click", () => closeModal("myModal"));
  }

  if (centerImage) {
    centerImage.addEventListener("dragstart", (e) => e.preventDefault());
  }

  window.addEventListener("resize", handleWindowResize);
  document.addEventListener("contextmenu", (e) => e.preventDefault());

  handleWindowResize();

  // Initialization
  loadModalContent(
    "instructionsModal",
    "instructionsContent",
    "./text-instruct/pelinohjeet-main.txt"
  );
  loadModalContent(
    "historyModal",
    "historyContent",
    "./text-instruct/viitteethistoria-main.txt"
  );
  loadModalContent(
    "contactsModal",
    "contactsContent",
    "./text-instruct/yhteystiedot-main.txt"
  );
}

// DOM Content Loading
document.addEventListener("DOMContentLoaded", bindEventListeners);
