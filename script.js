let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');
let contactBtn = document.querySelector('.navbar .gradient-btn');
let sections = document.querySelectorAll('sections');
let navLinks = document.querySelectorAll('header nav a');
const skillsLists = document.querySelectorAll('.skills-list');
const skillsBoxs = document.querySelectorAll('.resume-box');
const cvBtns = document.querySelectorAll('.cv-btn');


navLinks.forEach((link, index) => {
    link.style.setProperty('--i', index);
});

menuIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
    document.body.style.overflow = navbar.classList.contains('active') ? 'hidden' : '';
});

// Close menu when clicking on links or button
[...navLinks, contactBtn].forEach(item => {
    item?.addEventListener('click', () => {
        menuIcon.classList.remove('bx-x');
        navbar.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target) && e.target !== menuIcon) {
        menuIcon.classList.remove('bx-x');
        navbar.classList.remove('active');
        document.body.style.overflow = '';
    }
});

skillsLists.forEach((list, idx) => {
    list.addEventListener('click', () => {
        document.querySelector('.skills-list.active').classList.remove('active');
        list.classList.add('active'); 
      
        document.querySelector('.resume-box.active').classList.remove('active');
        skillsBoxs[idx].classList.add('active');
    });
});



cvBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
        const cvDetails = document.querySelectorAll('.cv-detail');
        
        cvBtns.forEach(btn => {
            btn.classList.remove('active');
        });
        btn.classList.add('active');

        cvDetails.forEach(detail => {
            detail.classList.remove('active');
        });
        cvDetails[idx].classList.add('active');
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const arrowRight = document.querySelector('.arrow-right');
    const arrowLeft = document.querySelector('.arrow-left');
    const imgSlide = document.querySelector('.img-slide');
    const portfolioDetails = document.querySelectorAll('.portfolio-detail');
    const totalItems = portfolioDetails.length;
    let currentIndex = 0;

    function updateCarousel() {
        // Update carousel position
        imgSlide.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        // Update active project detail
        portfolioDetails.forEach((detail, index) => {
            detail.classList.toggle('active', index === currentIndex);
        });
        
        // Update button states
        arrowLeft.classList.toggle('disabled', currentIndex === 0);
        arrowRight.classList.toggle('disabled', currentIndex === totalItems - 1);
    }

    arrowRight.addEventListener('click', () => {
        if (currentIndex < totalItems - 1) {
            currentIndex++;
            updateCarousel();
        }
    });

    arrowLeft.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    // Initialize
    updateCarousel();

    // Optional: Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
            arrowRight.click();
        } else if (e.key === 'ArrowLeft') {
            arrowLeft.click();
        }
    });

    // Optional: Touch support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    imgSlide.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, {passive: true});

    imgSlide.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, {passive: true});

    function handleSwipe() {
        const threshold = 50;
        if (touchStartX - touchEndX > threshold) {
            arrowRight.click();
        } else if (touchEndX - touchStartX > threshold) {
            arrowLeft.click();
        }
    }
});
