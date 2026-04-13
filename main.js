// ==========================================================================
// GLOBALS & SETUP
// ==========================================================================
gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 1. Lenis Smooth Scroll
let lenis;
if (!prefersReducedMotion) {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0, 0);
}

// ==========================================================================
// PRELOADER & HERO TIMELINE
// ==========================================================================
const initPreloader = () => {
  const tl = gsap.timeline();
  
  // Minimal animation for reduced motion
  if(prefersReducedMotion) {
    gsap.set('#preloader', { display: 'none' });
    initRest();
    return;
  }

  // Splash Screen sequence
  tl.to('.preloader-text', { opacity: 1, duration: 0.5, ease: 'power2.inOut' })
    .to('.preloader-text', { opacity: 0, duration: 0.5, delay: 0.5, ease: 'power2.inOut' })
    .to('#preloader', { yPercent: -100, duration: 0.8, ease: 'power4.inOut' })
    .call(initRest) // Initialize other animations once preloader lifts
    .set('#preloader', { display: 'none' });
};

// ==========================================================================
// CUSTOM CURSOR
// ==========================================================================
const initCursor = () => {
  if (prefersReducedMotion || window.innerWidth <= 900) return;

  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  
  let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let ringPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    
    // Dot moves instantly
    gsap.set(dot, { x: mouse.x, y: mouse.y });
  });

  // Ring follows with slight lag
  gsap.ticker.add(() => {
    ringPos.x += (mouse.x - ringPos.x) * 0.15;
    ringPos.y += (mouse.y - ringPos.y) * 0.15;
    gsap.set(ring, { x: ringPos.x, y: ringPos.y });
  });

  // Hover states on links/buttons
  const interactables = document.querySelectorAll('a, button, .tilt-card');
  interactables.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
};

// ==========================================================================
// TYPEWRITER EFFECT
// ==========================================================================
const initTypewriter = () => {
  const words = ["Web Designer.", "Developer.", "Creator.", "LB Craft."];
  let i = 0;
  let timer;
  const el = document.getElementById('typewriter');
  if(!el) return;

  const typingEffect = () => {
    let word = words[i].split('');
    var loopTyping = function() {
      if (word.length > 0) {
        el.innerHTML += word.shift();
      } else {
        setTimeout(deletingEffect, 2000);
        return false;
      }
      timer = setTimeout(loopTyping, 100);
    };
    loopTyping();
  };

  const deletingEffect = () => {
    let word = words[i].split('');
    var loopDeleting = function() {
      if (word.length > 0) {
        word.pop();
        el.innerHTML = word.join('');
      } else {
        i = (i + 1) % words.length;
        setTimeout(typingEffect, 500);
        return false;
      }
      timer = setTimeout(loopDeleting, 50);
    };
    loopDeleting();
  };

  typingEffect();
};

// ==========================================================================
// MAIN INITIALIZATIONS
// ==========================================================================
const initRest = () => {
  if (prefersReducedMotion) return;

  // 1. Hero Reveal
  const heroTextWrap = new SplitType('.hero-text-wrap', { types: 'chars' });
  gsap.from(heroTextWrap.chars, {
    y: 100, opacity: 0, duration: 1, stagger: 0.05, ease: "power4.out"
  });
  
  gsap.from('.slide-up-fast', { y: 30, opacity: 0, duration: 0.8, delay: 0.5 });
  gsap.from('.slide-up-slow', { y: 30, opacity: 0, duration: 1, stagger: 0.2, delay: 0.7 });
  gsap.from('.slide-up-image', { y: 100, opacity: 0, scale: 0.9, duration: 1.5, ease: "power3.out", delay: 0.4 });

  // 2. SplitText Headings
  const splitHeadings = document.querySelectorAll('.split-heading:not(.hero-text-wrap)');
  splitHeadings.forEach(heading => {
    const split = new SplitType(heading, { types: 'chars' });
    gsap.from(split.chars, {
      scrollTrigger: { trigger: heading, start: "top 85%" },
      y: 50, opacity: 0, duration: 0.8, stagger: 0.02, ease: "back.out(1.7)"
    });
  });

  // 3. Quote Reveal (Words)
  const quote = document.querySelector('.massive-quote');
  if(quote) {
    const splitQuote = new SplitType(quote, { types: 'words' });
    gsap.from(splitQuote.words, {
      scrollTrigger: { trigger: quote, start: "top 75%" },
      opacity: 0, filter: "blur(10px)", duration: 1, stagger: 0.1
    });
  }

  // 4. Stat Counters
  const counters = document.querySelectorAll('.counter');
  counters.forEach(counter => {
    const target = +counter.getAttribute('data-target');
    ScrollTrigger.create({
      trigger: counter,
      start: "top 90%",
      once: true,
      onEnter: () => {
        gsap.to(counter, {
          innerHTML: target,
          duration: 2,
          snap: { innerHTML: 1 },
          ease: "power2.out"
        });
      }
    });
  });

  // 5. Skills Progress Bars
  const skillBars = document.querySelectorAll('.skill-bar-fill');
  skillBars.forEach(bar => {
    const width = bar.getAttribute('data-width');
    ScrollTrigger.create({
      trigger: bar,
      start: "top 90%",
      onEnter: () => { bar.style.width = width; },
      once: true
    });
  });

  // 6. Footer Border
  gsap.to('.footer-animated-border::after', {
    scrollTrigger: {
      trigger: '.footer',
      start: "top 90%",
      end: "bottom bottom",
      scrub: 1
    },
    scaleX: 1,
    ease: "none"
  });

  // 7. Navbar Scrolled
  ScrollTrigger.create({
    start: "top -50",
    end: 99999,
    toggleClass: { className: "scrolled", targets: "#navbar" }
  });

  // 8. Back To Top
  const backBtn = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    if(window.scrollY > 300) backBtn.classList.add('visible');
    else backBtn.classList.remove('visible');
  });
  
  backBtn.addEventListener('click', () => {
    if(lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Init interactive things 
  initCardTilts();
  initCanvasBg();
};

// ==========================================================================
// 3D CARD TILTS
// ==========================================================================
const initCardTilts = () => {
  if (prefersReducedMotion) return;
  
  // Portrait Card
  const portraitArea = document.getElementById('about-card-3d');
  if(portraitArea) attachTilt(portraitArea, portraitArea.querySelector('.card-3d-frame'), 10);

  // Project Cards
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach(card => {
    attachTilt(card, card, 5); // Subtle tilt for projects
  });
};

const attachTilt = (triggerArea, targetEl, intensity) => {
  triggerArea.addEventListener('mousemove', (e) => {
    const rect = triggerArea.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -intensity; 
    const rotateY = ((x - centerX) / centerX) * intensity;
    
    gsap.to(targetEl, {
      rotateX: rotateX,
      rotateY: rotateY,
      duration: 0.5,
      ease: "power2.out",
      transformPerspective: 1000
    });
  });

  triggerArea.addEventListener('mouseleave', () => {
    gsap.to(targetEl, { rotateX: 0, rotateY: 0, duration: 0.5, ease: "power2.out" });
  });
};

// ==========================================================================
// PROJECT FILTERS
// ==========================================================================
const initFilters = () => {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projects = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active classes
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projects.forEach(project => {
        // Simple GSAP fade out/in
        gsap.to(project, { scale: 0.9, opacity: 0, duration: 0.3, onComplete: () => {
          if (filterValue === 'all' || project.classList.contains(`filter-${filterValue}`)) {
            project.style.display = 'block';
            gsap.to(project, { scale: 1, opacity: 1, duration: 0.4 });
          } else {
            project.style.display = 'none';
          }
        }});
      });
    });
  });
};

// ==========================================================================
// CANVAS BACKGROUND (Dots moving away from mouse)
// ==========================================================================
const initCanvasBg = () => {
  const canvas = document.getElementById('bg-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width, height;
  let dots = [];
  const spacing = 50; 
  
  const resize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    createDots();
  };
  
  const createDots = () => {
    dots = [];
    for(let x = 0; x < width; x += spacing) {
      for(let y = 0; y < height; y += spacing) {
        dots.push({
          x: x + spacing/2, baseY: y + spacing/2,
          baseX: x + spacing/2, y: y + spacing/2,
          size: 1
        });
      }
    }
  };

  let mouse = { x: -1000, y: -1000, radius: 150 };
  
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY;
  });

  const animate = () => {
    ctx.clearRect(0, 0, width, height);
    
    for(let i = 0; i < dots.length; i++) {
      let dot = dots[i];
      let dx = mouse.x - dot.x;
      let dy = mouse.y - dot.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      
      dot.x += (dot.baseX - dot.x) * 0.05;
      dot.y += (dot.baseY - dot.y) * 0.05;

      if(distance < mouse.radius && !prefersReducedMotion) {
        let force = (mouse.radius - distance) / mouse.radius;
        dot.x -= (dx / distance) * force * 5;
        dot.y -= (dy / distance) * force * 5;
        ctx.fillStyle = `rgba(79, 142, 247, ${force * 0.5})`;
      } else {
        ctx.fillStyle = `rgba(136, 135, 128, 0.15)`;
      }
      
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(animate);
  };
  
  window.addEventListener('resize', resize);
  resize(); animate();
};

// ==========================================================================
// FORM SUBMIT SIMULATION
// ==========================================================================
const initForm = () => {
  const form = document.getElementById('contact-form');
  const btn = document.getElementById('submit-btn');

  if(form && btn) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // Only proceed if native validation passes
      if(!form.checkValidity()) return;

      // Loading state
      btn.classList.add('loading');
      
      // Simulate network request
      setTimeout(() => {
        btn.classList.remove('loading');
        btn.classList.add('success');
        btn.innerHTML = `<span class="btn-text" style="display:block;">Sent! ✓</span>`;
        gsap.from(btn, { scale: 0.9, duration: 0.4, ease: "back.out(2)" });
        form.reset();
      }, 1500);
    });
  }
};

// ==========================================================================
// BOOTSTRAP
// ==========================================================================
window.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initCursor();
  initTypewriter();
  initFilters();
  initForm();
  
  // Mobile Nav Dropdown
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if(menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isVisible = navLinks.style.display === 'flex';
      navLinks.style.display = isVisible ? 'none' : 'flex';
      if(!isVisible) {
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.right = '0';
        navLinks.style.background = 'rgba(10, 10, 15, 0.9)';
        navLinks.style.padding = '2rem';
        navLinks.style.border = '1px solid var(--border-color)';
      }
    });
  }
});
