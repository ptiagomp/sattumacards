const fs = require('fs');
const path = require('path');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Initialize Express and Socket.io
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the public directory
app.use(express.static('public'));

// Constants and Global Variables
const deckFiles = [
    "tilanne-cards.txt",
    "tila-cards.txt",
    "keinotja-oivallukset-cards.txt",
    "resurssit-cards.txt",
    "opetusmuoto-cards.txt",
    "sattuma-cards.txt"
];
const animalNames = ["Karhu", "Kettu", "Susi", "Peura", "Pöllö", "Haukka", "Jänis", "Orava", "Mäyrä", "Hirvi"];
let nameIndex = 0;
let players = {}; // Object to store players and their aliases
let currentGameId; // Game ID will be set when a player connects
let cardTexts = {}; // Object to store texts for each card
let gameLog = []; // Array to store game log messages

// Utility Functions
function generateGameId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function generateCardText(deckIndex) {
    try {
        const filePath = path.join(__dirname, 'public/cardstext', deckFiles[deckIndex]);
        const data = fs.readFileSync(filePath, 'utf8');
        const words = data.split('\n');
        return words[Math.floor(Math.random() * words.length)].trim();
    } catch (error) {
        console.error(`Failed to fetch data for deck ${deckIndex}:`, error);
        return ''; // Return an empty string or some default text in case of an error
    }
}

// Socket.io Event Handlers
io.on('connection', (socket) => {
    console.log(`Current game ID: ${currentGameId}`);
    // Generate a new game ID only when a new player connects
    if (!currentGameId) {
        currentGameId = generateGameId();
    }

    const userName = animalNames[nameIndex % animalNames.length];
    nameIndex++;
    players[socket.id] = userName;
    console.log(`${userName} connected`);

    // Send initial data to the newly connected client
    io.to(socket.id).emit('resetDecks', currentGameId);
    io.to(socket.id).emit('logHistory', gameLog);
    io.to(socket.id).emit('yourUserName', userName);

    // Update the player list for all clients
    io.emit('updatePlayerList', Object.values(players));
    io.emit('playerConnected', userName);

    // Event: Card Moved
    socket.on('cardMoved', (data) => {
        handleCardMoved(socket, userName, data);
    });

    // Event: Flip Card
    socket.on('flipCard', (data) => {
        handleFlipCard(socket, userName, data);
    });

    // Event: Reset Decks
    socket.on('resetDecks', () => {
        handleResetDecks(socket, userName);
    });

    // Event: Auto Place Card
    socket.on('autoPlaceCard', (data) => {
        handleAutoPlaceCard(socket, userName, data);
    });

    // Event: Flip All Cards
    socket.on('flipAllCards', (data) => {
        handleFlipAllCards(socket, userName, data);
    });

    // Event: Request Card Text
    socket.on('requestCardText', (data) => {
        handleRequestCardText(socket, data);
    });

    // Event: Clear Log
    socket.on('clearLog', () => {
        gameLog = []; // Clear the log
        io.emit('logCleared'); // Notify all clients to clear their logs
    });

    // Event: Disconnect
    socket.on('disconnect', () => {
        handleDisconnect(socket, userName);
    });
    // Emit an event to all clients when a new player joins
    io.emit('newPlayerJoined');
});

// Event Handler Functions
function handleCardMoved(socket, userName, data) {
    const logMessage = `${userName} moved a card`;
    gameLog.push(logMessage);
    io.emit('cardMoved', data);
}

function handleFlipCard(socket, userName, data) {
    const logMessage = `Card ${data.cardId} was flipped by ${userName}`;
    gameLog.push(logMessage);
    socket.broadcast.emit('flipCard', data);
}

function handleResetDecks(socket, userName) {
    const logMessage = `${userName} reset the decks`;
    gameLog.push(logMessage);
    console.log(`resetDecks received from user: ${userName}`);
    // Clear the card texts to ensure new ones are generated
    cardTexts = {};
    io.emit('resetDecks', currentGameId);
}

function handleAutoPlaceCard(socket, userName, data) {
    const logMessage = `${userName} auto placed a card`;
    gameLog.push(logMessage);
    io.emit('autoPlaceCard', data);
}

function handleFlipAllCards(socket, userName, data) {
    const logMessage = `${userName} flipped all cards`;
    gameLog.push(logMessage);
    socket.broadcast.emit('flipAllCards', data);
}

function handleRequestCardText(socket, data) {
    let text;
    if (cardTexts[data.cardId]) {
        text = cardTexts[data.cardId];
    } else {
        text = generateCardText(data.deckIndex);
        cardTexts[data.cardId] = text;
    }
    io.emit('cardText', { cardId: data.cardId, text: text });
}

function handleDisconnect(socket, userName) {
    console.log(`${userName} disconnected`);
    delete players[socket.id];
    io.emit('updatePlayerList', Object.values(players));
    io.emit('playerDisconnected', userName);
}

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
