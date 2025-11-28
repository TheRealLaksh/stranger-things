// app.js — global utilities & initialization

document.addEventListener('DOMContentLoaded', () => {

    // Fade-up intersection observer
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) e.target.classList.add('in-view');
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.fade-up').forEach(el => io.observe(el));

    // Logo click → home
    const logo = document.getElementById('logo');
    if (logo) {
        logo.addEventListener('click', () => {
            location.href = 'index.html';
        });
    }

    // Play buttons in library page
    document.querySelectorAll('.play-local').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const file = e.currentTarget.dataset.file;
            if (file) {
                location.href = 'player.html?src=' + encodeURIComponent(file);
            }
        });
    });

    // Space = play/pause in player page
    document.addEventListener('keydown', (ev) => {
        if (ev.code === 'Space') {

            // ⭐ FIXED: ID now matches <video id="videoPlayer">
            const video = document.getElementById('videoPlayer');

            if (video) {
                ev.preventDefault();
                if (video.paused) video.play();
                else video.pause();
            }
        }
    });

});


/* =========================================================
   SAFE & FIXED TUBELIGHT NAV — NO CRASHES ON ANY PAGE
========================================================= */

window.addEventListener("load", () => {
    const navbar = document.querySelector(".tube-nav");
    const items = document.querySelectorAll(".tube-nav-item");
    const highlight = document.querySelector(".tube-highlight");

    // If navbar does NOT exist on this page → STOP (prevents crash)
    if (!navbar || !items.length || !highlight) return;

    function moveHighlight(el) {
        const rect = el.getBoundingClientRect();
        const navRect = navbar.getBoundingClientRect();
        highlight.style.width = `${rect.width}px`;
        highlight.style.left = `${rect.left - navRect.left}px`;
    }

    // Auto-detect active page
    function setActiveFromURL() {
        const current = window.location.pathname.split("/").pop();
        let activeFound = false;

        items.forEach(item => {
            const link = item.querySelector("a");
            if (!link) return;

            const href = link.getAttribute("href");
            if (href === current) {
                items.forEach(i => i.classList.remove("active"));
                item.classList.add("active");
                moveHighlight(item);
                activeFound = true;
            }
        });

        // Fall back to first active item if nothing matched
        if (!activeFound) {
            const active = document.querySelector(".tube-nav-item.active");
            if (active) moveHighlight(active);
        }
    }

    // Hover highlight
    items.forEach(item => {
        item.addEventListener("mouseenter", () => moveHighlight(item));
    });

    // Click sets active
    items.forEach(item => {
        item.addEventListener("click", () => {
            items.forEach(i => i.classList.remove("active"));
            item.classList.add("active");
            moveHighlight(item);
        });
    });

    // Mouse leave → return to active
    navbar.addEventListener("mouseleave", () => {
        const active = document.querySelector(".tube-nav-item.active");
        if (active) moveHighlight(active);
    });

    // Initialize highlight
    setActiveFromURL();
});
