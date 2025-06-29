// Configuration et variables globales
const CONFIG = {
  NEWSLETTER_DELAY: 30000, // 30 secondes
  COOKIE_EXPIRY_DAYS: 365,
  ANIMATION_DURATION: 300
};

// Utilitaires
const Utils = {
  // Gestion des cookies
  setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  },

  getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },

  // Animation smooth scroll
  smoothScroll(target, duration = 800) {
    const targetElement = document.querySelector(target);
    if (!targetElement) return;

    const targetPosition = targetElement.offsetTop - 80; // Offset pour le header fixe
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = this.easeInOutQuad(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    this.easeInOutQuad = (t, b, c, d) => {
      t /= d / 2;
      if (t < 1) return c / 2 * t * t + b;
      t--;
      return -c / 2 * (t * (t - 2) - 1) + b;
    };

    requestAnimationFrame(animation);
  },

  // Debounce pour optimiser les performances
  debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  },

  // Validation d'email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
};

// Gestion du consentement des cookies
class CookieConsent {
  constructor() {
    this.consentElement = document.querySelector('.cookie-consent');
    this.acceptButton = document.querySelector('.cookie-accept');
    this.init();
  }

  init() {
    if (!Utils.getCookie('cookie_consent')) {
      this.show();
    }

    if (this.acceptButton) {
      this.acceptButton.addEventListener('click', () => this.accept());
    }
  }

  show() {
    if (this.consentElement) {
      setTimeout(() => {
        this.consentElement.classList.add('show');
      }, 1000);
    }
  }

  accept() {
    Utils.setCookie('cookie_consent', 'accepted', CONFIG.COOKIE_EXPIRY_DAYS);
    if (this.consentElement) {
      this.consentElement.classList.remove('show');
      setTimeout(() => {
        this.consentElement.style.display = 'none';
      }, CONFIG.ANIMATION_DURATION);
    }
  }
}

// Gestion du menu mobile
class MobileMenu {
  constructor() {
    this.menuToggle = document.querySelector('.mobile-menu');
    this.navMenu = document.querySelector('.nav-menu');
    this.init();
  }

  init() {
    if (this.menuToggle && this.navMenu) {
      this.menuToggle.addEventListener('click', () => this.toggle());
      
      // Fermer le menu lors du clic sur un lien
      this.navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => this.close());
      });

      // Fermer le menu lors du clic à l'extérieur
      document.addEventListener('click', (e) => {
        if (!this.menuToggle.contains(e.target) && !this.navMenu.contains(e.target)) {
          this.close();
        }
      });
    }
  }

  toggle() {
    this.navMenu.classList.toggle('mobile-active');
    this.menuToggle.classList.toggle('active');
    
    // Animation de l'icône hamburger
    const icon = this.menuToggle.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-bars');
      icon.classList.toggle('fa-times');
    }
  }

  close() {
    this.navMenu.classList.remove('mobile-active');
    this.menuToggle.classList.remove('active');
    
    const icon = this.menuToggle.querySelector('i');
    if (icon) {
      icon.classList.add('fa-bars');
      icon.classList.remove('fa-times');
    }
  }
}

// Gestion de la popup newsletter
class NewsletterPopup {
  constructor() {
    this.popup = document.getElementById('newsletter-popup');
    this.closeButton = document.querySelector('.close-popup');
    this.form = document.getElementById('newsletter-form');
    this.emailInput = this.form?.querySelector('input[type="email"]');
    this.init();
  }

  init() {
    if (!this.popup) return;

    // Afficher la popup après un délai si pas déjà vue
    if (!Utils.getCookie('newsletter_shown')) {
      setTimeout(() => this.show(), CONFIG.NEWSLETTER_DELAY);
    }

    // Événements
    if (this.closeButton) {
      this.closeButton.addEventListener('click', () => this.close());
    }

    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // Fermer avec Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.popup.classList.contains('show')) {
        this.close();
      }
    });

    // Fermer en cliquant sur l'arrière-plan
    this.popup.addEventListener('click', (e) => {
      if (e.target === this.popup) {
        this.close();
      }
    });
  }

  show() {
    if (this.popup) {
      this.popup.classList.add('show');
      if (this.emailInput) {
        setTimeout(() => this.emailInput.focus(), CONFIG.ANIMATION_DURATION);
      }
    }
  }

  close() {
    if (this.popup) {
      this.popup.classList.remove('show');
      Utils.setCookie('newsletter_shown', 'true', 7); // Ne pas montrer pendant 7 jours
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    
    if (!this.emailInput) return;

    const email = this.emailInput.value.trim();
    
    if (!Utils.isValidEmail(email)) {
      this.showError('Veuillez entrer une adresse email valide.');
      return;
    }

    // Simulation d'envoi (remplacer par vraie API)
    this.showLoading();
    
    setTimeout(() => {
      this.showSuccess();
      Utils.setCookie('newsletter_subscribed', 'true', CONFIG.COOKIE_EXPIRY_DAYS);
      setTimeout(() => this.close(), 2000);
    }, 1500);
  }

  showError(message) {
    this.showMessage(message, 'error');
  }

  showSuccess() {
    this.showMessage('Merci ! Votre guide sera envoyé par email.', 'success');
  }

  showLoading() {
    const button = this.form.querySelector('button');
    if (button) {
      button.textContent = 'Envoi en cours...';
      button.disabled = true;
    }
  }

  showMessage(message, type) {
    const existingMessage = this.form.querySelector('.message');
    if (existingMessage) {
      existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    this.form.appendChild(messageDiv);

    const button = this.form.querySelector('button');
    if (button) {
      button.textContent = 'Télécharger maintenant';
      button.disabled = false;
    }
  }
}

// Gestion des évaluations par étoiles
class RatingSystem {
  constructor() {
    this.init();
  }

  init() {
    document.querySelectorAll('.rating').forEach(rating => {
      const ratingValue = parseFloat(rating.dataset.rating);
      this.updateStars(rating, ratingValue);
    });
  }

  updateStars(ratingElement, value) {
    const starsElement = ratingElement.querySelector('.stars');
    if (!starsElement) return;

    const fullStars = Math.floor(value);
    const hasHalfStar = value % 1 !== 0;
    let starsHTML = '';

    // Étoiles pleines
    for (let i = 0; i < fullStars; i++) {
      starsHTML += '★';
    }

    // Demi-étoile
    if (hasHalfStar) {
      starsHTML += '☆';
    }

    // Étoiles vides
    const emptyStars = 5 - Math.ceil(value);
    for (let i = 0; i < emptyStars; i++) {
      starsHTML += '☆';
    }

    starsElement.innerHTML = starsHTML;
  }
}

// Gestion de la navigation smooth
class SmoothNavigation {
  constructor() {
    this.init();
  }

  init() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('href');
        if (target && target !== '#') {
          Utils.smoothScroll(target);
        }
      });
    });
  }
}

// Gestion du lazy loading des images
class LazyLoading {
  constructor() {
    this.images = document.querySelectorAll('img[data-src]');
    this.init();
  }

  init() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target);
          }
        });
      });

      this.images.forEach(img => this.observer.observe(img));
    } else {
      // Fallback pour les navigateurs plus anciens
      this.images.forEach(img => this.loadImage(img));
    }
  }

  loadImage(img) {
    const src = img.dataset.src;
    if (src) {
      img.src = src;
      img.classList.add('loaded');
      if (this.observer) {
        this.observer.unobserve(img);
      }
    }
  }
}

// Gestion des animations au scroll
class ScrollAnimations {
  constructor() {
    this.elements = document.querySelectorAll('.animate-on-scroll');
    this.init();
  }

  init() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            this.observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1
      });

      this.elements.forEach(el => this.observer.observe(el));
    }
  }
}

// Gestion des liens Amazon avec tracking
class AmazonLinks {
  constructor() {
    this.init();
  }

  init() {
    document.querySelectorAll('.btn-amazon').forEach(link => {
      link.addEventListener('click', (e) => {
        // Analytics tracking (remplacer par votre solution)
        this.trackClick(link);
      });
    });
  }

  trackClick(link) {
    const productName = link.closest('.product-card')?.querySelector('h3')?.textContent;
    
    // Exemple avec Google Analytics (à adapter)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'click', {
        event_category: 'Amazon Link',
        event_label: productName,
        value: 1
      });
    }

    console.log('Amazon link clicked:', productName);
  }
}

// Gestion de la performance et optimisations
class PerformanceOptimizer {
  constructor() {
    this.init();
  }

  init() {
    // Préchargement des ressources critiques
    this.preloadCriticalResources();
    
    // Optimisation des images
    this.optimizeImages();
    
    // Gestion de la connexion réseau
    this.handleNetworkChanges();
  }

  preloadCriticalResources() {
    const criticalResources = [
      'products.html',
      'privacy.html'
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = resource;
      document.head.appendChild(link);
    });
  }

  optimizeImages() {
    document.querySelectorAll('img').forEach(img => {
      if (!img.loading) {
        img.loading = 'lazy';
      }
    });
  }

  handleNetworkChanges() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        document.body.classList.add('slow-connection');
      }
    }
  }
}

// Initialisation de l'application
class App {
  constructor() {
    this.components = [];
    this.init();
  }

  init() {
    // Attendre que le DOM soit chargé
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initComponents());
    } else {
      this.initComponents();
    }
  }

  initComponents() {
    try {
      // Initialiser tous les composants
      this.components = [
        new CookieConsent(),
        new MobileMenu(),
        new NewsletterPopup(),
        new RatingSystem(),
        new SmoothNavigation(),
        new LazyLoading(),
        new ScrollAnimations(),
        new AmazonLinks(),
        new PerformanceOptimizer()
      ];

      console.log('GadgetFinderPro initialized successfully');
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  }
}

// Démarrer l'application
const app = new App();

// Gestion des erreurs globales
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
});

// Gestion des promesses rejetées
window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
});

// Export pour les tests (si nécessaire)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { App, Utils };
}

