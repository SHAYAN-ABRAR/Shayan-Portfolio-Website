// Scroll Progress Bar Logic
window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = (scrollTop / docHeight) * 100;

  const progressBar = document.getElementById("scroll-indicator");
  progressBar.style.height = `${scrollPercent}%`;
});

// Loading animation
const letters = document.querySelectorAll(".loading-text span");

// "Hello" in several languages, shown before the name reveal
const greetingEl = document.getElementById("hello-greeting");
const greetingWord = greetingEl ? greetingEl.querySelector(".hg-word") : null;
const greetings = [
  "Hello", "আসসালামু আলাইকুম", "নমস্কার", "नमस्ते",
  "Hola", "Bonjour", "Ciao", "こんにちは", "안녕하세요", "مرحبا"
];

// Animate each letter of the name with stagger (the original flickering reveal)
function runNameLoader() {
  gsap.to(letters, {
    opacity: 1,
    duration: 1.2,
    stagger: 0.15,
    onUpdate: function () {
      letters.forEach((el, i) => {
        gsap.to(el, {
          color: "#ffffff",
          duration: 0.2,
          delay: i * 0.15,
        });
        gsap.to(el, {
          color: "rgba(255,255,255,0.1)",
          duration: 0.2,
          delay: i * 0.15 + 0.4,
        });
        gsap.to(el.querySelector("::after"), {
          opacity: 1,
          duration: 0.2,
          delay: i * 0.15,
        });
      });
    },
    onComplete: () => {
      gsap.to("#loading", {
        opacity: 0,
        duration: 1,
        delay: 0.5,
        onComplete: () => {
          document.getElementById("loading").style.display = "none";
        },
      });
    },
  });
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (greetingEl && greetingWord && !prefersReducedMotion) {
  // "Hello" holds for ~0.8s, the remaining greetings share ~2s (≈2.8s total),
  // then hand off to the name reveal.
  const HELLO_TIME = 0.8;
  const REST_TIME = 2;
  const restPer = REST_TIME / (greetings.length - 1); // equal slot for each remaining word

  const greetTl = gsap.timeline({
    delay: 0.15, // let the loader paint first so "Hello" is always visible
    onComplete: () => {
      gsap.set(greetingEl, { display: "none" });
      runNameLoader();
    },
  });

  greetings.forEach((word, i) => {
    const slot = i === 0 ? HELLO_TIME : restPer;
    const fade = Math.min(0.12, slot * 0.3); // fade in / out duration
    const hold = Math.max(0.05, slot - fade * 2);
    greetTl
      .call(() => { greetingWord.textContent = word; })
      .fromTo(
        greetingEl,
        { opacity: 0, filter: "blur(6px)" },
        { opacity: 1, filter: "blur(0px)", duration: fade, ease: "power2.out" }
      )
      .to(greetingEl, { opacity: 1, duration: hold })
      .to(greetingEl, { opacity: 0, filter: "blur(6px)", duration: fade, ease: "power2.in" });
  });
} else {
  // Reduced motion (or no greeting element): go straight to the name
  if (greetingEl) gsap.set(greetingEl, { display: "none" });
  runNameLoader();
}


// Animation for Hero Text
gsap.from(".hero-left", {
  opacity: 0,
  x: -50,
  duration: 1.2,
  ease: "power3.out",
});

gsap.from(".hero-right", {
  opacity: 0,
  x: 50,
  duration: 1.2,
  ease: "power3.out",
  delay: 0.3,
});

gsap.utils.toArray(".journey-card").forEach((card, index) => {
  gsap.from(card, {
    opacity: 0,
    y: 80,
    duration: .4,
    ease: "power3.out",
    scrollTrigger: {
      trigger: card,
      start: "top 85%",
      toggleActions: "play none none reverse",
    },
    delay: index * 0.1,
  });
});

// HERO SECTION PARTICLES: space-like WebGL field in hero-particles.js
// (falls back to the old particles.js config from there if WebGL fails)



particlesJS("particles-projects", {
  "particles": {
    "number": { "value": 50 },
    "color": { "value": "ffffff" },
    "shape": { "type": "circle" },
    "opacity": {
      "value": 0.5,
      "random": true
    },
    "size": {
      "value": 4,
      "random": true
    },
    "line_linked": {
      "enable": true,
      "distance": 150,
      "color": "ffffff",
      "opacity": 0.4,
      "width": 1
    },
    "move": {
      "enable": true,
      "speed": 3,
      "direction": "none",
      "out_mode": "out"
    }
  },
  "interactivity": {
    "detect_on": "canvas",
    "events": {
      "onhover": { "enable": true, "mode": "grab" },
      "onclick": { "enable": true, "mode": "push" }
    },
    "modes": {
      "grab": {
        "distance": 140,
        "line_linked": { "opacity": 1 }
      },
      "push": { "particles_nb": 4 }
    }
  },
  "retina_detect": true
});


gsap.registerPlugin(ScrollTrigger);
  
gsap.utils.toArray('.fade-in').forEach((el) => {
  gsap.from(el, {
    scrollTrigger: {
      trigger: el,
      start: "top 85%",
      toggleActions: "play none none none"
    },
    opacity: 0,
    y: 40,
    duration: 1.2,
    ease: "power3.out",
  });
});

// Each project card animates in as IT enters the viewport, with a subtle
// left/right stagger within each two-column row (was: one tween off the
// first card, which left the lower cards already-revealed off-screen).
gsap.utils.toArray(".project-card").forEach((card, i) => {
  gsap.from(card, {
    scrollTrigger: {
      trigger: card,
      start: "top 85%",
      toggleActions: "play none none reverse"
    },
    opacity: 0,
    y: 60,
    duration: 0.9,
    ease: "power3.out",
    delay: (i % 2) * 0.12
  });
});

// GitHub stat cards — staggered count-in (previously had no entrance).
gsap.utils.toArray(".github-stat-card").forEach((card, i) => {
  gsap.from(card, {
    scrollTrigger: {
      trigger: card,
      start: "top 88%",
      toggleActions: "play none none reverse"
    },
    opacity: 0,
    y: 40,
    duration: 0.7,
    ease: "power3.out",
    delay: i * 0.08
  });
});

// Publication cards animate in as they enter (left/right stagger per row).
gsap.utils.toArray(".pub-card").forEach((card, i) => {
  gsap.from(card, {
    scrollTrigger: {
      trigger: card,
      start: "top 90%",
      toggleActions: "play none none reverse"
    },
    opacity: 0,
    y: 40,
    duration: 0.7,
    ease: "power3.out",
    delay: (i % 2) * 0.1
  });
});

// Count-up for the Google Scholar stat numbers.
gsap.utils.toArray(".research-stat-num").forEach((el) => {
  const target = parseInt(el.getAttribute("data-count"), 10) || 0;
  if (prefersReducedMotion) { el.textContent = target; return; }
  const counter = { v: 0 };
  gsap.to(counter, {
    v: target,
    duration: 1.4,
    ease: "power2.out",
    scrollTrigger: {
      trigger: el,
      start: "top 92%",
      toggleActions: "play none none none"
    },
    onUpdate: () => { el.textContent = Math.round(counter.v); }
  });
});

  gsap.from("#about-img", {
    scrollTrigger: {
      trigger: "#about-img",
      start: "top 80%",
      toggleActions: "play none none reset",
    },
    opacity: 0,
    x: -100,
    duration: .4,
    ease: "power3.out"
  });
  

  gsap.from("#about-text", {
    scrollTrigger: {
      trigger: "#about-text",
      start: "top 80%",
      toggleActions: "play none none reset",
    },
    opacity: 0,
    y: 50,
    duration: .4,
    ease: "power3.out",
    delay: 0.2
  });
  
  gsap.from("#techstack h2", {
    scrollTrigger: {
      trigger: "#techstack",
      start: "top 80%",
      toggleActions: "play none none reset"
    },
    opacity: 0,
    y: -40,
    duration: 1.2,
    ease: "power3.out"
  });
  
  gsap.utils.toArray("#techstack .group").forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: "top 85%",
        toggleActions: "play none none reset"
      },
      opacity: 0,
      y: 50,
      duration: 1,
      ease: "power3.out",
      delay: i * 0.1,
    });
  });

  gsap.utils.toArray('.tech-category').forEach((section, index) => {
    gsap.from(section, {
      opacity: 0,
      y: 60,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        toggleActions: "play none none reverse"
      }
    });
  });

  // Tech chips stagger in one-by-one within each grid (was: whole grid fading
  // as a single block) — makes the tech stack feel alive as it scrolls in.
  gsap.utils.toArray('.reveal-section').forEach(section => {
    gsap.from(section.children, {
      opacity: 0,
      y: 30,
      duration: 0.6,
      ease: "power3.out",
      stagger: 0.06,
      scrollTrigger: {
        trigger: section,
        start: "top 82%",
        toggleActions: "play none none reverse"
      }
    });
  });

  // Up coming projects

  gsap.utils.toArray(".upcoming-card").forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: "#upcoming-projects",
        start: "top 85%",
        toggleActions: "play none none reset"
      },
      opacity: 0,
      y: 60,
      duration: 1,
      ease: "power3.out",
      delay: i * 0.15,
    });
  });

  // Animated Download Button Functionality
  document.addEventListener('DOMContentLoaded', function() {
    const downloadInput = document.querySelector('.download-label .download-input');
    const downloadLink = document.querySelector('a[download]');
    
    if (downloadInput && downloadLink) {
      downloadInput.addEventListener('change', function() {
        if (this.checked) {
          // Trigger the download after animation starts
          setTimeout(() => {
            // Create a temporary link to trigger download
            const tempLink = document.createElement('a');
            tempLink.href = downloadLink.href;
            tempLink.download = downloadLink.download || 'resume.pdf';
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
            
            // Reset the checkbox after animation completes
            setTimeout(() => {
              this.checked = false;
            }, 4000); // Reset after animation completes
          }, 500); // Small delay to let animation start
        }
      });
    }
  });
  
// Contact Form Functionality
document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const submitText = document.getElementById('submitText');
  const submitLoading = document.getElementById('submitLoading');
  const formMessage = document.getElementById('formMessage');
  const messageText = document.getElementById('messageText');
  const messageInput = document.getElementById('message');

  // Gibberish detection functions
  function detectGibberish(text) {
    const errors = [];
    
    // Remove extra whitespace and normalize
    const cleanText = text.trim().replace(/\s+/g, ' ');
    

    
    // 1. Check minimum length
    if (cleanText.length < 10) {
      errors.push('Message must be at least 10 characters long');
    }
    
    // 2. Check minimum word count
    const words = cleanText.split(' ').filter(word => word.length > 0);
    if (words.length < 3) {
      errors.push('Message must contain at least 3 words');
    }
    
    // 3. Check for excessive character repetition (e.g., "aaaaaa", "!!!!!!")
    const charRepetition = /(.)\1{4,}/g;
    if (charRepetition.test(cleanText)) {
      errors.push('Message contains too many repeated characters');
    }
    
    // 4. Check for excessive word repetition
    const wordCounts = {};
    words.forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
      if (cleanWord.length > 2) {
        wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1;
      }
    });
    
    const repeatedWords = Object.entries(wordCounts).filter(([word, count]) => count > 2);
    if (repeatedWords.length > 0) {
      errors.push('Message contains too many repeated words');
    }
    
    // 5. Check for random character sequences (e.g., "asdfgh", "qwerty")
    const randomPatterns = [
      /asdfgh/i, /qwerty/i, /zxcvbn/i, /123456/i, /abcdef/i,
      /[!@#$%^&*]{3,}/
    ];
    
    for (const pattern of randomPatterns) {
      if (pattern.test(cleanText)) {
        errors.push('Message contains random character sequences');
        break;
      }
    }
    
    // 5.5. Check for consecutive numbers (but allow normal text)
    const consecutiveNumbers = /[0-9]{4,}/;
    if (consecutiveNumbers.test(cleanText)) {
      errors.push('Message contains random number sequences');
    }
    
    // 6. Check for meaningful content (at least some words with 3+ characters)
    const meaningfulWords = words.filter(word => word.length >= 3);
    if (meaningfulWords.length < 2) {
      errors.push('Message must contain meaningful words (3+ characters)');
    }
    
    // 7. Check for excessive punctuation
    const punctuationCount = (cleanText.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
    if (punctuationCount > cleanText.length * 0.3) {
      errors.push('Message contains too much punctuation');
    }
    
    // 8. Check for all caps (shouting)
    const upperCaseWords = words.filter(word => word === word.toUpperCase() && word.length > 2);
    if (upperCaseWords.length > words.length * 0.5) {
      errors.push('Please avoid typing in all capital letters');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  // Real-time validation
  if (messageInput) {
    let validationTimeout;
    
    messageInput.addEventListener('input', function() {
      clearTimeout(validationTimeout);
      
      validationTimeout = setTimeout(() => {
        const validation = detectGibberish(this.value);
        const messageContainer = this.parentElement;
        
        // Remove existing validation messages
        const existingError = messageContainer.querySelector('.validation-error');
        if (existingError) {
          existingError.remove();
        }
        
        // Remove existing validation classes
        this.classList.remove('border-red-500', 'border-green-500');
        
        if (this.value.trim() === '') {
          return; // Don't show validation for empty field
        }
        
        if (!validation.isValid) {
          this.classList.add('border-red-500');
          const errorDiv = document.createElement('div');
          errorDiv.className = 'validation-error text-red-500 text-sm mt-1';
          errorDiv.innerHTML = validation.errors.join('<br>');
          messageContainer.appendChild(errorDiv);
          
          // Auto-remove error message after 4 seconds
          setTimeout(() => {
            if (errorDiv.parentNode) {
              errorDiv.remove();
            }
          }, 2500);
        } else {
          this.classList.add('border-green-500');
          const successDiv = document.createElement('div');
          successDiv.className = 'validation-success text-green-500 text-sm mt-1';
          successDiv.textContent = 'Message looks good!';
          messageContainer.appendChild(successDiv);
          
          // Auto-remove success message after 3 seconds
          setTimeout(() => {
            if (successDiv.parentNode) {
              successDiv.remove();
            }
          }, 1500);
        }
      }, 500); // Debounce validation
    });
    
    // Clear validation on focus
    messageInput.addEventListener('focus', function() {
      const existingError = this.parentElement.querySelector('.validation-error');
      const existingSuccess = this.parentElement.querySelector('.validation-success');
      if (existingError) existingError.remove();
      if (existingSuccess) existingSuccess.remove();
      this.classList.remove('border-red-500', 'border-green-500');
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Show loading state
      submitBtn.disabled = true;
      submitText.classList.add('hidden');
      submitLoading.classList.remove('hidden');
      
      // Get form data
      const formData = new FormData(contactForm);
      
      // Validate message before submission
      const message = formData.get('message');
      const validation = detectGibberish(message);
      
      if (!validation.isValid) {
        showMessage(`Please fix the following issues:<br>${validation.errors.join('<br>')}`, 'error');
        // Reset button state
        submitBtn.disabled = false;
        submitText.classList.remove('hidden');
        submitLoading.classList.add('hidden');
        return;
      }
      const data = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message')
      };

      try {
        // Option 1: Using Formspree (you need to create your own endpoint)
        // Replace 'YOUR_FORMSPREE_ENDPOINT' with your actual Formspree endpoint
        const response = await fetch('https://formspree.io/f/mjkrlgar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          showMessage('Thank you! Your message has been sent successfully. I\'ll get back to you soon!', 'success');
          contactForm.reset();
        } else {
          throw new Error('Failed to send message');
        }
      } catch (error) {
        console.error('Error:', error);
        
        // Fallback: Send email directly (this will open user's email client)
        const emailSubject = encodeURIComponent(`Portfolio Contact: ${data.subject}`);
        const emailBody = encodeURIComponent(`
Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Subject: ${data.subject}

Message:
${data.message}
        `);
        
        const mailtoLink = `mailto:shayanabrar7@gmail.com?subject=${emailSubject}&body=${emailBody}`;
        
        showMessage(`Form submission failed. <a href="${mailtoLink}" class="underline">Click here to send email directly</a> or try again later.`, 'error');
      } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitText.classList.remove('hidden');
        submitLoading.classList.add('hidden');
      }
    });
  }

  function showMessage(text, type) {
    messageText.innerHTML = text;
    formMessage.className = `mt-4 p-4 rounded-lg ${type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`;
    formMessage.classList.remove('hidden');
    
    // Auto-hide message after 8 seconds
    setTimeout(() => {
      formMessage.classList.add('hidden');
    }, 8000);
  }
});
  
// Performance Optimizations - Lazy Loading
document.addEventListener('DOMContentLoaded', function() {
  // Lazy loading for images
  const lazyImages = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  });

  lazyImages.forEach(img => {
    imageObserver.observe(img);
  });

  // Preload critical images
  const criticalImages = [
    './assets/AbhijeetBhalePortfolio.jpg',
    './assets/cursor.png'
  ];

  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });

  // Optimize scroll performance
  let ticking = false;
  
  function updateScrollIndicator() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;

    const progressBar = document.getElementById("scroll-indicator");
    if (progressBar) {
      progressBar.style.height = `${scrollPercent}%`;
    }
    
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(updateScrollIndicator);
      ticking = true;
    }
  });

  // Service Worker registration for PWA features
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
});
  
// GitHub API Integration
document.addEventListener('DOMContentLoaded', function() {
  const username = 'SHAYAN-ABRAR';
  
  // GitHub API endpoints
  const endpoints = {
    user: `https://api.github.com/users/${username}`,
    repos: `https://api.github.com/users/${username}/repos`,
    activity: `https://api.github.com/users/${username}/events`
  };

  // Fetch GitHub user data
  async function fetchGitHubData() {
    // The contribution graph comes from its own API, so let it load independently
    loadContributionGraph();
    try {
      const [userResponse, reposResponse] = await Promise.all([
        fetch(endpoints.user),
        fetch(endpoints.repos)
      ]);

      if (userResponse.ok && reposResponse.ok) {
        const userData = await userResponse.json();
        const reposData = await reposResponse.json();

        // Update stats
        document.getElementById('githubRepos').textContent = userData.public_repos;
        document.getElementById('githubFollowers').textContent = userData.followers;

        // Calculate total stars
        const totalStars = reposData.reduce((sum, repo) => sum + repo.stargazers_count, 0);
        document.getElementById('githubStars').textContent = totalStars;

        // Load activity feed (also derives the 30-day commit count)
        loadGitHubActivity();

        // Load language stats
        loadGitHubLanguages(reposData);
      } else {
        // Non-OK responses (e.g. GitHub's 60/hr unauthenticated rate limit) don't throw,
        // so surface them as an error to hit the graceful fallback below.
        throw new Error('GitHub API responded ' + userResponse.status + '/' + reposResponse.status);
      }
    } catch (error) {
      console.error('Error fetching GitHub data:', error);
      // Show fallback data
      document.getElementById('githubRepos').textContent = '15+';
      document.getElementById('githubStars').textContent = '25+';
      document.getElementById('githubFollowers').textContent = '10+';
      // (the 30-day contributions stat is owned by loadContributionGraph)
      // Stop the activity feed from spinning forever
      renderActivityFallback();
    }
  }

  // On-brand call-to-action shown when the live feed can't be fetched
  // (e.g. GitHub's unauthenticated rate limit). Reads as intentional, not an error.
  function renderActivityFallback() {
    const container = document.getElementById('githubActivity');
    if (!container) return;
    container.innerHTML = `
      <div class="gh-cta flex flex-col items-center justify-center text-center py-10 px-4">
        <div class="gh-cta-icon">
          <i class="fab fa-github"></i>
        </div>
        <h4 class="text-lg md:text-xl font-semibold text-white mt-5 mb-2">Catch my latest work on GitHub</h4>
        <p class="text-gray-400 text-sm max-w-sm mb-6">I'm always pushing new commits, repositories, and experiments — take a look at what I'm building.</p>
        <div class="flex flex-wrap items-center justify-center gap-3">
          <a href="https://github.com/${username}" target="_blank" rel="noopener" class="gh-cta-btn">
            <i class="fab fa-github"></i> View GitHub Profile
          </a>
          <a href="https://github.com/${username}?tab=repositories" target="_blank" rel="noopener" class="gh-cta-btn gh-cta-btn--ghost">
            Browse Repositories <i class="fas fa-arrow-right"></i>
          </a>
        </div>
      </div>`;
  }

  // "2 hours ago" style relative timestamps
  function timeAgo(dateString) {
    const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
    const steps = [
      [31536000, 'year'], [2592000, 'month'], [604800, 'week'],
      [86400, 'day'], [3600, 'hour'], [60, 'minute']
    ];
    for (const [span, label] of steps) {
      const n = Math.floor(seconds / span);
      if (n >= 1) return `${n} ${label}${n > 1 ? 's' : ''} ago`;
    }
    return 'just now';
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Load GitHub activity
  async function loadGitHubActivity() {
    const activityContainer = document.getElementById('githubActivity');
    try {
      const response = await fetch(endpoints.activity);
      if (!response.ok) throw new Error('Activity request failed: ' + response.status);

      const activityData = await response.json();

      // Rate-limit responses come back as an object, not an array
      if (!Array.isArray(activityData) || activityData.length === 0) {
        renderActivityFallback();
        return;
      }

      // Collapse consecutive pushes to the same repo into a single entry
      const grouped = [];
      activityData.forEach(ev => {
        const last = grouped[grouped.length - 1];
        if (last && ev.type === 'PushEvent' && last.type === 'PushEvent' &&
            last.repo?.name === ev.repo?.name) {
          last._pushCount = (last._pushCount || 1) + 1;
          return;
        }
        grouped.push(ev);
      });

      // Clear loading state and render recent events
      activityContainer.innerHTML = '';
      grouped.slice(0, 6).forEach(event => {
        activityContainer.appendChild(createActivityItem(event));
      });
    } catch (error) {
      console.error('Error loading GitHub activity:', error);
      renderActivityFallback();
    }
  }

  // Create one timeline entry for the activity feed
  function createActivityItem(event) {
    const item = document.createElement('div');
    item.className = 'gh-event';

    const repoName = event.repo?.name || 'Unknown Repository';
    const shortRepo = repoName.replace(`${username}/`, '');
    const repoLink = `<a href="https://github.com/${repoName}" target="_blank" rel="noopener" class="gh-event__repo">${escapeHtml(shortRepo)}</a>`;

    const styles = {
      teal:   { color: '#1DCD9F', bg: 'rgba(29, 205, 159, 0.12)', border: 'rgba(29, 205, 159, 0.35)' },
      blue:   { color: '#58a6ff', bg: 'rgba(88, 166, 255, 0.12)', border: 'rgba(88, 166, 255, 0.35)' },
      purple: { color: '#bc8cff', bg: 'rgba(188, 140, 255, 0.12)', border: 'rgba(188, 140, 255, 0.35)' },
      gold:   { color: '#f5c842', bg: 'rgba(245, 200, 66, 0.12)', border: 'rgba(245, 200, 66, 0.35)' },
      orange: { color: '#f78166', bg: 'rgba(247, 129, 102, 0.12)', border: 'rgba(247, 129, 102, 0.35)' },
      gray:   { color: '#9ca3af', bg: 'rgba(156, 163, 175, 0.10)', border: 'rgba(156, 163, 175, 0.30)' }
    };

    let icon, text, style = styles.teal, detail = '';

    switch (event.type) {
      case 'PushEvent': {
        icon = 'fas fa-code-commit';
        // The public events API strips commit lists, so lead with push count / branch instead
        const times = event._pushCount || 1;
        const branch = (event.payload?.ref || '').replace('refs/heads/', '');
        if (times > 1) {
          text = `Pushed ${times} times to ${repoLink}`;
        } else if (branch) {
          text = `Pushed to <code>${escapeHtml(branch)}</code> in ${repoLink}`;
        } else {
          text = `Pushed to ${repoLink}`;
        }
        break;
      }
      case 'CreateEvent': {
        const refType = event.payload?.ref_type || 'repository';
        icon = 'fas fa-plus';
        style = styles.blue;
        text = refType === 'repository'
          ? `Created a new repository ${repoLink}`
          : `Created ${refType} <code>${escapeHtml(event.payload?.ref || '')}</code> in ${repoLink}`;
        break;
      }
      case 'PullRequestEvent': {
        const action = event.payload?.pull_request?.merged ? 'Merged' : (event.payload?.action === 'closed' ? 'Closed' : 'Opened');
        icon = 'fas fa-code-pull-request';
        style = action === 'Merged' ? styles.purple : styles.blue;
        text = `${action} a pull request in ${repoLink}`;
        break;
      }
      case 'IssuesEvent':
        icon = 'fas fa-circle-dot';
        style = styles.orange;
        text = `${(event.payload?.action || 'updated').replace(/^./, c => c.toUpperCase())} an issue in ${repoLink}`;
        break;
      case 'ForkEvent':
        icon = 'fas fa-code-branch';
        style = styles.purple;
        text = `Forked ${repoLink}`;
        break;
      case 'WatchEvent':
        icon = 'fas fa-star';
        style = styles.gold;
        text = `Starred ${repoLink}`;
        break;
      case 'ReleaseEvent':
        icon = 'fas fa-tag';
        style = styles.gold;
        text = `Published a release in ${repoLink}`;
        break;
      case 'PublicEvent':
        icon = 'fas fa-unlock';
        style = styles.blue;
        text = `Open-sourced ${repoLink}`;
        break;
      default:
        icon = 'fas fa-circle-nodes';
        style = styles.gray;
        text = `Activity in ${repoLink}`;
    }

    item.innerHTML = `
      <div class="gh-event__icon" style="color:${style.color};background:${style.bg};border-color:${style.border}">
        <i class="${icon}"></i>
      </div>
      <div class="gh-event__body">
        <p class="gh-event__text">${text}</p>
        ${detail}
        <time class="gh-event__time" datetime="${event.created_at}">${timeAgo(event.created_at)}</time>
      </div>
    `;

    return item;
  }

  // Load GitHub languages as a stacked distribution bar + legend
  function loadGitHubLanguages(reposData) {
    // Official GitHub linguist colors for the languages I actually use
    const languageColors = {
      'Python': '#3572A5', 'JavaScript': '#f1e05a', 'TypeScript': '#3178c6',
      'HTML': '#e34c26', 'CSS': '#563d7c', 'Jupyter Notebook': '#DA5B0B',
      'C++': '#f34b7d', 'C': '#555555', 'Java': '#b07219', 'PHP': '#4F5D95',
      'Shell': '#89e051', 'Kotlin': '#A97BFF', 'Dart': '#00B4AB', 'Go': '#00ADD8',
      'Assembly': '#6E4C13', 'C#': '#178600', 'Vue': '#41b883', 'SCSS': '#c6538c'
    };

    const languageStats = {};
    reposData.forEach(repo => {
      if (repo.language) {
        languageStats[repo.language] = (languageStats[repo.language] || 0) + 1;
      }
    });

    const sortedLanguages = Object.entries(languageStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6);
    const total = sortedLanguages.reduce((sum, [, count]) => sum + count, 0);
    if (!total) return;

    const languagesContainer = document.getElementById('githubLanguages');

    const bar = sortedLanguages.map(([language, count]) => {
      const color = languageColors[language] || '#1DCD9F';
      const pct = (count / total) * 100;
      return `<span class="gh-langbar__seg" style="width:${pct.toFixed(1)}%;background:${color}" title="${escapeHtml(language)} — ${pct.toFixed(1)}%"></span>`;
    }).join('');

    const legend = sortedLanguages.map(([language, count]) => {
      const color = languageColors[language] || '#1DCD9F';
      const pct = ((count / total) * 100).toFixed(1);
      return `
        <li class="gh-langlist__item">
          <span class="gh-langlist__dot" style="background:${color};box-shadow:0 0 8px ${color}66"></span>
          <span class="gh-langlist__name">${escapeHtml(language)}</span>
          <span class="gh-langlist__pct">${pct}%</span>
          <span class="gh-langlist__count">${count} ${count === 1 ? 'repo' : 'repos'}</span>
        </li>`;
    }).join('');

    languagesContainer.innerHTML = `
      <div class="gh-langbar" role="img" aria-label="Language distribution across my repositories">${bar}</div>
      <ul class="gh-langlist">${legend}</ul>
    `;
  }

  // Render the last year of contributions as a GitHub-style heatmap
  async function loadContributionGraph() {
    const card = document.getElementById('githubHeatmapCard');
    const grid = document.getElementById('githubHeatmap');
    const totalEl = document.getElementById('githubContribTotal');
    if (!card || !grid) return;

    try {
      const response = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`);
      if (!response.ok) throw new Error('Contributions request failed: ' + response.status);
      const data = await response.json();
      const days = data.contributions;
      if (!Array.isArray(days) || days.length === 0) throw new Error('No contribution data');

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const firstDow = new Date(days[0].date + 'T00:00:00').getDay();
      const frag = document.createDocumentFragment();
      let lastLabelCol = -3;

      days.forEach((day, i) => {
        const date = new Date(day.date + 'T00:00:00');
        const col = Math.floor((i + firstDow) / 7) + 1;

        // Month label above the first week of each month (skip cramped repeats)
        if (date.getDate() === 1 && col - lastLabelCol >= 3) {
          const label = document.createElement('span');
          label.className = 'gh-month';
          label.textContent = months[date.getMonth()];
          label.style.gridColumn = col;
          frag.appendChild(label);
          lastLabelCol = col;
        }

        const cell = document.createElement('span');
        cell.className = 'gh-cell';
        cell.dataset.level = day.level;
        cell.style.gridColumn = col;
        cell.style.gridRow = date.getDay() + 2;
        const pretty = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        cell.title = `${day.count === 1 ? '1 contribution' : day.count + ' contributions'} on ${pretty}`;
        frag.appendChild(cell);
      });

      grid.innerHTML = '';
      grid.appendChild(frag);

      const totalCount = data.total?.lastYear ?? days.reduce((sum, d) => sum + d.count, 0);
      if (totalEl) totalEl.textContent = `${totalCount.toLocaleString()} contributions in the last year`;

      // This data also powers the "last 30 days" stat card
      const thirtyDaysAgo = Date.now() - 30 * 86400000;
      const recent = days.reduce((sum, d) =>
        new Date(d.date + 'T00:00:00') >= thirtyDaysAgo ? sum + d.count : sum, 0);
      document.getElementById('githubCommits').textContent = String(recent);

      // Show the most recent weeks first on small screens
      const scroller = grid.closest('.gh-heatmap-scroll');
      if (scroller) scroller.scrollLeft = scroller.scrollWidth;
    } catch (error) {
      console.error('Error loading contribution graph:', error);
      card.style.display = 'none';
      document.getElementById('githubCommits').textContent = '50+';
    }
  }

  // Initialize GitHub data loading
  fetchGitHubData();
});
  
// Back to Top Button Functionality
const backToTopButton = document.getElementById('backToTop');

// Show/hide button based on scroll position
window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    backToTopButton.classList.add('show');
  } else {
    backToTopButton.classList.remove('show');
  }
});

// Scroll to top when button is clicked
backToTopButton.addEventListener('click', () => {
  if (window.lenis) { window.lenis.scrollTo(0); return; }
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const scrollBar = document.getElementById('scroll-bar');
  if (scrollBar) {
    scrollBar.addEventListener('click', function(e) {
      const rect = scrollBar.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const percent = clickY / rect.height;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const targetScroll = percent * docHeight;
      if (window.lenis) { window.lenis.scrollTo(targetScroll); }
      else window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    });
  }
});

// Cursor spotlight glow on cards (inspired by dalelarroder.com).
// Tracks the pointer over glass cards and feeds its position to the
// --mx / --my CSS variables that drive each card's ::after glow.
(function () {
  const SELECTOR = '.project-card, .upcoming-card, .journey-card, .github-stat-card';
  let pendingEvent = null;
  let rafQueued = false;

  function paintSpotlight() {
    rafQueued = false;
    const e = pendingEvent;
    if (!e || !e.target || typeof e.target.closest !== 'function') return;
    const card = e.target.closest(SELECTOR);
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    card.style.setProperty('--my', `${e.clientY - rect.top}px`);
  }

  document.addEventListener('pointermove', function (e) {
    pendingEvent = e;
    if (!rafQueued) {
      rafQueued = true;
      requestAnimationFrame(paintSpotlight);
    }
  }, { passive: true });
})();

