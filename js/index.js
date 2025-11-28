/* index.js — Homepage Cinematic Interactions */

document.addEventListener("DOMContentLoaded", () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn("GSAP or ScrollTrigger not loaded.");
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // 1. Hero Animations
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
    heroTl.to("#heroTitle", { opacity: 1, y: -20, duration: 1.5, delay: 0.5 })
          .to("#heroSub", { opacity: 1, y: -10, duration: 1 }, "-=1")
          .to("#enterBtn", { opacity: 1, scale: 1, duration: 0.8 }, "-=0.5");

    // Parallax Hero Mouse Movement
    document.addEventListener("mousemove", (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        gsap.to("#heroBg", { x: x, y: y, duration: 1, ease: "power2.out" });
    });

    // 2. Horizontal Scroll Section
    const track = document.getElementById("partyTrack");
    
    // Calculate the distance to scroll (width of track - viewport width)
    function initHorizontalScroll() {
        if(!track) return;
        
        let scrollAmount = track.scrollWidth - window.innerWidth + 200; // +200 for padding

        gsap.to(track, {
            x: -scrollAmount,
            ease: "none",
            scrollTrigger: {
                trigger: ".h-scroll-section",
                pin: true,
                scrub: 1,
                end: "+=" + scrollAmount // Scroll distance matches horizontal length
            }
        });
    }
    
    // Wait for images to load before measuring width
    window.addEventListener("load", initHorizontalScroll);


    // 3. Parallax Text for Threat Section
    if(document.getElementById("threatText")) {
        gsap.to("#threatText", {
            y: -100,
            opacity: 1,
            scrollTrigger: {
                trigger: ".threat-section",
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
    }

    // 4. Fade Up for Polaroids (Targets .polaroid specifically now)
    gsap.utils.toArray('.polaroid').forEach(el => {
        gsap.from(el, {
            opacity: 0,
            y: 50,
            duration: 1,
            scrollTrigger: {
                trigger: el,
                start: "top 85%",
            }
        });
    });

    // Button Scroll
    const enterBtn = document.getElementById('enterBtn');
    if(enterBtn) {
        enterBtn.addEventListener('click', () => {
            // Zoom effect before scroll
            gsap.to('.hero-portal', { scale: 1.5, opacity: 0, duration: 1, onComplete: () => {
                const partySection = document.getElementById('partySection');
                if(partySection) partySection.scrollIntoView({ behavior: 'smooth' });
                
                // Reset hero for when they scroll back up
                gsap.to('.hero-portal', { scale: 1, opacity: 1, delay: 1 });
            }});
        });
    }
});