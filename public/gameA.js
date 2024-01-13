// Global Variables
const socket = io();
let draggedItem = null;
let isAnyCardFlipped = false;
let myUserName = '';
let isSetupDone = false;

// DOMContentLoaded Event Handler
document.addEventListener('DOMContentLoaded', function() {
    if (!isSetupDone) {
        setupGame();
        setupDragAndDrop();
        setupButtonHandlers();
        setupClearConsoleButton(); // Setup the clear console button
        isSetupDone = true;
    }
});

// DOM Elements
const decks = document.querySelectorAll('.deck');
const resetBtn = document.getElementById('resetBtn');
//const autoPlaceBtn = document.getElementById('autoPlaceBtn');
//const flipAllBtn = document.getElementById('flipAllBtn');
const dropzones = document.querySelectorAll('.dropzone');

// Data Definitions
const colors = ['#87CEEB', '#FFB6C1','#FFDAB9', '#98FB98', '#B19CD9', '#FFD700'];
const deckImages = ["tilanne-bcard.webp", "tila-bcard.webp", "keinot-bcard.webp", 
                    "resurssit-bcard.webp", "opetusmuoto-bcard.webp", "sattuma-bcard.webp"];

function loadRandomWord(deckIndex, card) {
    socket.emit('requestCardText', { deckIndex: deckIndex, cardId: card.id });
}

// Function to update the player's username display in the UI
function updateMyUserNameDisplay() {
    const myUserNameDisplay = document.getElementById('myUserNameDisplay');
    if (myUserNameDisplay) {
        myUserNameDisplay.textContent = myUserName + ": sinä";
    }
}

// Function to clear the game console log
function clearGameConsole() {
    const consoleElement = document.getElementById('gameConsole');
    while (consoleElement.children.length > 1) {
        consoleElement.removeChild(consoleElement.lastChild);
    }
}

// Function to set up the clear console button
//function setupClearConsoleButton() {
//    const clearConsoleBtn = document.getElementById('clearConsoleBtn');
//    clearConsoleBtn.addEventListener('click', function() {
//        socket.emit('clearLog'); // Emit event to server to clear log
//    });
//}

function createCard(deck, index, cardIndex) {
    const card = document.createElement('div');
    card.className = 'card initial-animation';
    card.draggable = true;
    card.id = `deck-${index}-card-${cardIndex}`;
    card.dataset.deck = index;

    const front = document.createElement('div');
    front.className = 'front';
    front.style = `background-image: url('./back_card_imgs/${deckImages[index]}'); 
                   background-size: cover; background-color: #939598;`;

    const back = document.createElement('div');
    back.className = 'back';
    back.style = `background-image: url('./front_card_img/front_draw.png'); 
                  background-size: cover; background-color: white;`;

    card.append(front, back);
    deck.appendChild(card);

    card.addEventListener('dblclick', () => {
    card.classList.toggle('flip');
    isAnyCardFlipped = true;
    socket.emit('flipCard', { cardId: card.id });
    });

    loadRandomWord(index, card);
}

function createDeck(deck, index) {
    for (let i = 0; i < 10; i++) {
        setTimeout(() => createCard(deck, index, i), i * 100);
    }
}

function createDecks() {
    decks.forEach(createDeck);
    setTimeout(() => document.querySelectorAll('.card').forEach(card => 
               card.classList.remove('initial-animation')), 1200);
}
// Drag and Drop Event Handlers
function setupDragAndDrop() {
    document.addEventListener('dragover', e => {
        e.preventDefault();
        if (e.target.classList.contains('dropzone')) {
            e.target.style.backgroundColor = '';
        }
    });

    document.addEventListener('dragleave', e => {
        if (e.target.classList.contains('dropzone')) {
            e.target.style.backgroundColor = '';
        }
    });

    document.addEventListener('drop', e => {
        if (e.target.classList.contains('dropzone') && !e.target.querySelector('.card') && 
            e.target.dataset.index === draggedItem.dataset.deck) {
            e.target.appendChild(draggedItem);
            Object.assign(draggedItem.style, { position: 'absolute', top: '0', left: '0' });
            socket.emit('cardMoved', { cardId: draggedItem.id, newParentId: e.target.id });
        }
    });

    document.addEventListener('dragstart', e => {
        draggedItem = e.target;
        draggedItem.classList.add('dragging');
    });

    document.addEventListener('dragend', () => {
        if (draggedItem) {
            draggedItem.classList.remove('dragging');
        }
        draggedItem = null;
    });
}

// Button Event Handlers
function setupButtonHandlers() {
    resetBtn.addEventListener('click', () => {
        // Apply fade-out effect to all cards in dropzones
        dropzones.forEach(dropzone => {
            const cards = dropzone.querySelectorAll('.card');
            cards.forEach(card => {
                card.classList.add('fade-out');
            });
        });
    
        // Wait for the fade-out animation to complete before resetting
        setTimeout(() => {
            decks.forEach(deck => deck.innerHTML = '');
            dropzones.forEach(dropzone => dropzone.innerHTML = '');
            createDecks();
            isAnyCardFlipped = false;
            // Request new card texts for all cards
            decks.forEach((deck, deckIndex) => {
                for (let cardIndex = 0; cardIndex < 10; cardIndex++) {
                    const cardId = `deck-${deckIndex}-card-${cardIndex}`;
                    socket.emit('requestCardText', { deckIndex: deckIndex, cardId: cardId });
                }
            });
            socket.emit('resetDecks');
        }, 500); // The timeout duration should match the CSS animation duration
    });

    // autoPlaceBtn.addEventListener('click', () => {
    //     let delay = 0; // Initial delay
    //     const delayIncrement = 500; // Increment delay for each card (500ms)
    
    //     decks.forEach((deck, index) => {
    //         const card = deck.querySelector('.card:not(.placed)');
    //         const dropzone = dropzones[index];
            
    //         if (card && !dropzone.querySelector('.card')) {
    //             setTimeout(() => {
    //                 dropzone.appendChild(card);
    //                 card.classList.add('placed', 'falling');
    //                 setTimeout(() => card.classList.remove('falling'), 1000); // Remove the class after animation
    //                 socket.emit('autoPlaceCard', { cardId: card.id, dropzoneId: dropzone.id });
    //             }, delay);
    
    //             delay += delayIncrement;
    //         }
    //     });
    // });
    
    // flipAllBtn.addEventListener('click', () => {
    //     let cardsInDropzones = false;
    //     let allCardsFaceSameSide = true;
    //     let firstCardFlipped = null;
    //     let cardIds = []; // Array to store the IDs of cards being flipped
    
    //     dropzones.forEach(dropzone => {
    //         const card = dropzone.querySelector('.card');
    //         if (card) {
    //             cardsInDropzones = true;
    //             firstCardFlipped = firstCardFlipped === null ? card.classList.contains('flip') : firstCardFlipped;
    //             if (card.classList.contains('flip') !== firstCardFlipped) {
    //                 allCardsFaceSameSide = false;
    //             }
    //         }
    //     });
    
    //     if (!cardsInDropzones) {
    //         alert("Aseta kortit ensin pudotusalueelle!");
    //         return;
    //     }
    //     if (!allCardsFaceSameSide) {
    //         alert("Cannot flip all cards when they are showing different sides.");
    //         return;
    //     }
    
    //     dropzones.forEach(dropzone => {
    //         const card = dropzone.querySelector('.card');
    //         if (card) {
    //             card.classList.toggle('flip');
    //             cardIds.push(card.id); // Add the card ID to the array
    //         }
    //     });
    
    //     if (cardIds.length > 0) {
    //         socket.emit('flipAllCards', { cardIds }); // Emit the event with the array of card IDs
    //     }
    // });
}

function formatCardText(text) {
    if (text.length <= 21) return text;

    const words = text.split(' ');
    let formattedText = '';
    let currentLine = '';

    words.forEach(word => {
        if ((currentLine + word).length > 21) {
            formattedText += currentLine.trim() + '\n'; // Add a line break
            currentLine = word + ' '; // Start a new line with the current word
        } else {
            currentLine += word + ' '; // Add the word to the current line
        }
    });

    return formattedText + currentLine.trim(); // Add the last line
}

// Game Setup and Player Management
function setupGame() {
    dropzones.forEach((dropzone, index) => {
        dropzone.dataset.index = index.toString();
        dropzone.id = `dropzone-${index}`;
    });

    createDecks();
    setupDragAndDrop();
    setupButtonHandlers();
    setupClearConsoleButton();
}

function updatePlayersList(players) {
    const playersList = document.getElementById('playersList');
    playersList.innerHTML = ''; // Clear existing list

    players.forEach(player => {
        const playerElement = document.createElement('li');
        // Check if this is the current player
        if (player === myUserName) {
            playerElement.innerHTML = `${player} <strong> : sinä</strong>`;
        } else {
            playerElement.textContent = player;
        }
        playersList.appendChild(playerElement);
    });
}
// Socket.IO Event Listeners
socket.on('cardMoved', data => {
    const card = document.getElementById(data.cardId);
    const newParent = document.getElementById(data.newParentId);
    if (card && newParent) {
        newParent.appendChild(card);
        Object.assign(card.style, { position: 'absolute', top: '0', left: '0' });
    }
});

socket.on('cardText', function(data) {
    const card = document.getElementById(data.cardId);
    if (card) {
        const back = card.querySelector('.back');
        if (back) {
            back.textContent = formatCardText(data.text); // Format the text before setting it
        }
    }
});

socket.on('flipCard', function(data) {
    const card = document.getElementById(data.cardId);
    if (card) {
        card.classList.toggle('flip');
    }
});

// socket.on('autoPlaceCard', function(data) {
//     const card = document.getElementById(data.cardId);
//     const dropzone = document.getElementById(data.dropzoneId);
//     if (card && dropzone) {
//         dropzone.appendChild(card);
//         Object.assign(card.style, { position: 'absolute', top: '0', left: '0' });
//     }
// });

// socket.on('flipAllCards', function(data) {
//     data.cardIds.forEach(cardId => {
//         const card = document.getElementById(cardId);
//         if (card) {
//             card.classList.toggle('flip');
//         }
//     });
// });

// Existing 'resetDecks' Event Listener
socket.on('resetDecks', (gameId) => {
    console.log('resetDecks event received from server');
    const gameIdDisplay = document.getElementById('gameIdDisplay');
    if (gameIdDisplay) {
        gameIdDisplay.textContent = `Pelin ID: ${gameId}`;
    }
    decks.forEach(deck => deck.innerHTML = '');
    dropzones.forEach(dropzone => dropzone.innerHTML = '');
    createDecks();
    isAnyCardFlipped = false;
    // Removed the line that emits 'resetDecks' back to the server
});

socket.on('logCleared', () => {
    clearGameConsole(); // Clear the console when receiving 'logCleared' event
});

socket.on('updatePlayerList', (players) => {
    updatePlayersList(players);
});

socket.on('yourUserName', (userName) => {
    myUserName = userName;
    updateMyUserNameDisplay();
});

socket.on('newPlayerJoined', () => {
    // Call the function that handles the reset button click
    // This function should contain the logic that is executed when the reset button is clicked
    resetGame();
});

function resetGame() {
    // Logic to reset the game
    // This is similar to what happens when the reset button is clicked
    console.log('Resetting game due to new player joining');
    // ... reset logic here ...
}

// Get the modal
var modal = document.getElementById("infoModal");

// Get the button that opens the modal
var btn = document.getElementById("infoBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function() {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

document.getElementById('backgroundColorSelector').addEventListener('change', function() {
    const value = this.value;
    switch(value) {
        case 'purple':
            document.body.style.background = '#957DAD';
            document.body.style.filter = 'none';
            break;
        case 'candypink':
            document.body.style.background = '#D291BC';
            document.body.style.filter = 'none';
            break;
        case 'softplum':
            document.body.style.background = '#A99ABD';
            document.body.style.filter = 'none';
            break;
        case 'softlavender':
            document.body.style.background = '#E0E3F4';
            document.body.style.filter = 'none';
            break;
        case 'seagreen':
            document.body.style.background = '#6ABCAF';
            document.body.style.filter = 'none';
            break;
        case 'ocean':
            document.body.style.background = 'linear-gradient(to right, #2E3192, #1BFFFF)';
            document.body.style.filter = 'none';
            break;
        case 'bloodorange':
            document.body.style.background = 'linear-gradient(to right, #D4145A, #FBB03B)';
            document.body.style.filter = 'none';
            break;
        case 'antarctica':
            document.body.style.background = 'linear-gradient(to right, #D8B5FF, #1EAE98)';
            document.body.style.filter = 'none';
            break;
        case 'dusk':
            document.body.style.background = 'linear-gradient(to right, #C33764, #1D2671)';
            document.body.style.filter = 'none';
            break;
        case 'negative':
            document.body.style.filter = 'invert(100%)';
            break;
        default:
            document.body.style.background = '#1e272e'; // Default color
            document.body.style.filter = 'none';
    }
});
