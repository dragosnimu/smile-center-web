document.addEventListener('DOMContentLoaded', () => {
  // 1. THEME SWITCHER (Light / Dark Mode)
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeIcon = themeToggleBtn.querySelector('i');
  
  // Check for saved theme preference or system default
  const savedTheme = localStorage.getItem('smile-center-theme') || 
                     (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
  
  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('smile-center-theme', newTheme);
    updateThemeIcon(newTheme);
    
    // Dynamically update Leaflet Map Tile Layer if map exists
    updateMapTiles(newTheme);
  });
  
  function updateThemeIcon(theme) {
    if (theme === 'dark') {
      themeIcon.className = 'fas fa-sun';
      themeToggleBtn.setAttribute('title', 'Comută la Modul Luminos');
    } else {
      themeIcon.className = 'fas fa-moon';
      themeToggleBtn.setAttribute('title', 'Comută la Modul Întunecat');
    }
  }

  // 2. STICKY GLASSMORPHIC NAVBAR
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 3. MOBILE MENU TOGGLE
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    menuToggle.classList.toggle('open');
  });

  // Close mobile menu when clicking a link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      menuToggle.classList.remove('open');
    });
  });

  // 4. ANIMATED STATS COUNTER
  const statsSection = document.getElementById('stats-section');
  const statNumbers = document.querySelectorAll('.stat-number');
  let countStarted = false;

  const countUp = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const speed = 2000; // Animation duration in ms
    const increment = target / (speed / 16); // ~60fps
    let current = 0;

    const updateCount = () => {
      current += increment;
      if (current < target) {
        el.innerText = Math.floor(current) + suffix;
        requestAnimationFrame(updateCount);
      } else {
        el.innerText = target + suffix;
      }
    };
    updateCount();
  };

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countStarted) {
        statNumbers.forEach(num => countUp(num));
        countStarted = true;
      }
    });
  }, { threshold: 0.5 });

  if (statsSection) {
    statsObserver.observe(statsSection);
  }

  // 5. BEFORE / AFTER DENTAL COMPARISON SLIDER
  const sliderContainer = document.getElementById('smile-slider');
  if (sliderContainer) {
    const afterImageWrapper = sliderContainer.querySelector('.slider-after');
    const sliderHandle = sliderContainer.querySelector('.slider-handle');
    
    let active = false;
    
    const sliderMove = (x) => {
      let rect = sliderContainer.getBoundingClientRect();
      let position = ((x - rect.left) / rect.width) * 100;
      
      // Keep boundaries between 0% and 100%
      if (position < 0) position = 0;
      if (position > 100) position = 100;
      
      afterImageWrapper.style.width = `${position}%`;
      sliderHandle.style.left = `${position}%`;
    };

    // Desktop mouse events
    sliderContainer.addEventListener('mousedown', () => { active = true; });
    window.addEventListener('mouseup', () => { active = false; });
    window.addEventListener('mousemove', (e) => {
      if (!active) return;
      sliderMove(e.clientX);
    });

    // Touch events for mobile responsiveness
    sliderContainer.addEventListener('touchstart', () => { active = true; });
    window.addEventListener('touchend', () => { active = false; });
    window.addEventListener('touchmove', (e) => {
      if (!active) return;
      sliderMove(e.touches[0].clientX);
    });
  }

  // 6. GOOGLE REVIEWS INTERACTIVE CAROUSEL
  const carouselContainer = document.getElementById('reviews-carousel');
  const prevBtn = document.getElementById('review-prev');
  const nextBtn = document.getElementById('review-next');
  
  if (carouselContainer && prevBtn && nextBtn) {
    let scrollAmount = 0;
    const cardWidth = 350; // Approximated card width including margin
    
    nextBtn.addEventListener('click', () => {
      const maxScroll = carouselContainer.scrollWidth - carouselContainer.clientWidth;
      scrollAmount += cardWidth;
      if (scrollAmount > maxScroll) scrollAmount = maxScroll;
      carouselContainer.scrollTo({
        top: 0,
        left: scrollAmount,
        behavior: 'smooth'
      });
    });
    
    prevBtn.addEventListener('click', () => {
      scrollAmount -= cardWidth;
      if (scrollAmount < 0) scrollAmount = 0;
      carouselContainer.scrollTo({
        top: 0,
        left: scrollAmount,
        behavior: 'smooth'
      });
    });
  }

  // 7. LEAFLET.JS MAP INTEGRATION
  let map;
  let tileLayer;
  const clinicCoords = [45.7661, 21.2189]; // Str. Brândușei 18, Timișoara

  function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    // Initialize Leaflet Map
    map = L.map('map', {
      scrollWheelZoom: false,
      zoomControl: false
    }).setView(clinicCoords, 16);

    // Zoom control on bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Tile Layers depending on active theme
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    const tileUrl = theme === 'dark' 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' 
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      
    tileLayer = L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    // Custom pulse icon marker
    const customPulseIcon = L.divIcon({
      className: 'map-pulse-marker',
      html: `
        <div class="pulse-ring"></div>
        <div class="marker-dot">
          <i class="fas fa-tooth"></i>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    // Add marker to map
    const marker = L.marker(clinicCoords, { icon: customPulseIcon }).addTo(map);
    
    // Elegant clinical popup
    marker.bindPopup(`
      <div class="map-popup-card">
        <h3>Smile Center</h3>
        <p><strong>Dr. Camelia Szuhanek</strong></p>
        <p><i class="fas fa-map-marker-alt"></i> Str. Brândușei Nr. 18, Timișoara</p>
        <p><i class="fas fa-phone-alt"></i> info@smile-center.ro</p>
        <a href="https://www.google.com/maps/dir/?api=1&destination=45.7661,21.2189" target="_blank" class="popup-btn">
          Navighează <i class="fas fa-location-arrow"></i>
        </a>
      </div>
    `).openPopup();
  }

  function updateMapTiles(theme) {
    if (!map || !tileLayer) return;
    
    const tileUrl = theme === 'dark' 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' 
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      
    tileLayer.setUrl(tileUrl);
  }

  // Load Leaflet and initialize map
  if (document.getElementById('map')) {
    initMap();
  }

  // 8. ASYNCHRONOUS APPOINTMENT FORM HANDLER
  const contactForm = document.getElementById('appointment-form');
  const successModal = document.getElementById('success-modal');
  const closeModalBtn = document.getElementById('close-modal');
  
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      
      // Visual feedback loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Se trimite...';
      
      const formData = {
        name: document.getElementById('form-name').value,
        email: document.getElementById('form-email').value,
        phone: document.getElementById('form-phone').value,
        service: document.getElementById('form-service').value,
        date: document.getElementById('form-date').value,
        message: document.getElementById('form-message').value
      };
      
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
          // Success
          showSuccessModal(result.message);
          contactForm.reset();
        } else {
          // Display API validation error
          alert(result.message || 'A apărut o eroare la trimitere. Vă rugăm să încercați din nou.');
        }
      } catch (err) {
        console.error('Submission error:', err);
        alert('Eroare de rețea. Vă rugăm să verificați conexiunea la internet și să încercați din nou.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
  }
  
  function showSuccessModal(message) {
    if (!successModal) return;
    const modalMessage = successModal.querySelector('.modal-message');
    modalMessage.textContent = message;
    successModal.classList.add('visible');
    
    // Add subtle confetti/celebration vibration if supported
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  }
  
  if (closeModalBtn && successModal) {
    closeModalBtn.addEventListener('click', () => {
      successModal.classList.remove('visible');
    });
    
    // Close on click outside modal content
    successModal.addEventListener('click', (e) => {
      if (e.target === successModal) {
        successModal.classList.remove('visible');
      }
    });
  }

  // 9. SMOOTH ANIMATED SCROLL ON NAV LINKS
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const headerOffset = 90;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // 10. SCROLL ENTRANCE ANIMATIONS (FADE-UP GENTLY)
  const fadeElems = document.querySelectorAll('.service-card, .review-card, .gallery-item, .tech-card, .about-text, .about-photo-wrapper, .visual-card, .braces-panel');
  
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-visible');
        fadeObserver.unobserve(entry.target); // Animate once
      }
    });
  }, { threshold: 0.1 });
  
  fadeElems.forEach(el => {
    el.classList.add('fade-in-ready');
    fadeObserver.observe(el);
  });

  // 11. INTERACTIVE BRACES SELECTOR TABS
  const tabButtons = document.querySelectorAll('.tab-btn');
  const bracesPanels = document.querySelectorAll('.braces-panel');

  if (tabButtons.length > 0 && bracesPanels.length > 0) {
    // Set initial state for non-active panels in JavaScript to support transitions
    bracesPanels.forEach(panel => {
      if (!panel.classList.contains('active')) {
        panel.style.display = 'none';
      }
    });

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');

        // Update active button state
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Switch panels with smooth fade
        bracesPanels.forEach(panel => {
          if (panel.id === targetTab) {
            panel.style.display = 'grid';
            // Force browser reflow to trigger transition
            panel.offsetHeight;
            panel.classList.add('active');
          } else {
            panel.classList.remove('active');
            // Hide after transition completes (400ms)
            setTimeout(() => {
              if (!panel.classList.contains('active')) {
                panel.style.display = 'none';
              }
            }, 400);
          }
        });
      });
    });
  }
});
