const fs = require("fs");
const path = require("path");
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

// Initialize Express and Socket.io
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const usedCardTexts = {}; // Object to store used texts for each deck


// Serve index.html from the parent of the public directory
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from the public directory
// app.use(express.static("public"));

// Constants and Global Variables
const deckFiles = [
  "tilanne-cards.txt",
  "tila-cards.txt",
  "keinotja-oivallukset-cards.txt",
  "resurssit-cards.txt",
  "opetusmuoto-cards.txt",
  "sattuma-cards.txt",
];
const animalNames = [
  "Karhu",
  "Kettu",
  "Susi",
  "Peura",
  "Pöllö",
  "Haukka",
  "Jänis",
  "Orava",
  "Mäyrä",
  "Hirvi",
];
let nameIndex = 0;
let players = {}; // Object to store players and their aliases
let currentGameId; // Game ID will be set when a player connects
let cardTexts = {}; // Object to store texts for each card

// Utility Functions
function generateGameId() {
  // Generate a unique game ID
  const gameId = Date.now().toString(36) + Math.random().toString(36).substr(2);

  // Display a successful console message
  console.log('Generated game ID:', gameId);

  return gameId; // Return the generated game ID
}

function generateCardText(deckIndex) {
  try {
    const filePath = path.join(__dirname, "public/cardstext", deckFiles[deckIndex]);
    const data = fs.readFileSync(filePath, "utf8");
    let words = data.split("\n").map(word => word.trim()).filter(word => word);

    // Remove already used texts for this deck
    if (usedCardTexts[deckIndex]) {
      words = words.filter(word => !usedCardTexts[deckIndex].includes(word));
    }

    if (words.length > 0) {
      const selectedText = words[Math.floor(Math.random() * words.length)];
      // Add the selected text to the used texts
      if (!usedCardTexts[deckIndex]) {
        usedCardTexts[deckIndex] = [];
      }
      usedCardTexts[deckIndex].push(selectedText);
      return selectedText;
    } else {
      console.error(`No more unique texts available for deck ${deckFiles[deckIndex]}.`);
      return "No unique text available for this card";
    }
  } catch (error) {
    console.error(`Failed to fetch data for deck ${deckIndex}:`, error);
    return "Error fetching card text";
  }
}

function resetUsedCardTexts() {
  // Call this function when you want to reset the used texts, for example, at the start of a new game
  for (const key in usedCardTexts) {
    usedCardTexts[key] = [];
  }
}

// Socket.io Event Handlers
io.on("connection", (socket) => {
  // Generate a new game ID only when a new player connects
  if (!currentGameId) {
    currentGameId = generateGameId();
    console.log(`Current game ID: ${currentGameId}`);
  }

  const userName = animalNames[nameIndex % animalNames.length];
  nameIndex++;
  players[socket.id] = userName;
  console.log(`${userName} connected`);

  // Send initial data to the newly connected client
  // io.to(socket.id).emit("resetDecks", currentGameId);
  io.to(socket.id).emit("yourUserName", userName);

  // Update the player list for all clients
  io.emit("updatePlayerList", Object.values(players));
  io.emit("playerConnected", userName);

    // Emit the resetDecks event to all clients when a new player joins
    handleResetDecks();

  // Event: Card Moved
  socket.on("cardMoved", (data) => {
    handleCardMoved(socket, userName, data);
  });

  // Event: Flip Card
  socket.on("flipCard", (data) => {
    handleFlipCard(socket, userName, data);
  });

  // Event: Reset Decks
  socket.on("resetDecks", () => {
    handleResetDecks(socket, userName);
  });

  // Event: Request Card Text
  socket.on("requestCardText", (data) => {
    handleRequestCardText(socket, data);
  });

  // Inside the connection event
socket.on("cursorMove", (data) => {
  handleCursorMove(socket, data);
});

  // Event: Disconnect
  socket.on("disconnect", () => {
    handleDisconnect(socket, userName);
  });
  // Emit an event to all clients when a new player joins
  io.emit("newPlayerJoined");
});

// Event Handler Functions
function handleCardMoved(socket, userName, data) {
  io.emit("cardMoved", data);
  console.log(`Card with ID ${data.cardId} was moved by ${userName}`);
}

function handleFlipCard(socket, userName, data) {
  socket.broadcast.emit("flipCard", data);
  console.log(`Card with ID ${data.cardId} was flipped by ${userName}`);
}

function handleResetDecks(socket, userName) {
  // Clear the card texts and used texts to ensure new ones are generated
  cardTexts = {};
  resetUsedCardTexts(); // Reset used card texts
  io.emit("resetDecks", currentGameId);
  console.log(`Decks reset for all players!`);
}

function handleCursorMove(socket, data) {
  socket.broadcast.emit("cursorUpdate", data);
  console.log(`Cursor moved by ${data.userId} to position x:${data.x}, y:${data.y}`);
}

function handleRequestCardText(socket, data) {
  let text;
  let logMessage; // Variable to store the log message

  if (cardTexts[data.cardId]) {
    text = cardTexts[data.cardId];
    logMessage = `Card text for card ID ${data.cardId} already exists. Sending existing text.`;
  } else {
    text = generateCardText(data.deckIndex);
    cardTexts[data.cardId] = text;
    logMessage = `Generated new card text for card ID ${data.cardId} from deck index ${data.deckIndex}.`;
  }
  console.log(logMessage); // Log the message
  io.emit("cardText", { cardId: data.cardId, text: text });
}

function handleDisconnect(socket, userName) {
  console.log(`${userName} disconnected. Removing from players list.`); // Log when a user disconnects

  delete players[socket.id]; // Remove the player from the players list
  console.log(`Updated players list after disconnection: ${Object.values(players).join(', ')}`); // Log the updated players list

  io.emit("updatePlayerList", Object.values(players)); // Update player list for all clients
  io.emit("playerDisconnected", userName); // Notify all clients about the disconnection

  console.log(`Notified all clients about the disconnection of ${userName}.`); // Log notification to all clients
  socket.broadcast.emit("playerDisconnected", userName);
}

// Start the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));