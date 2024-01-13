document.addEventListener('DOMContentLoaded', function() {
    bindEventListeners();
});

function bindEventListeners() {
    const joinGameButton = document.getElementById('joinGameBtn');
    joinGameButton.addEventListener('click', handleJoinGameClick);

    const createGameButton = document.getElementById('createGameBtn');
    createGameButton.addEventListener('click', () => navigate('gameA.html'));
}

function handleJoinGameClick() {
    const gameId = document.getElementById('joinGameInput').value.trim();

    if (isValidGameId(gameId)) {
        navigate(`gameA.html?gameId=${encodeURIComponent(gameId)}`);
    } else {
        alert('Please introduce a valid Game ID!');
    }
}

function isValidGameId(gameId) {
    // Implement additional validation logic if necessary
    return gameId.length > 0;
}

function navigate(url) {
    document.body.classList.add('fade-out');
    setTimeout(() => {
        window.location.href = url;
    }, 2000); // Delay matches the animation duration
}
