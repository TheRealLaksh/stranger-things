// animations.js — GSAP-driven hero entrance + micro interactions

(function () {

  if (typeof gsap === 'undefined') return;

  // HERO SECTION ANIMATION
  const hero = document.querySelector('#hero');
  if (hero) {
    const tl = gsap.timeline({
      defaults: { ease: 'power3.out', duration: 0.9 }
    });

    // Heading text
    tl.from('#hero .hero-text h2', {
      y: 32,
      opacity: 0,
      stagger: 0.08
    });

    // Subtext
    tl.from('#hero .hero-text p', {
      y: 18,
      opacity: 0
    }, '-=0.6');

    // Poster card
    tl.from('#hero .poster-card', {
      scale: 0.96,
      opacity: 0
    }, '-=0.6');
  }

  // VIDEO CARD HOVER FLOAT EFFECT (GSAP-enhanced)
  document.querySelectorAll('.video-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        y: -6,
        boxShadow: '0 18px 40px rgba(0,0,0,0.6)',
        duration: 0.4
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        y: 0,
        boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
        duration: 0.4
      });
    });
  });

  // AUTO-SCROLL MARQUEE EFFECT FOR THE TRENDING ROW
  const row = document.getElementById('trendingRow');
  if (row) {
    gsap.to(row, {
      xPercent: -20,
      repeat: -1,
      ease: 'none',
      duration: 24,
      paused: true
    });

    row.addEventListener('mouseenter', () => gsap.globalTimeline.pause());
    row.addEventListener('mouseleave', () => gsap.globalTimeline.play());
  }

})();

/* =============================================
   ENTRY FADE-UP ANIMATION USING OBSERVER
   ============================================= */

const fadeUps = document.querySelectorAll(".fade-up");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  },
  { threshold: 0.2 }
);

fadeUps.forEach(el => observer.observe(el));
