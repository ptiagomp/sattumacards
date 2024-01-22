// Global Variables

const cursorColors = ["red", "blue", "green", "orange", "purple", "pink", "yellow", "cyan", "magenta", "brown"];
const socket = io(); // Socket.io instance for real-time communication
let myUserName = ""; // Variable to store the username of the current user

// DOMContentLoaded Event Handler
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded and parsed");

  setupGame(); // Setup game environment
  setupDragAndDrop(); // Initialize drag and drop functionality
  setupButtonHandlers(); // Set up button event handlers
});

document.addEventListener('mousemove', throttle((event) => {
  socket.emit('cursorMove', { x: event.pageX, y: event.pageY, userId: myUserName, userName: myUserName });
}, 100));

socket.on('cursorUpdate', (data) => {
  renderCursor(data);
});

socket.on('playerDisconnected', (userId) => {
  const cursor = document.getElementById(`cursor-${userId}`);
  if (cursor) {
      cursor.remove();
  }
});

// 4. Implement the `renderCursor` Function:
// Create a function to render or update the cursor elements on the page.


function renderCursor(data) {
  let cursor = document.getElementById(`cursor-${data.userId}`);
  if (!cursor) {
      cursor = document.createElement('div');
      cursor.id = `cursor-${data.userId}`;
      cursor.classList.add('cursor');

      // Create a label for the username
      const label = document.createElement('span');
      label.textContent = data.userName;
      label.classList.add('cursor-label');

      cursor.appendChild(label);
      document.body.appendChild(cursor);
  }
  cursor.style.left = `${data.x}px`;
  cursor.style.top = `${data.y}px`;

  // Assign a color based on the username or some unique identifier
  const colorIndex = Math.abs(hashCode(data.userId)) % cursorColors.length;
  cursor.style.backgroundColor = cursorColors[colorIndex];
}


// Hash function to generate a number from a string (for color assignment)
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
  }
  return hash;
}


function throttle(callback, limit) {
  let waiting = false;
  return function () {
      if (!waiting) {
          callback.apply(this, arguments);
          waiting = true;
          setTimeout(() => {
              waiting = false;
          }, limit);
      }
  };
}



// DOM Elements
const decks = document.querySelectorAll(".deck"); // Collection of all decks
const resetBtn = document.getElementById("resetBtn"); // Reset button
const dropzones = document.querySelectorAll(".dropzone"); // Collection of all dropzones

// Data Definitions
const deckImages = [
  "tilanne-fcard.webp",
  "tila-fcard.webp",
  "keinot-fcard.webp",
  "resurssit-fcard.webp",
  "opetusmuoto-fcard.webp",
  "sattuma-fcard.webp",
]; // Array of deck image filenames

function setupGame() {
  // Configure each dropzone with a unique index and ID
  dropzones.forEach((dropzone, index) => {
    // Set a data attribute 'index' for each dropzone, converting the index to a string
    dropzone.dataset.index = index.toString();
    // Assign an ID to each dropzone, using its index for uniqueness
    dropzone.id = `dropzone-${index}`;
  });

  console.log("Dropzones configured with unique indexes and IDs.");

  // Create the decks required for the game
  createDecks();

  console.log("Game decks created and set up successfully.");
}


/**
 * Creates a deck of cards.
 *
 * @param {HTMLElement} deck - The deck element to which cards will be added.
 * @param {number} index - The index of the deck.
 */

function createDeck(deck, index) {
  console.log(`Starting to create deck at index ${index}.`);

  // Create 10 cards with a staggered delay
  for (let i = 0; i < 10; i++) {
    setTimeout(() => {
      createCard(deck, index, i);
      console.log(`Created card ${i} in deck ${index}.`);
    }, i * 100);
  }

  console.log(`Finished creating deck at index ${index}.`);
}


function createDecks() {
  console.log("Starting to create decks...");

  // Create each deck
  decks.forEach((deck, index) => {
    console.log(`Creating deck ${index + 1}...`);
    createDeck(deck, index);
  });

  console.log("Scheduling removal of initial animation class from all cards...");

  // Remove the initial animation class from all cards after 1200ms
  setTimeout(() => {
    document.querySelectorAll(".card").forEach((card, cardIndex) => {
      card.classList.remove("initial-animation");
      console.log(`Removed initial animation class from card ${cardIndex + 1}`);
    });
    console.log("All initial animation classes removed.");
  }, 1200);
}


function updateMyUserNameDisplay() {
  // Get the user name display element
  const myUserNameDisplay = document.getElementById("myUserNameDisplay");

  // Check if the element exists and update its text content
  if (myUserNameDisplay) {
    myUserNameDisplay.textContent = myUserName + ": sinä";
    // Log a message indicating that the element was found and updated
    console.log("Updated myUserNameDisplay to:", myUserNameDisplay.textContent);
  } else {
    // Log a message if the element was not found
    console.log("Could not find the myUserNameDisplay element in the DOM.");
  }
}


function loadRandomWord(deckIndex, card) {
  console.log(`Requesting text for card with ID: ${card.id} from deck index: ${deckIndex}`);
  socket.emit("requestCardText", { deckIndex: deckIndex, cardId: card.id });
}


function createCard(deck, index, cardIndex) {
  // Create the card element
  const card = document.createElement("div");
  card.className = "card initial-animation";
  card.draggable = true;
  card.id = `deck-${index}-card-${cardIndex}`;
  card.dataset.deck = index;

  // Create the front side of the card
  const front = document.createElement("div");
  front.className = "front";
  front.style.backgroundImage = "url('./back_card_imgs/sattuma-bkg.png')";
  front.style.backgroundSize = "cover";
  front.style.backgroundColor = "#939598";

  // Create the back side of the card
  const back = document.createElement("div");
  back.className = "back";
  back.style.backgroundImage = `url('./front_card_img/${deckImages[index]}')`;
  back.style.backgroundSize = "cover";
  back.style.backgroundColor = "white";

  console.log(`Card ${cardIndex} created in deck ${index} (ID: ${deck.id})`);



  // Append front and back to the card, and the card to the deck
  card.append(front, back);
  deck.appendChild(card);


  

  // Load a random text on the card
  loadRandomWord(index, card);

  card.addEventListener("dblclick", () => {
    if (!isInUsedCardsPile(card)) {
      moveToUsedCardsPile(card);
    }
  });
  
    // Add click event listener for card flip
    card.addEventListener("click", () => {
      if (!isInUsedCardsPile(card)) {
        console.log("Flip event");
        card.classList.toggle("flip");
        socket.emit("flipCard", { cardId: card.id });
      }
    });

}

function isInUsedCardsPile(card) {
  const usedCardsPile = document.getElementById("usedCardsPile");

  // Check if the card is in the used cards pile
  const isInPile = usedCardsPile.contains(card);

  // Log the result along with the card's ID (or other identifying property)
  console.log(`Card ${card.id} is in used cards pile: ${isInPile}`);

  return isInPile;
}

  
  


function moveToUsedCardsPile(card) {
  const usedCardsPile = document.getElementById("usedCardsPile");

  if (usedCardsPile) {
    // Check if the card is not flipped
    if (!card.classList.contains("flip")) {
      // Flip the card
      card.classList.add("flip");
    }

    // Calculate the number of cards in the pile
    const cardsInPile = usedCardsPile.children.length;

    // Log the card being moved and the number of cards in the pile
    console.log(`Moving card with ID '${card.id}' to used cards pile. Number of cards in pile before move: ${cardsInPile}`);

    // Set the position of the card based on the number of cards in the pile
    const offset = 2; // Adjust this value to increase or decrease the offset
    card.style.position = 'absolute';
    card.style.top = `${cardsInPile * offset}px`;
    card.style.left = `${cardsInPile * offset}px`;

    usedCardsPile.appendChild(card);
  }
}

  


function formatCardText(text) {
  console.log("Formatting text:", text); // Log the input text

  // If the text is 15 characters or less, return it as is
  if (text.length <= 15) {
    console.log("Text is 15 characters or less, no formatting needed."); // Log for short text
    return text;
  }

  // Split the text into words
  const words = text.split(" ");
  // Initialize variables to store the formatted text and the current line
  let formattedText = "";
  let currentLine = "";

  // Iterate through each word
  words.forEach((word) => {
    // Check if adding the word exceeds the 15 character limit for the line
    if ((currentLine + word).length > 15) {
      // If it does, add the current line to the formatted text with a line break
      formattedText += currentLine.trim() + "\n";
      // Start a new line with the current word
      currentLine = word + " ";
    } else {
      // If not, add the word to the current line
      currentLine += word + " ";
    }
  });

  // Add the last line to the formatted text
  formattedText += currentLine.trim();

  console.log("Formatted text:", formattedText); // Log the formatted text
  return formattedText;
}




// Drag and Drop Event Handlers

function setupDragAndDrop() {
  // Variable to keep track of the item being dragged
  let draggedItem = null;

  // When the drag operation starts
  document.addEventListener("dragstart", (e) => {
    console.log("Drag start event for item:", e.target.id);
    draggedItem = e.target;
    draggedItem.classList.add("dragging");
  });

  // When the dragged item is over a potential drop target
  document.addEventListener("dragover", (e) => {
    console.log("Drag over event on target:", e.target.id);
    e.preventDefault();
    if (e.target.classList.contains("dropzone")) {
      console.log("Drag over dropzone:", e.target.id);
      e.target.style.backgroundColor = ""; // Consider logging any style changes if relevant
    }
  });

  // When the dragged item leaves a potential drop target
  document.addEventListener("dragleave", (e) => {
    console.log("Drag leave event from target:", e.target.id);
    if (e.target.classList.contains("dropzone")) {
      console.log("Drag left dropzone:", e.target.id);
      e.target.style.backgroundColor = ""; // Consider logging any style changes if relevant
    }
  });

  // When the dragged item is dropped on a drop target
  document.addEventListener("drop", (e) => {
    console.log("Drop event on target:", e.target.id);
    if (
      e.target.classList.contains("dropzone") &&
      !e.target.querySelector(".card") &&
      e.target.dataset.index === draggedItem.dataset.deck
    ) {
      console.log("Dropped item", draggedItem.id, "on dropzone:", e.target.id);
      e.target.appendChild(draggedItem);
      Object.assign(draggedItem.style, {
        position: "absolute",
        top: "0",
        left: "0",
      });
      console.log("Emitting cardMoved event for cardId:", draggedItem.id);
      socket.emit("cardMoved", {
        cardId: draggedItem.id,
        newParentId: e.target.id,
      });
    }
  });

  // When the drag operation ends
  document.addEventListener("dragend", () => {
    console.log("Drag end event for item:", draggedItem ? draggedItem.id : 'None');
    if (draggedItem) {
      draggedItem.classList.remove("dragging");
    }
    draggedItem = null;
  });
}


// Button Event Handlers
function setupButtonHandlers() {
  // Event listener for the reset button
  resetBtn.addEventListener("click", () => {
    console.log("Reset button clicked. Starting fade-out animation for cards.");

    // Step 1: Apply a fade-out effect to all cards in each dropzone
    dropzones.forEach((dropzone) => {
      // Select all cards within the current dropzone
      const cards = dropzone.querySelectorAll(".card");
      // Add the 'fade-out' class to each card to initiate the fade-out effect
      cards.forEach((card) => {
        card.classList.add("fade-out");
      });
    });

    // Step 2: Wait for the fade-out animation to complete before resetting
    setTimeout(() => {
      console.log("Fade-out animation completed. Reloading the page.");
      // Reload the page after the fade-out animations have completed
      location.reload();
    }, 500); // The timeout duration should match the CSS animation duration
  });
}


function updatePlayersList(players) {
  // Get the DOM element that represents the list of players
  const playersList = document.getElementById("playersList");

  // Clear the existing list to prepare for an update
  playersList.innerHTML = "";

  // Log the number of players received
  console.log(`Updating player list with ${players.length} players.`);

  // Iterate through each player in the provided list
  players.forEach((player) => {
    // Create a new list item element for each player
    const playerElement = document.createElement("li");

    // Check if the player is the current user
    if (player === myUserName) {
      // Mark the current player distinctly, e.g., by highlighting
      playerElement.innerHTML = `${player} <strong> : sinä</strong>`;
    } else {
      // For other players, just display their name
      playerElement.textContent = player;
    }

    // Add the new player element to the players list in the DOM
    playersList.appendChild(playerElement);
  });

  // Log a confirmation message
  console.log("Player list updated successfully.");
}


// Socket.IO Event Listeners

// Event listener for when a card is moved
socket.on("cardMoved", (data) => {
  // Get the card and its new parent element by their IDs
  const card = document.getElementById(data.cardId);
  const newParent = document.getElementById(data.newParentId);

  // Log the IDs of the card and the new parent for debugging purposes
  console.log(`Attempting to move card with ID: ${data.cardId} to new parent with ID: ${data.newParentId}`);

  // If both elements are found, move the card to the new parent
  if (card && newParent) {
    newParent.appendChild(card);
    // Set the card's position
    Object.assign(card.style, { position: "absolute", top: "0", left: "0" });

    // Log a confirmation message indicating successful movement
    console.log(`Card with ID: ${data.cardId} successfully moved to new parent with ID: ${data.newParentId}`);
  } else {
    // Log a warning message if either element is not found
    console.log(`Failed to move card with ID: ${data.cardId}. Card or new parent element not found.`);
  }
});


// Event listener for when a card's text is updated
socket.on("cardText", function (data) {
  const card = document.getElementById(data.cardId);
  if (card) {
    const back = card.querySelector(".back");
    // If the card's back is found, update its text
    if (back) {
      back.textContent = formatCardText(data.text); // Format the text
      // Log message indicating the card ID and the text being set
      console.log(`Card text updated for card ID: ${data.cardId}, Text: ${data.text}`);
    } else {
      // Log message if the back of the card is not found
      console.log(`Back of card not found for card ID: ${data.cardId}`);
    }
  } else {
    // Log message if the card is not found
    console.log(`Card not found for card ID: ${data.cardId}`);
  }
});


// -------------------------------------------------------------------------------------------------------------------- all console messafes done above

// Event listener for flipping a card
socket.on("flipCard", function (data) {
  const card = document.getElementById(data.cardId);
  if (card) {
    // Toggle the 'flip' class to flip the card
    card.classList.toggle("flip");
  }
});

// Event listener for resetting the decks
socket.on("resetDecks", (gameId) => {
  console.log("resetDecks event received from server");
  // Update the game ID display
  const gameIdDisplay = document.getElementById("gameIdDisplay");
  if (gameIdDisplay) {
    gameIdDisplay.textContent = `ID: ${gameId}`;
  }

  // Clear all decks and dropzones, then recreate the decks
  decks.forEach((deck) => (deck.innerHTML = ""));
  dropzones.forEach((dropzone) => (dropzone.innerHTML = ""));
  createDecks();
});

// Event listener for updating the player list
socket.on("updatePlayerList", (players) => {
  updatePlayersList(players);
});

// Event listener for receiving the user's username
socket.on("yourUserName", (userName) => {
  myUserName = userName;
  // Update the display with the user's username
  updateMyUserNameDisplay();
});

//BACKGROUND COLORS

// Function to change background and reset filter
function changeBackground(colorCode) {
  document.body.style.background = colorCode;
  document.body.style.filter = "none";
}

// Color mappings
const colorMappings = {
  purple: "#957DAD",
  candypink: "#D291BC",
  softplum: "#A99ABD",
  softlavender: "#E0E3F4",
  seagreen: "#6ABCAF",
  ocean: "linear-gradient(to right, #2E3192, #1BFFFF)",
  bloodorange: "linear-gradient(to right, #D4145A, #FBB03B)",
  antarctica: "linear-gradient(to right, #D8B5FF, #1EAE98)",
  dusk: "linear-gradient(to right, #C33764, #1D2671)",
};

// Event listener for background color selector
document
  .getElementById("backgroundColorSelector")
  .addEventListener("change", function () {
    const value = this.value;

    if (value === "negative") {
      document.body.style.filter = "invert(100%)";
    } else if (colorMappings[value]) {
      changeBackground(colorMappings[value]);
    } else {
      // Default color
      changeBackground("#1e272e");
    }
  });


  function openModal(modalId) {
    document.getElementById(modalId).style.display = "block";
    updateMenuIconAndContent(false);
  }
  
  function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
  }
  
  window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
      closeModal(event.target.id);
    }
  };

  function toggleMenu() {
    var menuIcon = document.querySelector(".menu-icon");
    menuIcon.classList.toggle("open");
    var menuContent = document.getElementById("menuContent");
  
    // Determine the new display state of the menu
    var newDisplayState = menuContent.style.display === "block" ? "none" : "block";
    menuContent.style.display = newDisplayState;
  
    // Log a message indicating whether the menu is now open or closed
    console.log(`Menu is now ${newDisplayState === "block" ? "open" : "closed"}.`);
  }
  
  
  function updateMenuIconAndContent(reset) {
    var menuIcon = document.querySelector(".menu-icon");
    var menuContent = document.getElementById("menuContent");
  
    if (reset && menuIcon.classList.contains("open")) {
      menuIcon.classList.remove("open");
      console.log("Menu icon closed and reset.");
    } else if (!reset && menuIcon.classList.contains("open")) {
      console.log("Menu icon is already open, no change.");
    } else if (!reset) {
      console.log("Menu icon remains closed, no change.");
    }
  
    menuContent.style.display = reset ? "none" : menuContent.style.display;
  
    // Log the current display state of the menu content
    console.log("Menu content display state:", menuContent.style.display);
  }
  
  
  function loadModalContent(modalId, contentId, filePath) {
    console.log(`Attempting to load content from ${filePath} into modal '${modalId}' with content ID '${contentId}'`);

    fetch(filePath)
        .then((response) => {
            console.log(`Content fetched successfully from ${filePath}`);
            return response.text();
        })
        .then((htmlText) => {
            console.log(`Updating content of '${contentId}' with new HTML`);
            const contentElement = document.getElementById(contentId);
            contentElement.innerHTML = htmlText; // Use innerHTML to render HTML content
            console.log(`Content updated successfully for modal '${modalId}'`);
        })
        .catch((error) => {
            console.error(`Error loading content for modal '${modalId}':`, error);
        });
}



// Function to handle window resize
function handleWindowResize() {
  const minWidth = 1200;
  const minHeight = 830;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const resolutionWarning = document.getElementById("resolution-warning");

  // Determine if the resolution warning should be displayed
  const isWarningDisplayed = width < minWidth || height < minHeight;

  resolutionWarning.style.display = isWarningDisplayed ? "block" : "none";

  // Log the window size and the warning display status
  console.log(`Window resized: width=${width}px, height=${height}px, Resolution warning displayed: ${isWarningDisplayed ? 'Yes' : 'No'}`);
}

  
// Event Binding Functions
function bindEventListeners() {
  console.log("Binding event listeners...");

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

  // Load initial content for modals
  loadModalContent(
    "instructionsModal",
    "instructionsContent",
    "./text-instruct/pelinohjeet-game.txt"
  );
  loadModalContent(
    "historyModal",
    "historyContent",
    "./text-instruct/viitteethistoria-game.txt"
  );
  loadModalContent(
    "contactsModal",
    "contactsContent",
    "./text-instruct/yhteystiedot-game.txt"
  );

  console.log("Event listeners bound successfully.");
}


  // DOM Content Loading
  document.addEventListener("DOMContentLoaded", bindEventListeners);
  