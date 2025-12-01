/* player.js — Gesture + A1 UI + fixes: spacebar + header fade */

(() => {
    /* ---- Elements ---- */
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

    const gLeft = document.getElementById("gesture-left");
    const gCenter = document.getElementById("gesture-center");
    const gRight = document.getElementById("gesture-right");
    const gestureFeedback = document.getElementById("gestureFeedback");

    if (!video || !source) {
        console.error("player: missing video or source");
        return;
    }


    /* ---- Episode metadata ---- */
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
    (async () => {

        async function requireDailyPassword() {
            const pass = prompt("Enter today's password:");
            if (!pass) return location.href = "index.html";

            const res = await fetch(`/api/check?pass=${encodeURIComponent(pass)}`);
            const data = await res.json();

            if (!data.valid) {
                alert("Incorrect password.");
                return location.href = "index.html";
            }
        }

        await requireDailyPassword();



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
        } else {
            // fallback
            currentTimeEl.textContent = "0:00 / 0:00";
        }

        const epMatch = rawSrc ? rawSrc.match(/ep(\d+)/i) : null;
        const episodeNum = epMatch ? parseInt(epMatch[1], 10) : 1;
        episodeTitleEl.textContent = `Episode ${episodeNum} — ${episodeNames[episodeNum] || ""}`;
        episodeMetaEl.textContent = "Now Playing";

        /* ---- Helpers ---- */
        function formatTime(sec) {
            if (!isFinite(sec) || isNaN(sec)) return "0:00";
            const m = Math.floor(sec / 60);
            const s = Math.floor(sec % 60).toString().padStart(2, "0");
            return `${m}:${s}`;
        }
        function safePlay() {
            video.play().catch(() => { });
        }

        /* ---- Play/Pause UI toggle helper ---- */
        function updatePlayIcon() {
            const iconPlay = document.getElementById("iconPlay");
            const iconPause = document.getElementById("iconPause");
            if (!iconPlay || !iconPause) return;
            if (video.paused) {
                iconPlay.style.display = "";
                iconPause.style.display = "none";
            } else {
                iconPlay.style.display = "none";
                iconPause.style.display = "";
            }
        }

        /* ---- Play/pause handlers ---- */
        playPauseBtn.addEventListener("click", () => {
            if (video.paused) video.play();
            else video.pause();
            updatePlayIcon();
            resetHideTimer();
        });

        video.addEventListener("play", updatePlayIcon);
        video.addEventListener("pause", updatePlayIcon);

        /* ---- Back buttons ---- */
        const goBack = () => (location.href = "library.html");
        backButton && backButton.addEventListener("click", goBack);
        backButtonTop && backButtonTop.addEventListener("click", goBack);

        /* ---- Volume ---- */
        volumeSlider && volumeSlider.addEventListener("input", (e) => {
            const v = parseFloat(e.target.value);
            video.volume = v;
            video.muted = v === 0;
            updateMuteIcon();
            resetHideTimer();
        });

        function updateMuteIcon() {
            const iconVol = document.getElementById("iconVol");
            const iconMute = document.getElementById("iconMute");
            if (!iconVol || !iconMute) return;
            if (video.muted || video.volume === 0) {
                iconVol.style.display = "none";
                iconMute.style.display = "";
            } else {
                iconVol.style.display = "";
                iconMute.style.display = "none";
            }
        }

        muteBtn && muteBtn.addEventListener("click", () => {
            video.muted = !video.muted;
            if (!video.muted && video.volume === 0) video.volume = 0.08;
            volumeSlider && (volumeSlider.value = video.volume);
            updateMuteIcon();
            resetHideTimer();
        });

        /* ---- Speed ---- */
        const rates = [1, 1.25, 1.5, 2];
        let rIndex = 0;
        speedBtn && speedBtn.addEventListener("click", () => {
            rIndex = (rIndex + 1) % rates.length;
            video.playbackRate = rates[rIndex];
            speedBtn.textContent = rates[rIndex] + "x";
            resetHideTimer();
        });

        /* ---- Fullscreen ---- */
        fullscreenBtn && fullscreenBtn.addEventListener("click", async () => {
            try {
                if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
                else await document.exitFullscreen();
            } catch { }
            resetHideTimer();
        });

        /* ---- Next episode ---- */
        nextEpBtn && nextEpBtn.addEventListener("click", () => {
            const next = episodeNum + 1;
            if (next <= 8 && rawSrc) {
                const newSrc = rawSrc.replace(/ep(\d+)/i, `ep${next}`);
                location.href = `player.html?src=${encodeURIComponent(newSrc)}`;
            } else {
                alert("No next episode available.");
            }
        });

        /* ---- Progress bar ---- */
        video.addEventListener("timeupdate", () => {
            if (!video.duration) return;
            const pct = (video.currentTime / video.duration) * 100;
            progressFill.style.width = pct + "%";
            currentTimeEl.textContent = formatTime(video.currentTime) + " / " + formatTime(video.duration);
        });

        video.addEventListener("progress", () => {
            try {
                if (video.buffered.length) {
                    const b = video.buffered.end(video.buffered.length - 1);
                    progressBuffer.style.width = (b / video.duration) * 100 + "%";
                }
            } catch { }
        });

        progressContainer && progressContainer.addEventListener("click", (e) => {
            const rect = progressContainer.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            video.currentTime = pct * video.duration;
            resetHideTimer();
        });

        progressContainer && progressContainer.addEventListener("mousemove", (e) => {
            const rect = progressContainer.getBoundingClientRect();
            let x = e.clientX - rect.left;
            x = Math.max(0, Math.min(rect.width, x));
            const pct = x / rect.width;
            progressHover.textContent = formatTime(pct * video.duration);
            progressHover.style.left = x + "px";
            progressHover.style.opacity = 1;
        });

        progressContainer && progressContainer.addEventListener("mouseleave", () => {
            progressHover.style.opacity = 0;
        });

        /* ---- Auto-hide UI ---- */
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

        /* ---- Gestures ---- */
        let lastTapLeft = 0;
        let lastTapRight = 0;

        // left double-tap -> rewind 15s
        gLeft && gLeft.addEventListener("touchend", (ev) => {
            const now = Date.now();
            if (now - lastTapLeft < 300) {
                video.currentTime = Math.max(0, video.currentTime - 15);
                showGesture("⟲ 15s");
            }
            lastTapLeft = now;
            resetHideTimer();
        });

        // right double-tap -> forward 15s
        gRight && gRight.addEventListener("touchend", (ev) => {
            const now = Date.now();
            if (now - lastTapRight < 300) {
                video.currentTime = Math.min(video.duration || Infinity, video.currentTime + 15);
                showGesture("15s ⟳");
            }
            lastTapRight = now;
            resetHideTimer();
        });

        // center single tap -> toggle UI
        gCenter && gCenter.addEventListener("touchend", (ev) => {
            if (document.body.classList.contains("hide-ui")) showUI();
            else hideUI();
        });

        // vertical swipe on right zone -> volume
        let startY = 0;
        let startVol = 0;
        gRight && gRight.addEventListener("touchstart", (e) => {
            const t = e.touches[0];
            startY = t.clientY;
            startVol = video.volume;
        }, { passive: true });

        gRight && gRight.addEventListener("touchmove", (e) => {
            const t = e.touches[0];
            const dy = startY - t.clientY; // up increases
            const newVol = Math.max(0, Math.min(1, startVol + dy / 300));
            video.volume = newVol;
            video.muted = newVol === 0;
            if (volumeSlider) volumeSlider.value = newVol;
            updateMuteIcon();
            showVolume(Math.round(newVol * 100));
            resetHideTimer();
        }, { passive: true });

        /* ---- Feedback ------ */
        let feedbackTimeout = null;
        function showVolume(pct) {
            gestureFeedback.textContent = pct + "%";
            gestureFeedback.style.opacity = 1;
            clearTimeout(feedbackTimeout);
            feedbackTimeout = setTimeout(() => gestureFeedback.style.opacity = 0, 700);
        }
        function showGesture(txt) {
            gestureFeedback.textContent = txt;
            gestureFeedback.style.opacity = 1;
            clearTimeout(feedbackTimeout);
            feedbackTimeout = setTimeout(() => gestureFeedback.style.opacity = 0, 700);
        }

        /* ---- Keyboard shortcuts (spacebar fix + others) ---- */
        document.addEventListener("keydown", (e) => {
            // ensure inputs are not focused (so space doesn't type into range)
            const active = document.activeElement;
            const isInput = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
            if (isInput) return;

            if (e.code === "Space") {
                e.preventDefault();
                if (video.paused) video.play();
                else video.pause();
                updatePlayIcon();
                resetHideTimer();
            }
            if (e.code === "ArrowRight") { video.currentTime += 10; resetHideTimer(); }
            if (e.code === "ArrowLeft") { video.currentTime -= 10; resetHideTimer(); }
            if (e.key.toLowerCase() === "f") {
                document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
                resetHideTimer();
            }
        });

        /* ---- init ---- */
        updateMuteIcon();
        updatePlayIcon();
        resetHideTimer();
        safePlay();

    })();
})(); // end wrapper

