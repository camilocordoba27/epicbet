 const canvas = document.getElementById("scratchCanvas");
    const card = document.getElementById("scratchCard");
    const progressValue = document.getElementById("progressValue");
    const resultBlock = document.getElementById("resultBlock");
    const statusBlock = document.getElementById("statusBlock");
    const confetti = document.getElementById("confetti");

    // ✅ Popup refs (botón eliminado)
    const closePopupBtn = document.getElementById("closePopupBtn");
    const popupOverlay = document.getElementById("popupOverlay");

    let ctx;
    let drawing = false;
    let revealed = false;
    let progress = 0;

    function openPopup() {
      popupOverlay.style.display = "flex";
    }

    function closePopup() {
      popupOverlay.style.display = "none";
    }

    function roundRect(context, x, y, width, height, radius) {
      context.beginPath();
      context.moveTo(x + radius, y);
      context.lineTo(x + width - radius, y);
      context.quadraticCurveTo(x + width, y, x + width, y + radius);
      context.lineTo(x + width, y + height - radius);
      context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      context.lineTo(x + radius, y + height);
      context.quadraticCurveTo(x, y + height, x, y + height - radius);
      context.lineTo(x, y + radius);
      context.quadraticCurveTo(x, y, x + radius, y);
      context.closePath();
    }

    function resizeCanvas() {
      const rect = card.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;

      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";

      ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      if (!revealed) drawSurface();
    }

    function drawSurface() {
      const rect = card.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
      gradient.addColorStop(0, "#9AA3B2");
      gradient.addColorStop(0.18, "#D7DDE7");
      gradient.addColorStop(0.38, "#7A8598");
      gradient.addColorStop(0.56, "#C2C9D4");
      gradient.addColorStop(0.78, "#8E98A8");
      gradient.addColorStop(1, "#C8D0DB");

      ctx.fillStyle = gradient;
      roundRect(ctx, 0, 0, rect.width, rect.height, 18);
      ctx.fill();

      ctx.globalAlpha = 0.18;
      ctx.fillStyle = "#FFFFFF";
      for (let i = -rect.height; i < rect.width + rect.height; i += 18) {
        ctx.fillRect(i, 0, 6, rect.height);
      }
      ctx.globalAlpha = 1;

      ctx.fillStyle = "rgba(0,0,0,0.12)";
      const marks = [
        [rect.width * 0.15, rect.height * 0.18, 28, 56, -0.35],
        [rect.width * 0.38, rect.height * 0.44, 34, 70, 0.2],
        [rect.width * 0.62, rect.height * 0.24, 26, 50, 0.32],
        [rect.width * 0.72, rect.height * 0.64, 28, 58, -0.18],
        [rect.width * 0.25, rect.height * 0.72, 24, 42, 0.14]
      ];

      marks.forEach(([x, y, w, h, r]) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(r);
        roundRect(ctx, -w / 2, -h / 2, w, h, 999);
        ctx.fill();
        ctx.restore();
      });

      ctx.fillStyle = "rgba(15,23,42,0.82)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "700 12px Arial";
      ctx.fillText("Raspadita", rect.width / 2, rect.height / 2 - 48);
      ctx.font = "900 44px Arial";
      ctx.fillText("RASPA", rect.width / 2, rect.height / 2 - 4);
      ctx.font = "700 20px Arial";
      ctx.fillText("y activa tu bono", rect.width / 2, rect.height / 2 + 34);
    }

    function scratch(clientX, clientY) {
      if (revealed) return;

      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 26, 0, Math.PI * 2);
      ctx.fill();

      updateProgress();
    }

    function updateProgress() {
      if (revealed) return;

      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let transparent = 0;
      const stride = 32;

      for (let i = 3; i < data.length; i += 4 * stride) {
        if (data[i] === 0) transparent++;
      }

      const total = Math.ceil(data.length / (4 * stride));
      progress = Math.min(100, Math.round((transparent / total) * 100));
      progressValue.textContent = progress;

      if (progress >= 42) revealPrize();
    }

    function playWinSound() {
      const sound = document.getElementById("winSound");
      if (!sound) return;
      const source = sound.querySelector("source");
      if (!source) return;
      const src = source.getAttribute("src");
      if (!src || src === "TU-SOUND.mp3") return;
      sound.currentTime = 0;
      sound.play().catch(() => {});
    }

    function revealPrize() {
      revealed = true;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.display = "none";
      statusBlock.style.display = "none";
      resultBlock.style.display = "block";
      launchConfetti();
      playWinSound();

      // ✅ CAMBIO #1: al terminar de raspar -> ABRIR POPUP
       setTimeout(() => {
    openPopup();
  }, 2500);
    }

    function launchConfetti() {
      confetti.innerHTML = "";
      const colors = ["#C6FF00", "#FFFFFF", "#A3E635", "#D9FF66"];

      for (let i = 0; i < 60; i++) {
        const piece = document.createElement("span");
        piece.className = "confetti-piece";
        piece.style.left = (4 + ((i * 11) % 92)) + "%";
        piece.style.width = (6 + (i % 5) * 2) + "px";
        piece.style.height = (10 + (i % 5) * 4) + "px";
        piece.style.background = colors[i % colors.length];
        piece.style.boxShadow = "0 0 10px " + colors[i % colors.length];
        piece.style.animationDuration = (3.2 + (i % 6) * 0.28) + "s";
        piece.style.animationDelay = ((i % 10) * 0.05) + "s";
        piece.style.setProperty("--x", (i % 2 === 0 ? -55 : 55) + "px");
        piece.style.setProperty("--r", ((i % 2 === 0 ? 1 : -1) * (140 + i * 8)) + "deg");
        confetti.appendChild(piece);
      }

      setTimeout(() => { confetti.innerHTML = ""; }, 5200);
    }

    // Scratch events
    canvas.addEventListener("pointerdown", (e) => {
      drawing = true;
      scratch(e.clientX, e.clientY);
    });

    canvas.addEventListener("pointermove", (e) => {
      if (!drawing) return;
      scratch(e.clientX, e.clientY);
    });

    ["pointerup", "pointerleave", "pointercancel"].forEach((evt) => {
      canvas.addEventListener(evt, () => { drawing = false; });
    });

    // ✅ Popup events (sin botón)
    closePopupBtn.addEventListener("click", closePopup);

    popupOverlay.addEventListener("click", (e) => {
      if (e.target === popupOverlay) closePopup();
    });

    // (Opcional útil) Si el usuario lo cerró, puede reabrirlo tocando el mensaje
    resultBlock.addEventListener("click", () => {
      if (revealed) openPopup();
    });

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Counter
    const counterEl = document.getElementById("bonusCounter");
    const today = new Date().toISOString().slice(0, 10);

    const STORAGE_DATE_KEY = "bonus_counter_date";
    const STORAGE_COUNT_KEY = "bonus_counter_value";

    function formatNumber(num) {
      return num.toLocaleString("es-CL");
    }

    function getInitialBase() {
      return Math.floor(Math.random() * 500) + 1000;
    }

    let savedDate = localStorage.getItem(STORAGE_DATE_KEY);
    let savedCount = parseInt(localStorage.getItem(STORAGE_COUNT_KEY), 10);

    let count;

    if (savedDate === today && !isNaN(savedCount)) {
      count = savedCount;
    } else {
      count = getInitialBase();
      localStorage.setItem(STORAGE_DATE_KEY, today);
      localStorage.setItem(STORAGE_COUNT_KEY, count);
    }

    counterEl.textContent = formatNumber(count);

    function updateCounter() {
      const increment = Math.floor(Math.random() * 4) + 1;
      count += increment;

      counterEl.textContent = formatNumber(count);
      localStorage.setItem(STORAGE_COUNT_KEY, count);

      const nextTime = Math.floor(Math.random() * 5000) + 2500;
      setTimeout(updateCounter, nextTime);
    }

    setTimeout(updateCounter, 7000);