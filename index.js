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

window.onclick = function (event) {
  if (event.target.classList.contains("modal")) {
    closeModal(event.target.id);
  }
};

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
  const minWidth = 1200;
  const minHeight = 830;
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
    "./public/text-instruct/pelinohjeet.txt"
  );
  loadModalContent(
    "historyModal",
    "historyContent",
    "./public/text-instruct/lisatietoa.txt"
  );
  loadModalContent(
    "contactsModal",
    "contactsContent",
    "./public/text-instruct/yhteystiedot.txt"
  );
}

// DOM Content Loading
document.addEventListener("DOMContentLoaded", bindEventListeners);
