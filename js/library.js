/* library.js — Hawkins Lab Archive Interactions */

document.addEventListener("DOMContentLoaded", () => {
    
    // Optional: GSAP Entrance Animation for the files
    if (typeof gsap !== 'undefined') {
        gsap.from(".case-file", {
            y: 30,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
            delay: 0.2
        });

        gsap.from(".folder-tab", {
            x: -20,
            opacity: 0,
            duration: 0.5,
            stagger: 0.2,
            delay: 0.1
        });
    }

    // Since we are using standard links (onclick="location.href..."), 
    // we don't need complex JS event listeners. 
    // The CSS handles all hover states robustly.
    
    console.log("Archive Access Granted: Level 5");
});