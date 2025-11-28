/* index.js — Homepage Cinematic Interactions */

document.addEventListener("DOMContentLoaded", () => {
    // Safety check
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn("GSAP or ScrollTrigger not loaded.");
        // Fallback: If GSAP fails, show content
        document.querySelectorAll('.polaroid').forEach(el => {
            el.style.opacity = 1;
            el.style.transform = 'none';
        });
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // 1. HERO ANIMATIONS
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
    heroTl.to("#heroTitle", { opacity: 1, y: -20, duration: 1.5, delay: 0.5 })
          .to("#heroSub", { opacity: 1, y: -10, duration: 1 }, "-=1")
          .to("#enterBtn", { opacity: 1, scale: 1, duration: 0.8 }, "-=0.5");

    // Parallax Mouse Effect
    document.addEventListener("mousemove", (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 15;
        const y = (e.clientY / window.innerHeight - 0.5) * 15;
        gsap.to("#heroBg", { x: x, y: y, duration: 1.2, ease: "power2.out" });
    });

    // 2. HORIZONTAL SCROLL
    const track = document.getElementById("partyTrack");
    function initHorizontalScroll() {
        if(!track) return;
        let scrollAmount = track.scrollWidth - window.innerWidth + 200;
        gsap.to(track, {
            x: -scrollAmount,
            ease: "none",
            scrollTrigger: {
                trigger: ".h-scroll-section",
                pin: true,
                scrub: 1.5,
                end: "+=" + scrollAmount,
                invalidateOnRefresh: true
            }
        });
    }
    window.addEventListener("load", initHorizontalScroll);
    window.addEventListener("resize", () => ScrollTrigger.refresh());

    // 3. THREAT PARALLAX
    if(document.getElementById("threatText")) {
        gsap.to("#threatText", {
            y: -150,
            opacity: 1,
            scrollTrigger: {
                trigger: ".threat-section",
                start: "top bottom",
                end: "bottom top",
                scrub: 1
            }
        });
    }

    // 4. POLAROID REVEAL (FIXED)
    // We animate TO opacity 1 and TO their specific rotation
    const polaroids = document.querySelectorAll('.polaroid');
    
    polaroids.forEach((card, i) => {
        // Read the CSS variable --r to know where to land
        const rotation = card.style.getPropertyValue('--r') || '0deg';
        
        gsap.to(card, {
            opacity: 1,
            y: 0,
            rotation: rotation, // Animate to its resting rotation
            duration: 1.2,
            ease: "power3.out",
            delay: i * 0.1, // Stagger manually
            scrollTrigger: {
                trigger: ".polaroid-grid",
                start: "top 85%", 
                toggleActions: "play none none reverse"
            }
        });
    });

    // 5. BUTTON SCROLL
    const enterBtn = document.getElementById('enterBtn');
    if(enterBtn) {
        enterBtn.addEventListener('click', () => {
            gsap.to('.hero-portal', { scale: 1.2, opacity: 0, duration: 0.8, ease: "power2.in", onComplete: () => {
                const partySection = document.getElementById('partySection');
                if(partySection) partySection.scrollIntoView({ behavior: 'smooth' });
                gsap.set('.hero-portal', { scale: 1, opacity: 1, delay: 1 });
            }});
        });
    }
});