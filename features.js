/* ===== Attention-grabbers ===== */
// Glow orb follows the cursor
const orb = $("#glowOrb");
addEventListener("mousemove", e => { orb.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`; orb.style.opacity = ".22"; });

// Time-of-day greeting above the typed text
(function timeGreet() {
  const h = new Date().getHours();
  const part = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  const el = document.createElement("p");
  el.className = "greet-time";
  el.textContent = `${part}, ${FRIEND_NAME}`;
  const hero = document.querySelector(".hero");
  if (hero) hero.insertBefore(el, hero.firstChild);
})();

// Random emoji bursts from the screen edges
function emojiBurst(x, y, emoji) {
  const e = document.createElement("div");
  e.className = "big-emoji-burst";
  e.textContent = emoji;
  e.style.left = x + "px"; e.style.top = y + "px";
  document.body.appendChild(e);
  setTimeout(() => e.remove(), 1200);
}
const BURST_EMOJI = ["🎂", "🎈", "💖", "🌸", "🎉", "✨", "🌟", "🎁"];
setInterval(() => {
  if (Math.random() < 0.6) emojiBurst(Math.random() * innerWidth, innerHeight * (0.3 + Math.random() * 0.5), BURST_EMOJI[Math.floor(Math.random() * BURST_EMOJI.length)]);
}, 3500);

// "Surprise me" button runs a random effect
$("#surpriseBtn").addEventListener("click", () => {
  const picks = [
    () => confettiRain(160),
    () => { for (let i = 0; i < 6; i++) setTimeout(() => burst(Math.random() * innerWidth, Math.random() * innerHeight * 0.7, 40, 6), i * 250); },
    () => { $("#themeBtn").click(); $("#themeBtn").click(); },
    () => { for (let i = 0; i < 12; i++) setTimeout(() => emojiBurst(Math.random() * innerWidth, innerHeight * 0.5, BURST_EMOJI[i % BURST_EMOJI.length]), i * 120); },
  ];
  picks[Math.floor(Math.random() * picks.length)]();
  sfxChime();
});

/* ===== Happy Birthday tune (synth) ===== */
const NOTE = { C4: 262, D4: 294, E4: 330, F4: 349, G4: 392, A4: 440, Bb4: 466, C5: 523 };
const TUNE = [
  ["C4", 1], ["C4", 1], ["D4", 2], ["C4", 2], ["F4", 2], ["E4", 4],
  ["C4", 1], ["C4", 1], ["D4", 2], ["C4", 2], ["G4", 2], ["F4", 4],
  ["C4", 1], ["C4", 1], ["C5", 2], ["A4", 2], ["F4", 2], ["E4", 2], ["D4", 3],
  ["Bb4", 1], ["Bb4", 1], ["A4", 2], ["F4", 2], ["G4", 2], ["F4", 4]
];
$("#singBtn").addEventListener("click", () => {
  try {
    const c = ctx(); let t = c.currentTime + 0.1;
    TUNE.forEach(([n, beats]) => {
      tone(NOTE[n], t, beats * 0.32, 0.2, "triangle");
      t += beats * 0.36;
    });
    setTimeout(() => confettiRain(120), TUNE.length * 0.2 * 1000);
  } catch (e) {}
});

/* ===== Mood selector changes the page glow ===== */
$$(".mood").forEach(b => b.addEventListener("click", () => {
  document.documentElement.style.setProperty("--rose", b.dataset.glow);
  orb.style.background = `radial-gradient(circle, ${b.dataset.glow} 0, transparent 65%)`;
  burst(b.getBoundingClientRect().left, b.getBoundingClientRect().top, 30, 5);
  sfxPop();
}));

/* ===== Next birthday countdown (uses today's month/day next year) ===== */
(function nextBirthday() {
  const tick = () => {
    const now = new Date();
    let target = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (target <= now) target.setFullYear(target.getFullYear() + 1);
    const days = Math.ceil((target - now) / 86400000);
    $("#nextBday").textContent = days === 1 ? "Tomorrow is not far 🎂" : `${days} days to go 🎂`;
  };
  tick(); setInterval(tick, 60000);
})();

/* ===== Constellation: tap to place stars, lines connect them ===== */
(function constellation() {
  const c = $("#constellation"), g = c.getContext("2d");
  const pts = [];
  const size = () => { const r = c.getBoundingClientRect(), d = devicePixelRatio || 1; c.width = r.width * d; c.height = r.height * d; g.setTransform(d, 0, 0, d, 0, 0); draw(); };
  const draw = () => {
    const w = c.width / (devicePixelRatio || 1), h = c.height / (devicePixelRatio || 1);
    g.clearRect(0, 0, w, h);
    g.strokeStyle = "rgba(255,226,154,.6)"; g.lineWidth = 1.5;
    g.beginPath();
    pts.forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y));
    g.stroke();
    pts.forEach(p => {
      g.fillStyle = "#ffe29a"; g.shadowColor = "#ffe29a"; g.shadowBlur = 12;
      g.beginPath(); g.arc(p.x, p.y, 4, 0, 7); g.fill(); g.shadowBlur = 0;
    });
  };
  c.addEventListener("pointerdown", e => {
    const r = c.getBoundingClientRect();
    pts.push({ x: e.clientX - r.left, y: e.clientY - r.top });
    sfxPop(); draw();
    if (pts.length === 7) { burst(e.clientX, e.clientY, 60, 6); sfxChime(); }
  });
  $("#clearStars").addEventListener("click", () => { pts.length = 0; draw(); });
  addEventListener("resize", size); size();
})();

/* ===== 1. Photo wall: tap to flip & read memory ===== */
$$(".ptile").forEach(t => t.addEventListener("click", () => {
  $$(".ptile").forEach(x => x.classList.remove("flip"));
  t.classList.add("flip");
  $("#pwallCap").textContent = t.dataset.cap; sfxPop();
}));

/* ===== 2. Voice note (saved in this browser) ===== */
const VOICE_KEY = "sherlin-voice-note";
const voiceEl = $("#voiceAudio");
try {
  const saved = localStorage.getItem(VOICE_KEY);
  if (saved) { voiceEl.src = saved; voiceEl.style.display = "block"; $("#recStatus").textContent = "A voice note is saved 💌"; }
} catch (e) {}
let recorder = null, chunks = [];
$("#recBtn").addEventListener("click", async () => {
  if (recorder && recorder.state === "recording") { recorder.stop(); return; }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder = new MediaRecorder(stream); chunks = [];
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      const reader = new FileReader();
      reader.onload = () => {
        try { localStorage.setItem(VOICE_KEY, reader.result); } catch (e) { $("#recStatus").textContent = "Too long to save here, but you can play it now."; }
        voiceEl.src = reader.result; voiceEl.style.display = "block";
        $("#recStatus").textContent = "Voice note saved 💌";
        $("#recBtn").textContent = "🎙️ Record again";
      };
      reader.readAsDataURL(new Blob(chunks, { type: "audio/webm" }));
    };
    recorder.start();
    $("#recBtn").textContent = "⏹ Stop"; $("#recStatus").textContent = "Recording… tap Stop when done";
  } catch (e) { $("#recStatus").textContent = "Microphone access was blocked."; }
});

/* ===== 3. Sliding puzzle using her photo ===== */
const pzEl = $("#puzzle");
let pzOrder = [];
function pzRender() {
  pzEl.innerHTML = "";
  pzOrder.forEach((n, i) => {
    const t = document.createElement("div");
    t.className = "pz" + (n === 8 ? " blank" : "");
    if (n !== 8) {
      const col = n % 3, row = Math.floor(n / 3);
      t.style.backgroundPosition = `${col * 50}% ${row * 50}%`;
      t.addEventListener("click", () => pzMove(i));
    }
    pzEl.appendChild(t);
  });
}
function pzMove(i) {
  const b = pzOrder.indexOf(8), adj = [i - 1, i + 1, i - 3, i + 3];
  if (!adj.includes(b) || (b === i - 1 && i % 3 === 0) || (b === i + 1 && i % 3 === 2)) return;
  [pzOrder[i], pzOrder[b]] = [pzOrder[b], pzOrder[i]];
  pzRender(); sfxPop();
  if (pzOrder.every((n, k) => n === k)) { sfxChime(); confettiRain(120); }
}
function pzShuffle() {
  pzOrder = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  for (let s = 0; s < 120; s++) {
    const b = pzOrder.indexOf(8), r = Math.floor(b / 3), c = b % 3, moves = [];
    if (r > 0) moves.push(b - 3); if (r < 2) moves.push(b + 3);
    if (c > 0) moves.push(b - 1); if (c < 2) moves.push(b + 1);
    const m = moves[Math.floor(Math.random() * moves.length)];
    [pzOrder[b], pzOrder[m]] = [pzOrder[m], pzOrder[b]];
  }
  pzRender();
}
$("#shufflePuzzle").addEventListener("click", pzShuffle);
pzShuffle();

/* ===== 4. Guess the year ===== */
const ys = $("#yearSlider");
ys.addEventListener("input", () => $("#yearVal").textContent = ys.value);
$("#yearGuess").addEventListener("click", () => {
  const guess = +ys.value, actual = 2021; // set the real year of the photo here
  const off = Math.abs(guess - actual);
  $("#yearRes").textContent = off === 0 ? "Spot on! 🎯 Bonus confetti!" : `Off by ${off} year${off > 1 ? "s" : ""} — the real year was ${actual} 😉`;
  if (off === 0) { sfxChime(); confettiRain(90); } else sfxPop();
});

/* ===== 5. Night-sky mode (after dark) ===== */
(function nightMode() {
  const h = new Date().getHours();
  if (h >= 19 || h < 6) {
    document.body.classList.add("night");
    for (let i = 0; i < 40; i++) {
      const s = document.createElement("span");
      s.className = "star";
      s.style.left = Math.random() * 100 + "%"; s.style.top = Math.random() * 100 + "%";
      s.style.setProperty("--d", 0.8 + Math.random() * 2 + "s");
      $("#stars").appendChild(s);
    }
    setInterval(shootingStar, 5000);
  }
})();

/* ===== 6. Handwriting letter (pen-style reveal) ===== */
(function handwriting() {
  const lines = [
    "Dear Sherry,",
    "",
    "Another year of you, and the world is a little brighter for it.",
    "You bring so much light into everyone's day, often without even trying.",
    "Thank you for your kindness, your laughter, and for always making space for others.",
    "I hope this year gives you everything your heart has been quietly wishing for:",
    "calm mornings, good news, loyal friends, and courage for every new chapter.",
    "",
    "Whenever things feel heavy, remember how much you are loved.",
    "Be proud of how far you have come, and gentle with yourself on the road ahead.",
    "",
    "Happy Birthday, Sherry. 💗",
    "",
    "God bless you, always. 🙏✨",
    "With love, " + SENDER_NAME
  ];
  const box = document.createElement("div");
  box.className = "handwrite";
  $("#letterSlot") && $("#letterSlot").appendChild(box);
  const ln = $("#envelope").closest(".scene");
  if (!ln) return;
  const sec = document.createElement("section");
  sec.className = "scene";
  sec.innerHTML = '<p class="kicker">written just for you</p><h2 class="head">A handwritten note</h2>';
  sec.appendChild(box);
  ln.after(sec);
  let started = false;
  const io2 = new IntersectionObserver(es => {
    if (!started && es[0].isIntersecting) {
      started = true;
      let delay = 0;
      lines.forEach(line => {
        [...line].forEach(ch => {
          const s = document.createElement("span");
          s.className = "typed-letter"; s.textContent = ch;
          s.style.animationDelay = delay + "ms";
          box.appendChild(s); delay += 10;
        });
        box.appendChild(document.createElement("br"));
        delay += 80;
      });
      const pen = document.createElement("span"); pen.className = "pen"; pen.textContent = "✒️";
      box.appendChild(pen);
    }
  }, { threshold: 0.4 });
  io2.observe(sec);
})();

/* ===== 7. Photo tap morphs into a heart ===== */
$("#heartPhoto").addEventListener("click", e => {
  e.currentTarget.classList.toggle("heart");
  burst(innerWidth / 2, innerHeight / 2, 40, 5); sfxPop();
});

/* ===== 8. Easter eggs ===== */
let typed = "";
addEventListener("keydown", e => {
  typed = (typed + e.key.toLowerCase()).slice(-12);
  if (typed.endsWith("sherlin") || typed.endsWith("sherry")) { confettiRain(150); sfxChime(); }
});
let logoTaps = 0;
$("#curtain").querySelector(".curtain-name").addEventListener("click", () => {
  if (++logoTaps === 5) { emojiBurst(innerWidth / 2, innerHeight / 2, "🦄"); confettiRain(200); logoTaps = 0; }
});

/* ===== 9. Wish counter (this device; shared total needs a database) ===== */
const WISH_KEY = "sherlin-wish-count";
const wishEl = $("#wishTotal");
const readWish = () => { try { return +localStorage.getItem(WISH_KEY) || 0; } catch (e) { return 0; } };
const showWish = () => wishEl.textContent = `Wishes made on this device: ${readWish()} 🌠`;
$("#wishCount").addEventListener("click", e => {
  try { localStorage.setItem(WISH_KEY, readWish() + 1); } catch (err) {}
  showWish(); burst(e.clientX, e.clientY, 25, 4); sfxPop();
});
showWish();

/* ===== 10. Birthday playlist ===== */
const plQueue = []; let plIdx = -1;
const plAudio = new Audio();
plAudio.addEventListener("ended", () => playNext());
function playNext() {
  if (!plQueue.length) return;
  plIdx = (plIdx + 1) % plQueue.length;
  plAudio.src = plQueue[plIdx].url;
  plAudio.play().catch(() => {});
  $("#plNow").textContent = "Now playing: " + plQueue[plIdx].name + " 🎶";
  const ctxA = ctx();
  if (!plAudio._hooked) {
    const src = ctxA.createMediaElementSource(plAudio);
    src.connect(ctxA.destination); plAudio._hooked = true;
  }
}
$("#plFiles").addEventListener("change", e => {
  [...e.target.files].forEach(f => plQueue.push({ name: f.name, url: URL.createObjectURL(f) }));
  $("#plNow").textContent = `${plQueue.length} song(s) in your playlist`;
});
$("#plNext").addEventListener("click", playNext);
// the playlist file input is inside a <label>, so it is wired via the label above

/* Extra features: quiz, catch game, memory match, 3D gift, photo book,
   song visualizer, save-as-picture and share link.
   Uses helpers from script.js: burst, confettiRain, sfxPop, sfxChime, ctx, FRIEND_NAME, SENDER_NAME */

/* ===== Quiz (edit these questions for Sherlin) ===== */
const QUIZ = [
  { q: "What is Sherlin's favourite kind of day?", options: ["Quiet and cosy", "Busy and full of plans", "Rainy and slow"], answer: 1 },
  { q: "What makes Sherlin smile the most?", options: ["Good food", "Her friends", "Music"], answer: 1 },
  { q: "What is the best thing about Sherlin?", options: ["Her kindness", "Her energy", "Both of them!"], answer: 2 }
];
let qi = 0, qScore = 0;
function renderQuiz() {
  const card = $("#quizCard");
  if (qi >= QUIZ.length) {
    const msg = qScore === QUIZ.length ? "Perfect! You know her well 💖" : `You got ${qScore} / ${QUIZ.length}. Happy Birthday, ${FRIEND_NAME}!`;
    card.innerHTML = `<p class="quiz-q">Quiz complete 🎉</p><p class="quiz-result">${msg}</p><button class="mini-btn" id="quizAgain">Play again</button>`;
    $("#quizAgain").onclick = () => { qi = 0; qScore = 0; renderQuiz(); };
    if (qScore === QUIZ.length) confettiRain(100);
    return;
  }
  const item = QUIZ[qi];
  card.innerHTML = `<p class="quiz-q">${qi + 1}. ${item.q}</p>` +
    item.options.map((o, i) => `<button class="quiz-opt" data-i="${i}">${o}</button>`).join("") +
    `<div class="quiz-result" id="quizRes"></div>`;
  card.querySelectorAll(".quiz-opt").forEach(b => b.onclick = () => {
    const pick = +b.dataset.i;
    card.querySelectorAll(".quiz-opt").forEach(x => x.onclick = null);
    if (pick === item.answer) { b.classList.add("right"); qScore++; sfxChime(); $("#quizRes").textContent = "Correct! ✨"; }
    else { b.classList.add("wrong"); card.querySelectorAll(".quiz-opt")[item.answer].classList.add("right"); sfxPop(); $("#quizRes").textContent = "Not quite 😅"; }
    setTimeout(() => { qi++; renderQuiz(); }, 1300);
  });
}
renderQuiz();

/* ===== Catch the cakes ===== */
const catchField = $("#catchField"), catchBasket = $("#catchBasket"), catchBox = $("#catchBox");
let basketX = 50, catchScore = 0, catchTimer = null, dropTimer = null, catchTime = 0;
const CATCH_ITEMS = ["🎂", "🍰", "🧁", "🍭", "💖"];
catchBox.addEventListener("mousemove", e => {
  const r = catchBox.getBoundingClientRect();
  basketX = ((e.clientX - r.left) / r.width) * 100;
  catchBasket.style.left = Math.min(92, Math.max(8, basketX)) + "%";
});
catchBox.addEventListener("touchmove", e => {
  const r = catchBox.getBoundingClientRect();
  basketX = ((e.touches[0].clientX - r.left) / r.width) * 100;
  catchBasket.style.left = Math.min(92, Math.max(8, basketX)) + "%";
}, { passive: true });
function dropItem() {
  const f = document.createElement("span");
  f.className = "falling";
  f.textContent = CATCH_ITEMS[Math.floor(Math.random() * CATCH_ITEMS.length)];
  f.style.left = Math.random() * 90 + "%";
  catchField.appendChild(f);
  const dur = 2600 + Math.random() * 1200;
  const start = performance.now();
  const step = now => {
    const t = (now - start) / dur;
    if (!f.isConnected) return;
    f.style.top = (-40 + t * 380) + "px";
    const fr = f.getBoundingClientRect(), br = catchBasket.getBoundingClientRect();
    if (fr.bottom >= br.top && fr.top <= br.bottom && fr.right >= br.left && fr.left <= br.right) {
      catchScore++; $("#catchScore").textContent = "Score " + catchScore; sfxPop();
      burst(fr.left, fr.top, 14, 4); f.remove(); return;
    }
    if (t >= 1) { f.remove(); return; }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
$("#catchStart").addEventListener("click", () => {
  clearInterval(dropTimer); catchScore = 0; catchField.innerHTML = "";
  $("#catchScore").textContent = "Score 0";
  dropTimer = setInterval(dropItem, 650);
  setTimeout(() => {
    clearInterval(dropTimer);
    $("#catchScore").textContent = `Score ${catchScore} 🎉`;
    if (catchScore >= 10) confettiRain(80);
  }, 20000);
});

/* ===== Memory match ===== */
const MEM_SYMBOLS = ["🌸", "🎈", "🎂", "💖"];
let memFirst = null, memLock = false, memMoves = 0, memFound = 0;
function setupMemory() {
  const grid = $("#memGrid");
  grid.innerHTML = "";
  memFirst = null; memMoves = 0; memFound = 0; memLock = false;
  $("#memScore").textContent = "Moves 0";
  const deck = [...MEM_SYMBOLS, ...MEM_SYMBOLS].sort(() => Math.random() - 0.5);
  deck.forEach(sym => {
    const b = document.createElement("button");
    b.className = "mem";
    b.dataset.sym = sym;
    b.innerHTML = `<span class="mem-face front">?</span><span class="mem-face back">${sym}</span>`;
    b.addEventListener("click", () => flipMem(b));
    grid.appendChild(b);
  });
}
function flipMem(b) {
  if (memLock || b.classList.contains("open") || b.classList.contains("match")) return;
  b.classList.add("open"); sfxPop();
  if (!memFirst) { memFirst = b; return; }
  memMoves++; $("#memScore").textContent = "Moves " + memMoves;
  if (memFirst.dataset.sym === b.dataset.sym) {
    memFirst.classList.add("match"); b.classList.add("match");
    memFound++; memFirst = null; sfxChime();
    if (memFound === MEM_SYMBOLS.length) {
      $("#memScore").textContent = `Done in ${memMoves} moves! 🎉`; confettiRain(100);
    }
  } else {
    memLock = true;
    const a = memFirst; memFirst = null;
    setTimeout(() => { a.classList.remove("open"); b.classList.remove("open"); memLock = false; }, 800);
  }
}
setupMemory();

/* ===== Spin the 3D cake by dragging ===== */
(function spinCake() {
  const stage = $("#cakeSpin"), cake = stage.querySelector(".spin-cake");
  let down = false, lastX = 0, rot = 0;
  stage.addEventListener("pointerdown", e => { down = true; lastX = e.clientX; cake.style.animation = "none"; stage.setPointerCapture(e.pointerId); });
  stage.addEventListener("pointermove", e => {
    if (!down) return;
    rot += (e.clientX - lastX) * 0.6; lastX = e.clientX;
    cake.style.transform = `rotateX(-12deg) rotateY(${rot}deg)`;
  });
  const up = () => { down = false; };
  stage.addEventListener("pointerup", up);
  stage.addEventListener("pointercancel", up);
})();

/* ===== 3D gift box: tap to pop & show a message ===== */
const GIFT_MSGS = ["You deserve every good thing 💖", "Your smile is the best gift 🌸", "Dream big, shine bigger ✨", "Happy Birthday! 🎂"];
const gift3d = $("#gift3d");
function openGift3d() {
  gift3d.classList.remove("burst"); void gift3d.offsetWidth; gift3d.classList.add("burst");
  $("#g3Msg").textContent = GIFT_MSGS[Math.floor(Math.random() * GIFT_MSGS.length)];
  sfxChime(); burst(innerWidth / 2, innerHeight / 2, 50, 6);
}
gift3d.addEventListener("click", openGift3d);
gift3d.addEventListener("keydown", e => { if (e.key === "Enter") openGift3d(); });

/* ===== Page-turn photo book ===== */
const pages = [$("#page1"), $("#page2"), $("#page3")];
let turnedCount = 0;
function refreshBook() {
  pages.forEach((p, i) => { p.classList.toggle("turned", i < turnedCount); p.style.zIndex = i < turnedCount ? i : pages.length - i; });
}
$("#bookNext").addEventListener("click", () => { if (turnedCount < pages.length) { turnedCount++; refreshBook(); sfxPop(); } });
$("#bookPrev").addEventListener("click", () => { if (turnedCount > 0) { turnedCount--; refreshBook(); sfxPop(); } });
refreshBook();

/* ===== Song upload + visualizer ===== */
const songFile = $("#songFile"), songAudio = $("#songAudio"), songViz = $("#songViz");
for (let i = 0; i < 32; i++) songViz.appendChild(document.createElement("i"));
let songAnalyser = null, songSourceMade = false;
songFile.addEventListener("change", () => {
  const f = songFile.files[0];
  if (!f) return;
  songAudio.src = URL.createObjectURL(f);
  songAudio.play().catch(() => {});
  if (!songSourceMade) {
    const c = ctx();
    const src = c.createMediaElementSource(songAudio);
    songAnalyser = c.createAnalyser(); songAnalyser.fftSize = 128;
    src.connect(songAnalyser); songAnalyser.connect(c.destination);
    songSourceMade = true;
  }
});
(function drawSongViz() {
  const bars = [...songViz.children];
  if (songAnalyser) {
    const data = new Uint8Array(songAnalyser.frequencyBinCount);
    songAnalyser.getByteFrequencyData(data);
    bars.forEach((b, i) => { const v = data[i * 2] || 0; b.style.height = (6 + v / 255 * 60) + "px"; });
  } else {
    bars.forEach((b, i) => { b.style.height = (6 + Math.abs(Math.sin(performance.now() / 400 + i)) * 10) + "px"; });
  }
  requestAnimationFrame(drawSongViz);
})();

/* ===== Save as picture (card drawn on canvas) ===== */
function drawCard() {
  const c = document.createElement("canvas");
  c.width = 900; c.height = 1200;
  const g = c.getContext("2d");
  const grad = g.createLinearGradient(0, 0, 900, 1200);
  grad.addColorStop(0, "#1b1845"); grad.addColorStop(1, "#ff7eb6");
  g.fillStyle = grad; g.fillRect(0, 0, 900, 1200);
  g.fillStyle = "#fff6ee"; g.textAlign = "center";
  g.font = "bold 92px Georgia, serif";
  g.fillText("Happy Birthday", 450, 150);
  g.font = "bold 150px Georgia, serif"; g.fillStyle = "#ffe29a";
  g.fillText(FRIEND_NAME, 450, 330);
  g.font = "48px Georgia, serif"; g.fillStyle = "#fff6ee";
  g.fillText("🎂 🌸 💖 🎈", 450, 420);
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      try {
        g.save(); g.beginPath(); g.roundRect(140, 480, 620, 620, 30); g.clip();
        g.drawImage(img, 140, 480, 620, 620); g.restore();
      } catch (e) {}
      g.fillStyle = "#fff6ee"; g.font = "40px Georgia, serif";
      g.fillText("With love, " + SENDER_NAME, 450, 1120);
      resolve(c);
    };
    img.onerror = () => resolve(c);
    img.src = "images/sherlin.jpeg";
  });
}
$("#saveCard").addEventListener("click", async () => {
  const c = await drawCard();
  try {
    c.toBlob(blob => {
      if (!blob) throw new Error("no blob");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `happy-birthday-${FRIEND_NAME.toLowerCase()}.png`;
      a.click();
      $("#shareMsg").textContent = "Picture saved 📸";
    });
  } catch (e) {
    $("#shareMsg").textContent = "Couldn't save the picture here. Try opening the page through a local server.";
  }
});

/* ===== Share link ===== */
$("#shareLink").addEventListener("click", async () => {
  const url = location.href;
  if (navigator.share) {
    try { await navigator.share({ title: `Happy Birthday ${FRIEND_NAME}!`, text: "Your birthday surprise 🎂", url }); return; } catch (e) {}
  }
  try {
    await navigator.clipboard.writeText(url);
    $("#shareMsg").textContent = "Link copied 🔗 — send it to anyone!";
  } catch (e) {
    $("#shareMsg").textContent = url;
  }
});
