/* player.js — Touch-gesture enhanced Netflix-style player */

(() => {

    /* -----------------------------------------------------
       ELEMENTS
    ----------------------------------------------------- */
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

    const progressContainer = document.getElementById("progressContainer");
    const progressFill = document.getElementById("progressFill");
    const progressBuffer = document.getElementById("progressBuffer");
    const progressHover = document.getElementById("progressHover");

    const currentTimeEl = document.getElementById("currentTime");
    const episodeTitleEl = document.getElementById("episodeTitle");
    const episodeMetaEl = document.getElementById("episodeMeta");

    /* NEW Gesture zones */
    const gLeft = document.getElementById("gesture-left");
    const gRight = document.getElementById("gesture-right");
    const gCenter = document.getElementById("gesture-center");
    const gestureFeedback = document.getElementById("gestureFeedback");

    if (!video || !source) return;


    /* -----------------------------------------------------
       META + EPISODE NAME
    ----------------------------------------------------- */
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

    const params = new URLSearchParams(window.location.search);
    let rawSrc = params.get("src");

    if (rawSrc) {
        try { rawSrc = decodeURIComponent(rawSrc); } catch { }
        if (rawSrc.endsWith(".mkv")) rawSrc = rawSrc.replace(".mkv", ".mp4");

        source.src = rawSrc;
        source.type = "video/mp4";

        video.load();
        video.addEventListener("loadedmetadata", () => {
            currentTimeEl.textContent = "0:00 / " + formatTime(video.duration);
            safePlay();
        });
    }

    const epMatch = rawSrc ? rawSrc.match(/ep(\d+)/i) : null;
    const episodeNum = epMatch ? parseInt(epMatch[1], 10) : 1;

    episodeTitleEl.textContent = `Episode ${episodeNum} — ${episodeNames[episodeNum] || ""}`;
    episodeMetaEl.textContent = "Now Playing";


    /* -----------------------------------------------------
       BASIC CONTROLS
    ----------------------------------------------------- */
    function formatTime(sec) {
        if (!isFinite(sec)) return "0:00";
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    }

    function safePlay() {
        video.play().catch(() => { });
    }

    function updatePlayIcon() {
        playPauseBtn.textContent = video.paused ? "▶" : "⏸";
    }

    playPauseBtn.onclick = () => {
        video.paused ? video.play() : video.pause();
        updatePlayIcon();
    };

    video.addEventListener("play", updatePlayIcon);
    video.addEventListener("pause", updatePlayIcon);


    /* BACK BUTTON */
    const goBack = () => location.href = "library.html";
    backButton.onclick = goBack;
    backButtonTop.onclick = goBack;


    /* VOLUME */
    volumeSlider.oninput = e => {
        const v = +e.target.value;
        video.volume = v;
        video.muted = v === 0;
        muteBtn.textContent = video.muted ? "🔇" : "🔊";
    };

    muteBtn.onclick = () => {
        video.muted = !video.muted;
        muteBtn.textContent = video.muted ? "🔇" : "🔊";
    };


    /* SPEED */
    const rates = [1, 1.25, 1.5, 2];
    let rIndex = 0;

    speedBtn.onclick = () => {
        rIndex = (rIndex + 1) % rates.length;
        video.playbackRate = rates[rIndex];
        speedBtn.textContent = rates[rIndex] + "x";
    };


    /* FULLSCREEN */
    fullscreenBtn.onclick = async () => {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen();
        else document.exitFullscreen();
    };


    /* NEXT EPISODE */
    nextEpBtn.onclick = () => {
        const next = episodeNum + 1;
        if (next <= 8) {
            const newSrc = rawSrc.replace(/ep(\d+)/i, `ep${next}`);
            location.href = `player.html?src=${encodeURIComponent(newSrc)}`;
        }
    };


    /* -----------------------------------------------------
       PROGRESS BAR
    ----------------------------------------------------- */
    video.addEventListener("timeupdate", () => {
        if (!video.duration) return;

        const pct = (video.currentTime / video.duration) * 100;
        progressFill.style.width = pct + "%";
        currentTimeEl.textContent =
            formatTime(video.currentTime) + " / " + formatTime(video.duration);
    });

    video.addEventListener("progress", () => {
        try {
            if (video.buffered.length) {
                const b = video.buffered.end(video.buffered.length - 1);
                progressBuffer.style.width = (b / video.duration) * 100 + "%";
            }
        } catch { }
    });

    progressContainer.onclick = e => {
        const rect = progressContainer.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        video.currentTime = pct * video.duration;
    };

    progressContainer.onmousemove = e => {
        const rect = progressContainer.getBoundingClientRect();
        let x = e.clientX - rect.left;
        x = Math.max(0, Math.min(rect.width, x));
        const pct = x / rect.width;
        progressHover.textContent = formatTime(pct * video.duration);
        progressHover.style.left = x + "px";
        progressHover.style.opacity = 1;
    };

    progressContainer.onmouseleave = () =>
        progressHover.style.opacity = 0;


    /* -----------------------------------------------------
       UI AUTO-HIDE  (header + back arrow + controls)
    ----------------------------------------------------- */
    let hideTimer = null;

    function showUI() {
        document.body.classList.remove("hide-ui");
        controls.classList.add("show");
    }

    function hideUI() {
        if (!video.paused) {
            document.body.classList.add("hide-ui");
            controls.classList.remove("show");
        }
    }

    function resetHideTimer() {
        showUI();
        clearTimeout(hideTimer);
        hideTimer = setTimeout(hideUI, 2500);
    }

    document.addEventListener("mousemove", resetHideTimer);
    document.addEventListener("keydown", resetHideTimer);


    /* -----------------------------------------------------
       TOUCH GESTURES (NEW FEATURE)
    ----------------------------------------------------- */
    let lastTapLeft = 0;
    let lastTapRight = 0;

    /* Double-tap left = rewind */
    gLeft.addEventListener("touchend", () => {
        const now = Date.now();
        if (now - lastTapLeft < 300) {
            video.currentTime = Math.max(0, video.currentTime - 15);
            showGesture("+15", true);
        }
        lastTapLeft = now;
        resetHideTimer();
    });

    /* Double-tap right = forward */
    gRight.addEventListener("touchend", () => {
        const now = Date.now();
        if (now - lastTapRight < 300) {
            video.currentTime = Math.min(video.duration, video.currentTime + 15);
            showGesture("+15");
        }
        lastTapRight = now;
        resetHideTimer();
    });


    /* Single tap center = toggle UI */
    gCenter.addEventListener("touchend", () => {
        if (document.body.classList.contains("hide-ui")) showUI();
        else hideUI();
    });


    /* Volume swipe (vertical) inside right zone */
    let startY = 0;
    let startVol = 0;

    gRight.addEventListener("touchstart", e => {
        const t = e.touches[0];
        startY = t.clientY;
        startVol = video.volume;
    });

    gRight.addEventListener("touchmove", e => {
        const t = e.touches[0];
        const dy = startY - t.clientY;  // up = +volume

        const newVol = Math.max(0, Math.min(1, startVol + dy / 300));
        video.volume = newVol;
        video.muted = newVol === 0;
        volumeSlider.value = newVol;

        showVolume(Math.round(newVol * 100));
    });


    /* -----------------------------------------------------
       GESTURE FEEDBACK (TEMP HUD)
    ----------------------------------------------------- */

    let feedbackTimeout = null;

    function showVolume(percent) {
        gestureFeedback.textContent = percent + "%";
        gestureFeedback.style.opacity = 1;

        clearTimeout(feedbackTimeout);
        feedbackTimeout = setTimeout(() => {
            gestureFeedback.style.opacity = 0;
        }, 600);
    }

    function showGesture(txt, isBack = false) {
        gestureFeedback.textContent = isBack ? "⟲ 15s" : "15s ⟳";
        gestureFeedback.style.opacity = 1;

        clearTimeout(feedbackTimeout);
        feedbackTimeout = setTimeout(() => {
            gestureFeedback.style.opacity = 0;
        }, 600);
    }


    /* -----------------------------------------------------
       Keyboard Shortcuts
    ----------------------------------------------------- */
    document.addEventListener("keydown", e => {
        if (e.code === "Space") {
            e.preventDefault();
            video.paused ? video.play() : video.pause();
        }
        if (e.code === "ArrowRight") video.currentTime += 10;
        if (e.code === "ArrowLeft") video.currentTime -= 10;
    });


    /* -----------------------------------------------------
       INITIAL
    ----------------------------------------------------- */
    resetHideTimer();
    safePlay();

})();
