document.addEventListener('DOMContentLoaded', function() {
    bindEventListeners();
});

function bindEventListeners() {

    const createGameButton = document.getElementById('createGameBtn');
    createGameButton.addEventListener('click', () => navigate('gameA.html'));
}


function navigate(url) {
    document.body.classList.add('fade-out');
    setTimeout(() => {
        window.location.href = url;
    }, 2000); // Delay matches the animation duration
}


function toggleMenu() {
    var menuContent = document.getElementById("menuContent");
    menuContent.style.display = menuContent.style.display === "block" ? "none" : "block";
}

function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    // Optional: Close the burger menu when a modal is opened
    document.getElementById("menuContent").style.display = 'none';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}
