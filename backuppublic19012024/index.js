// Utility Functions
function navigate(url) {
    document.body.classList.add('fade-out');
    setTimeout(() => {
        window.location.href = url;
    }, 2000); // Delay matches the animation duration
}

// Specific Event Handler Functions
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';

    // Reset the burger menu icon to default (three lines)
    var menuIcon = document.querySelector('.menu-icon');
    if (menuIcon.classList.contains('open')) {
        menuIcon.classList.remove('open');
    }

    // Close the burger menu content
    var menuContent = document.getElementById("menuContent");
    menuContent.style.display = 'none';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function toggleMenu() {
    var menuIcon = document.querySelector('.menu-icon');
    menuIcon.classList.toggle('open');

    // Toggle the visibility of the menu content
    var menuContent = document.getElementById('menuContent');
    menuContent.style.display = (menuContent.style.display === 'block') ? 'none' : 'block';
}

// Event Binding Function
function bindEventListeners() {
    const createGameButton = document.getElementById('createGameBtn');
    createGameButton.addEventListener('click', () => navigate('gameA.html'));

    const closeModalButton = document.getElementById('closeModalButton');
    closeModalButton.addEventListener('click', () => closeModal('myModal'));
}

// Event Listener Registrations
document.addEventListener('DOMContentLoaded', function() {
    bindEventListeners();
});

window.addEventListener('resize', function() {
    var minWidth = 1024; // Define your minimum width
    var minHeight = 768; // Define your minimum height
    var width = window.innerWidth;
    var height = window.innerHeight;

    if (width < minWidth || height < minHeight) {
        // Show the popup
        document.getElementById('resolution-warning').style.display = 'block';
    } else {
        // Hide the popup
        document.getElementById('resolution-warning').style.display = 'none';
    }
});

// disable-right-click.js
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
}, false);

document.getElementById('centerImage').addEventListener('dragstart', function(e) {
    e.preventDefault();
});