// Global Variables

const socket = io(); // Socket.io instance for real-time communication
let myUserName = ''; // Variable to store the username of the current user


// DOMContentLoaded Event Handler
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed");

        setupGame(); // Setup game environment
        setupDragAndDrop(); // Initialize drag and drop functionality
        setupButtonHandlers(); // Set up button event handlers
});

// DOM Elements
const decks = document.querySelectorAll('.deck');       // Collection of all decks
const resetBtn = document.getElementById('resetBtn');   // Reset button
const dropzones = document.querySelectorAll('.dropzone'); // Collection of all dropzones


// Data Definitions
const deckImages = [
    "tilanne-bcard.webp",
    "tila-bcard.webp",
    "keinot-bcard.webp",
    "resurssit-bcard.webp",
    "opetusmuoto-bcard.webp",
    "sattuma-bcard.webp"
]; // Array of deck image filenames


function setupGame() {
    // Configure each dropzone with a unique index and ID
    dropzones.forEach((dropzone, index) => {
        // Set a data attribute 'index' for each dropzone, converting the index to a string
        dropzone.dataset.index = index.toString();
        // Assign an ID to each dropzone, using its index for uniqueness
        dropzone.id = `dropzone-${index}`;
    });

    // Create the decks required for the game
    createDecks();
}

/**
 * Creates a deck of cards.
 * 
 * @param {HTMLElement} deck - The deck element to which cards will be added.
 * @param {number} index - The index of the deck.
 */

function createDeck(deck, index) {
    // Create 10 cards with a staggered delay
    for (let i = 0; i < 10; i++) {
        setTimeout(() => createCard(deck, index, i), i * 100);
    }
}

function createDecks() {
    // Create each deck
    decks.forEach((deck, index) => createDeck(deck, index));

    // Remove the initial animation class from all cards after 1200ms
    setTimeout(() => {
        document.querySelectorAll('.card').forEach(card => {
            card.classList.remove('initial-animation');
        });
    }, 1200);
}

function updateMyUserNameDisplay() {
    // Get the user name display element
    const myUserNameDisplay = document.getElementById('myUserNameDisplay');

    // Check if the element exists and update its text content
    if (myUserNameDisplay) {
        myUserNameDisplay.textContent = myUserName + ": sinä";
    }
}

function loadRandomWord(deckIndex, card) {
    socket.emit('requestCardText', { deckIndex: deckIndex, cardId: card.id });
}

function createCard(deck, index, cardIndex) {
    // Create the card element
    const card = document.createElement('div');
    card.className = 'card initial-animation';
    card.draggable = true;
    card.id = `deck-${index}-card-${cardIndex}`;
    card.dataset.deck = index;

    // Create the front side of the card
    const front = document.createElement('div');
    front.className = 'front';
    front.style.backgroundImage = `url('./back_card_imgs/${deckImages[index]}')`;
    front.style.backgroundSize = 'cover';
    front.style.backgroundColor = '#939598';

    // Create the back side of the card
    const back = document.createElement('div');
    back.className = 'back';
    back.style.backgroundImage = "url('./front_card_img/front_draw.webp')";
    back.style.backgroundSize = 'cover';
    back.style.backgroundColor = 'white';

    // Append front and back to the card, and the card to the deck
    card.append(front, back);
    deck.appendChild(card);

    // Add click event listener for card flip
    card.addEventListener('click', () => {
        console.log("Flip event");
        card.classList.toggle('flip');
        socket.emit('flipCard', { cardId: card.id });
    });

    // Load a random text on the card
    loadRandomWord(index, card);
}
function formatCardText(text) {
    // If the text is 15 characters or less, return it as is
    if (text.length <= 15) return text;

    // Split the text into words
    const words = text.split(' ');
    // Initialize variables to store the formatted text and the current line
    let formattedText = '';
    let currentLine = '';

    // Iterate through each word
    words.forEach(word => {
        // Check if adding the word exceeds the 15 character limit for the line
        if ((currentLine + word).length > 15) {
            // If it does, add the current line to the formatted text with a line break
            formattedText += currentLine.trim() + '\n';
            // Start a new line with the current word
            currentLine = word + ' ';
        } else {
            // If not, add the word to the current line
            currentLine += word + ' ';
        }
    });

    // Add the last line to the formatted text
    return formattedText + currentLine.trim();
}

// Drag and Drop Event Handlers

function setupDragAndDrop() {
    // Variable to keep track of the item being dragged
    let draggedItem = null;

    // When the drag operation starts
    document.addEventListener('dragstart', e => {
        console.log("Drag start event");
        draggedItem = e.target;
        draggedItem.classList.add('dragging');
    });

    // When the dragged item is over a potential drop target
    document.addEventListener('dragover', e => {
        console.log("Drag over event");
        e.preventDefault();
        if (e.target.classList.contains('dropzone')) {
            e.target.style.backgroundColor = '';
        }
    });

    // When the dragged item leaves a potential drop target
    document.addEventListener('dragleave', e => {
        console.log("Drag leave event");
        if (e.target.classList.contains('dropzone')) {
            e.target.style.backgroundColor = '';
        }
    });

    // When the dragged item is dropped on a drop target
    document.addEventListener('drop', e => {
        console.log("Drop event");
        if (e.target.classList.contains('dropzone') && !e.target.querySelector('.card') &&
            e.target.dataset.index === draggedItem.dataset.deck) {
            e.target.appendChild(draggedItem);
            Object.assign(draggedItem.style, { position: 'absolute', top: '0', left: '0' });
            socket.emit('cardMoved', { cardId: draggedItem.id, newParentId: e.target.id });
        }
    });

    // When the drag operation ends
    document.addEventListener('dragend', () => {
        console.log("Drag end event");
        if (draggedItem) {
            draggedItem.classList.remove('dragging');
        }
        draggedItem = null;
    });
}


// Button Event Handlers
function setupButtonHandlers() {
    // Event listener for the reset button
    resetBtn.addEventListener('click', () => {
        // Step 1: Apply a fade-out effect to all cards in each dropzone
        dropzones.forEach(dropzone => {
            // Select all cards within the current dropzone
            const cards = dropzone.querySelectorAll('.card');
            // Add the 'fade-out' class to each card to initiate the fade-out effect
            cards.forEach(card => {
                card.classList.add('fade-out');
            });
        });
    
        // Step 2: Wait for the fade-out animation to complete before resetting
        setTimeout(() => {
            // Reload the page after the fade-out animations have completed
            location.reload();
        }, 500); // The timeout duration should match the CSS animation duration
    });
}


function updatePlayersList(players) {
    // Get the DOM element that represents the list of players
    const playersList = document.getElementById('playersList');
    
    // Clear the existing list to prepare for an update
    playersList.innerHTML = '';

    // Iterate through each player in the provided list
    players.forEach(player => {
        // Create a new list item element for each player
        const playerElement = document.createElement('li');

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
}



// Socket.IO Event Listeners

// Event listener for when a card is moved
socket.on('cardMoved', data => {
    // Get the card and its new parent element by their IDs
    const card = document.getElementById(data.cardId);
    const newParent = document.getElementById(data.newParentId);

    // If both elements are found, move the card to the new parent
    if (card && newParent) {
        newParent.appendChild(card);
        // Set the card's position
        Object.assign(card.style, { position: 'absolute', top: '0', left: '0' });
    }
});

// Event listener for when a card's text is updated
socket.on('cardText', function(data) {
    const card = document.getElementById(data.cardId);
    if (card) {
        const back = card.querySelector('.back');
        // If the card's back is found, update its text
        if (back) {
            back.textContent = formatCardText(data.text); // Format the text
        }
    }
});

// Event listener for flipping a card
socket.on('flipCard', function(data) {
    const card = document.getElementById(data.cardId);
    if (card) {
        // Toggle the 'flip' class to flip the card
        card.classList.toggle('flip');
    }
});

// Event listener for resetting the decks
socket.on('resetDecks', (gameId) => {
    console.log('resetDecks event received from server');
    // Update the game ID display
    const gameIdDisplay = document.getElementById('gameIdDisplay');
    if (gameIdDisplay) {
        gameIdDisplay.textContent = `Pelin ID: ${gameId}`;
    }

    // Clear all decks and dropzones, then recreate the decks
    decks.forEach(deck => deck.innerHTML = '');
    dropzones.forEach(dropzone => dropzone.innerHTML = '');
    createDecks();
});

// Event listener for updating the player list
socket.on('updatePlayerList', (players) => {
    updatePlayersList(players);
});

// Event listener for receiving the user's username
socket.on('yourUserName', (userName) => {
    myUserName = userName;
    // Update the display with the user's username
    updateMyUserNameDisplay();
});




// MODAL INFO-INSTRUCTIONS

// Modal element references
var modal = document.getElementById("infoModal");
var btn = document.getElementById("infoBtn");
var span = document.getElementsByClassName("close")[0];

// Function to open the modal
btn.onclick = function() {
    modal.style.display = "block";
};

// Function to close the modal
span.onclick = function() {
    modal.style.display = "none";
};

// Click event on window to close the modal if clicked outside
window.onclick = function(event) {
    // When the user clicks anywhere outside of the modal, close it
    if (event.target == modal) {
        modal.style.display = "none";
    }
};


//BACKGROUND COLORS

// Function to change background and reset filter
function changeBackground(colorCode) {
    document.body.style.background = colorCode;
    document.body.style.filter = 'none';
}

// Color mappings
const colorMappings = {
    'purple': '#957DAD',
    'candypink': '#D291BC',
    'softplum': '#A99ABD',
    'softlavender': '#E0E3F4',
    'seagreen': '#6ABCAF',
    'ocean': 'linear-gradient(to right, #2E3192, #1BFFFF)',
    'bloodorange': 'linear-gradient(to right, #D4145A, #FBB03B)',
    'antarctica': 'linear-gradient(to right, #D8B5FF, #1EAE98)',
    'dusk': 'linear-gradient(to right, #C33764, #1D2671)',
};

// Event listener for background color selector
document.getElementById('backgroundColorSelector').addEventListener('change', function() {
    const value = this.value;

    if (value === 'negative') {
        document.body.style.filter = 'invert(100%)';
    } else if (colorMappings[value]) {
        changeBackground(colorMappings[value]);
    } else {
        // Default color
        changeBackground('#1e272e');
    }
});

