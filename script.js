let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');
let contactBtn = document.querySelector('.navbar .gradient-btn');
let sections = document.querySelectorAll('sections');
let navLinks = document.querySelectorAll('header nav a');
const skillsLists = document.querySelectorAll('.skills-list');
const skillsBoxs = document.querySelectorAll('.resume-box');
const cvBtns = document.querySelectorAll('.cv-btn');
const cvDetails = document.querySelectorAll('.cv-detail');


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
      // 1. Remove active classes with animation
      document.querySelectorAll('.cv-btn.active, .cv-detail.active').forEach(el => {
        if (el.classList.contains('cv-detail')) {
          // Animate out current detail
          el.style.opacity = 0;
          el.style.transform = 'translateY(20px)';
          setTimeout(() => {
            el.classList.remove('active');
          }, 100); // Match CSS transition duration
        } else {
          // Immediately deactivate button
          el.classList.remove('active');
        }
      });
  
      // 2. Add active classes with animation
      setTimeout(() => {
        btn.classList.add('active');
        cvDetails[idx].classList.add('active');
        // Reset styles in case they were animated out previously
        cvDetails[idx].style.opacity = '';
        cvDetails[idx].style.transform = '';
      }, 350); // Slightly longer than the out animation
    });
  });

  document.getElementById('certification-upload').addEventListener('submit', function(e) {
  e.preventDefault();
  
  // Get form values
  const name = document.getElementById('cert-name').value;
  const issuer = document.getElementById('cert-issuer').value;
  const date = document.getElementById('cert-date').value;
  const imageFile = document.getElementById('cert-image').files[0];
  
  if (imageFile) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      // Create new certification item
      const newCert = document.createElement('div');
      newCert.className = 'certification-item';
      newCert.innerHTML = `
        <div class="certification-image-container">
          <img src="${e.target.result}" alt="${name}" class="certification-image">
          <div class="certification-overlay">
            <button class="view-btn">View Full Size</button>
          </div>
        </div>
        <div class="certification-info">
          <h3>${name}</h3>
          <p>Issued by: ${issuer}</p>
          <p>Date: ${new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
      `;
      
      // Insert before upload form
      document.querySelector('.certification-container').insertBefore(newCert, document.querySelector('.upload-certification'));
      
      // Reset form
      e.target.reset();
    };
    
    reader.readAsDataURL(imageFile);
  }
});

// View full size functionality
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('view-btn')) {
    const imgSrc = e.target.closest('.certification-image-container').querySelector('img').src;
    // Create modal or open in new tab
    window.open(imgSrc, '_blank');
  }
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

document.addEventListener('DOMContentLoaded', function() {
    const slideTrack = document.querySelector('.img-slide');
    const slides = document.querySelectorAll('.img-item');
    const arrowLeft = document.querySelector('.arrow-left');
    const arrowRight = document.querySelector('.arrow-right');
    
    let currentIndex = 0;
    const totalSlides = slides.length;
    
    // Initialize
    updateCarousel();
    
    // Navigation functions
    function moveToSlide(index) {
        currentIndex = index;
        updateCarousel();
    }
    
    function updateCarousel() {
        // Update slide position
        slideTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        // Update button states
        arrowLeft.classList.toggle('disabled', currentIndex === 0);
        arrowRight.classList.toggle('disabled', currentIndex === totalSlides - 1);
    }
    
    // Event listeners
    arrowRight.addEventListener('click', function() {
        if (currentIndex < totalSlides - 1) {
            moveToSlide(currentIndex + 1);
        }
    });
    
    arrowLeft.addEventListener('click', function() {
        if (currentIndex > 0) {
            moveToSlide(currentIndex - 1);
        }
    });
    
    // Optional: Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowRight') arrowRight.click();
        if (e.key === 'ArrowLeft') arrowLeft.click();
    });
});
