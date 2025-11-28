/* player.js — Robust Netflix-like player with diagnostics */

(() => {
    // DOM references
    const video = document.getElementById("videoPlayer");
    const source = document.getElementById("videoSource");

    const controls = document.getElementById("controls");
    const playPauseBtn = document.getElementById("playPause");
    const backButton = document.getElementById("backButton");
    const backButtonTop = document.getElementById("backButtonTop");
    const muteBtn = document.getElementById("muteBtn");
    const volumeSlider = document.getElementById("volumeSlider");
    const speedBtn = document.getElementById("speedBtn");
    const fullscreenBtn = document.getElementById("fullscreenBtn");
    const nextEpBtn = document.getElementById("nextEpBtn");

    const progressContainer = document.getElementById("progressContainer") || document.querySelector(".progress-container");
    const progressFill = document.getElementById("progressFill") || document.querySelector(".progress-fill");
    const progressBuffer = document.getElementById("progressBuffer") || document.querySelector(".progress-buffer");
    const progressHover = document.getElementById("progressHover") || document.querySelector(".progress-hover");

    const episodeTitleEl = document.getElementById("episodeTitle");
    const episodeMetaEl = document.getElementById("episodeMeta");
    const currentTimeEl = document.getElementById("currentTime");

    if (!video || !source) {
        console.error("Fatal: video or source element not found.");
        return;
    }

    // Episode names
    const episodeNames = {
        1: "The Crawl",
        2: "The Vanishing of Holly Wheeler",
        3: "The Turnbow Trap",
        4: "Sorcerer",
        5: "Shock Jock",
        6: "Escape from Camazotz",
        7: "The Bridge",
        8: "The Rightside Up"
    };

    let hideTimer = null;
    let playbackRates = [1, 1.25, 1.5, 2];
    let rateIndex = 0;

    // ---------- Helper utilities ----------
    function log(...args) { console.log("[player]", ...args); }
    function warn(...args) { console.warn("[player]", ...args); }
    function _alertUser(msg) {
        console.warn("[player user alert]", msg);
        try { window.alert(msg); } catch (e) { }
    }

    function extFromPath(path) {
        const m = path.match(/\.([a-z0-9]+)(?:\?|$)/i);
        return m ? m[1].toLowerCase() : "";
    }

    function mimeForExt(ext) {
        if (!ext) return "video/mp4";  // DEFAULT FIX
        if (ext === "mp4" || ext === "m4v") return "video/mp4";
        if (ext === "webm") return "video/webm";
        if (ext === "ogg" || ext === "ogv") return "video/ogg";

        // ❌ MKV IS NOT SUPPORTED — force fallback
        if (ext === "mkv") return "video/mp4";

        return "video/mp4";
    }

    function safePlay() {
        video.play().catch(err => {
            warn("Autoplay blocked or playback error:", err);
        });
    }

    function formatTime(sec) {
        if (!isFinite(sec) || isNaN(sec)) return "0:00";
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    }

    // ---------- Load src from URL ----------
    const params = new URLSearchParams(window.location.search);
    let rawSrc = params.get("src");

    if (!rawSrc) {
        _alertUser("No video source provided. Example: player.html?src=assets/videos/ep1.mp4");
        log("No src query param present.");
    } else {
        // decode safely
        try { rawSrc = decodeURIComponent(rawSrc); } catch (e) { }

        // ⭐ FIX: Convert MKV → MP4 automatically
        if (rawSrc.endsWith(".mkv")) {
            rawSrc = rawSrc.replace(".mkv", ".mp4");
            log("Auto-converted MKV → MP4:", rawSrc);
        }

        log("Attempting to load src:", rawSrc);

        // set corrected src
        source.src = rawSrc;

        // FIX MIME
        const ext = extFromPath(rawSrc);
        source.type = mimeForExt(ext);

        source.onerror = (ev) => {
            warn("Source error:", ev);
            _alertUser("Could not load video. Most likely unsupported MKV. Convert to MP4.");
        };

        video.onerror = (ev) => {
            warn("Video element error:", video.error);
        };

        video.load();

        video.addEventListener("loadedmetadata", () => {
            log("loadedmetadata — duration:", video.duration);
            currentTimeEl.textContent = formatTime(0) + " / " + formatTime(video.duration || 0);
            safePlay();
        });

        video.addEventListener("canplay", () => {
            log("canplay — ready");
            updatePlayIcon();
        });
    }

    // ---------- Episode title ----------
    const epMatch = rawSrc ? rawSrc.match(/ep(\d+)\.(mp4|webm|ogv|m4v)/i) : null;
    const episodeNum = epMatch ? parseInt(epMatch[1], 10) : 1;
    episodeTitleEl.textContent = `Episode ${episodeNum} — ${episodeNames[episodeNum] || ""}`;
    episodeMetaEl.textContent = "Now Playing";

    // ---------- Controls ----------
    function updatePlayIcon() {
        playPauseBtn.textContent = video.paused ? "▶" : "⏸";
    }

    playPauseBtn.addEventListener("click", () => {
        if (video.paused) video.play();
        else video.pause();
        updatePlayIcon();
    });

    video.addEventListener("play", updatePlayIcon);
    video.addEventListener("pause", updatePlayIcon);

    // Back buttons
    const goBack = () => (location.href = "library.html");
    backButton?.addEventListener("click", goBack);
    backButtonTop?.addEventListener("click", goBack);

    // Volume
    volumeSlider?.addEventListener("input", (ev) => {
        const v = parseFloat(ev.target.value);
        video.volume = v;
        video.muted = v === 0;
        muteBtn.textContent = video.muted ? "🔇" : "🔊";
    });

    muteBtn?.addEventListener("click", () => {
        video.muted = !video.muted;
        muteBtn.textContent = video.muted ? "🔇" : "🔊";
    });

    // Speed
    speedBtn?.addEventListener("click", () => {
        rateIndex = (rateIndex + 1) % playbackRates.length;
        video.playbackRate = playbackRates[rateIndex];
        speedBtn.textContent = video.playbackRate + "x";
    });

    // Fullscreen
    fullscreenBtn?.addEventListener("click", async () => {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
        } else {
            await document.exitFullscreen();
        }
    });

    // Next episode
    nextEpBtn?.addEventListener("click", () => {
        const next = episodeNum + 1;
        if (next <= 8) {
            const newPath = rawSrc.replace(/ep(\d+)/i, `ep${next}`);
            window.location.href = `player.html?src=${encodeURIComponent(newPath)}`;
        } else {
            _alertUser("No next episode available.");
        }
    });

    // Progress
    video.addEventListener("timeupdate", () => {
        if (!video.duration) return;
        const pct = (video.currentTime / video.duration) * 100;
        progressFill.style.width = pct + "%";
        currentTimeEl.textContent = formatTime(video.currentTime) + " / " + formatTime(video.duration);
    });

    video.addEventListener("progress", () => {
        try {
            if (video.buffered.length) {
                const bufferedEnd = video.buffered.end(video.buffered.length - 1);
                progressBuffer.style.width = (bufferedEnd / video.duration) * 100 + "%";
            }
        } catch { }
    });

    // Hover preview
    progressContainer?.addEventListener("mousemove", (e) => {
        const rect = progressContainer.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
        const pct = x / rect.width;
        const time = pct * video.duration;
        progressHover.textContent = formatTime(time);
        progressHover.style.left = x + "px";
        progressHover.style.opacity = 1;
    });

    progressContainer?.addEventListener("mouseleave", () => {
        progressHover.style.opacity = 0;
    });

    progressContainer?.addEventListener("click", (e) => {
        const rect = progressContainer.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        video.currentTime = pct * video.duration;
    });

    // Auto-hide controls
    function showControls() {
        controls.classList.add("show");
        document.body.classList.remove("hide-cursor");
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
            if (!video.paused) {
                controls.classList.remove("show");
                document.body.classList.add("hide-cursor");
            }
        }, 2500);
    }
    document.addEventListener("mousemove", showControls);

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
        if (e.code === "Space") {
            e.preventDefault();
            video.paused ? video.play() : video.pause();
            updatePlayIcon();
        }
        if (e.code === "ArrowRight") video.currentTime += 10;
        if (e.code === "ArrowLeft") video.currentTime -= 10;
        if (e.key.toLowerCase() === "f") {
            document.fullscreenElement ?
                document.exitFullscreen() :
                document.documentElement.requestFullscreen();
        }
    });

    video.play().catch(err => warn("Autoplay failed:", err));

    log("player.js initialized", { src: rawSrc, mime: source.type });

})();
