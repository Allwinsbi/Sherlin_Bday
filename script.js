/* ===== Config: change these for your friend ===== */
const FRIEND_NAME = "Sherlin";
const SENDER_NAME = "Pooja";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
document.querySelectorAll("[data-name]").forEach(e => e.textContent = FRIEND_NAME);
document.querySelectorAll("[data-name-upper]").forEach(e => e.textContent = FRIEND_NAME.toUpperCase());
document.querySelectorAll("[data-sender]").forEach(e => e.textContent = SENDER_NAME);
$("#year").textContent = new Date().getFullYear();

/* ===== Audio (synth, no files needed) ===== */
let actx = null, musicOn = true, musicTimer = null;
function ctx() {
  if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
  return actx;
}
function tone(freq, t, dur = 0.25, vol = 0.18, type = "sine") {
  const c = ctx(), o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.value = freq;
  o.connect(g); g.connect(c.destination);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.start(t); o.stop(t + dur);
}
function sfxPop() { try { tone(900 + Math.random() * 400, ctx().currentTime, 0.12, 0.25, "triangle"); } catch (e) {} }
function sfxChime() {
  try { const t = ctx().currentTime; [784, 988, 1175, 1568].forEach((f, i) => tone(f, t + i * 0.09, 0.4, 0.15)); } catch (e) {}
}
/* Background music: Happy Birthday tune on a soft loop (TUNE and NOTE live in features.js) */
const songTrack = new Audio("music/birthday-song.mp3");
songTrack.loop = true;
songTrack.volume = 0.6;
let songOk = true; // assume your song works; switches to false only if the file fails to load
songTrack.addEventListener("error", () => songOk = false);

function startMusic() {
  if (musicTimer) return;
  if (songOk) {
    songTrack.play().catch(() => {});
    return;
  }
  const playOnce = () => {
    if (!musicOn) return;
    try {
      // Livelier version: faster tempo, melody + harmony + bass + sparkle layer
      let t = ctx().currentTime + 0.1;
      TUNE.forEach(([n, beats]) => {
        const f = NOTE[n], len = beats * 0.26;
        tone(f, t, len, 0.16, "triangle");          // melody
        tone(f * 1.26, t, len, 0.07, "sine");       // harmony (major third above)
        tone(f / 2, t, len, 0.09, "sawtooth");      // bass
        tone(f * 2, t + len * 0.5, len * 0.4, 0.05, "sine"); // sparkle
        t += beats * 0.28;
      });
    } catch (e) {}
  };
  const songLength = TUNE.reduce((sum, [, beats]) => sum + beats * 0.36, 0);
  playOnce();
  musicTimer = setInterval(playOnce, (songLength + 2) * 1000);
}

/* ===== Starfield with parallax ===== */
const starsEl = $("#stars");
for (let i = 0; i < 120; i++) {
  const s = document.createElement("span");
  s.className = "star";
  s.style.left = Math.random() * 100 + "%";
  s.style.top = Math.random() * 100 + "%";
  s.style.setProperty("--d", 1 + Math.random() * 3 + "s");
  s.style.transform = `scale(${0.5 + Math.random()})`;
  starsEl.appendChild(s);
}
window.addEventListener("mousemove", e => {
  const x = (e.clientX / innerWidth - 0.5) * 20, y = (e.clientY / innerHeight - 0.5) * 20;
  starsEl.style.transform = `translate3d(${x}px,${y}px,0)`;
});

/* ===== Canvas FX: confetti + fireworks ===== */
const cv = $("#fx"), cx = cv.getContext("2d");
let parts = [];
function resize() { cv.width = innerWidth; cv.height = innerHeight; }
resize(); addEventListener("resize", resize);
const PALETTE = ["#ff7eb6", "#ffe29a", "#7ee8d2", "#ffb88c", "#fff6ee", "#b59cff"];
function burst(x, y, n = 80, speed = 7) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, v = Math.random() * speed;
    parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2, life: 1, g: 0.12,
      c: PALETTE[i % PALETTE.length], r: 1.5 + Math.random() * 2.5, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, shape: Math.random() > 0.5 ? "rect" : "dot" });
  }
}
function confettiRain(n = 140) {
  for (let i = 0; i < n; i++) {
    parts.push({ x: Math.random() * innerWidth, y: -20 - Math.random() * 200, vx: (Math.random() - 0.5) * 2, vy: 2 + Math.random() * 3,
      life: 1, g: 0.02, c: PALETTE[i % PALETTE.length], r: 4 + Math.random() * 3, rot: 0, vr: (Math.random() - 0.5) * 0.4, shape: "rect", fall: true });
  }
}
(function loop() {
  cx.clearRect(0, 0, cv.width, cv.height);
  parts = parts.filter(p => p.life > 0 && p.y < innerHeight + 40);
  for (const p of parts) {
    p.vy += p.g; p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.rot += p.vr;
    if (!p.fall) p.life -= 0.012;
    cx.save(); cx.globalAlpha = Math.max(p.life, 0); cx.fillStyle = p.c;
    cx.translate(p.x, p.y); cx.rotate(p.rot);
    if (p.shape === "rect") cx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
    else { cx.beginPath(); cx.arc(0, 0, p.r, 0, 7); cx.fill(); }
    cx.restore();
  }
  requestAnimationFrame(loop);
})();

/* ===== Intro curtain ===== */
const curtain = $("#curtain");
$("#soundBtn").addEventListener("click", () => {
  musicOn = !musicOn;
  $("#soundBtn").textContent = musicOn ? "🎶 Music on" : "🔇 Music off";
  $("#soundBtn").classList.toggle("off", !musicOn);
  if (musicOn) { if (songOk) songTrack.play().catch(() => {}); }
  else songTrack.pause();
});

$("#startBtn").addEventListener("click", () => {
  curtain.classList.add("open");
  setTimeout(() => curtain.classList.add("gone"), 1300);
  sfxChime(); confettiRain(); startMusic();
});

/* ===== Typed greeting ===== */
const greetLines = [`Happy Birthday, ${FRIEND_NAME} 🎂`, "Hey Sherry, today is all yours ✨", "Make a wish, superstar 🌠"];
let gi = 0, ci = 0, deleting = false;
const greetEl = $("#greet");
(function typer() {
  const line = greetLines[gi];
  greetEl.textContent = line.slice(0, ci);
  if (!deleting && ci < line.length) { ci++; setTimeout(typer, 70); }
  else if (!deleting) { deleting = true; setTimeout(typer, 1600); }
  else if (ci > 0) { ci--; setTimeout(typer, 35); }
  else { deleting = false; gi = (gi + 1) % greetLines.length; setTimeout(typer, 300); }
})();

/* ===== 3D tilt helper (cursor-based) ===== */
function tilt3D(el, max = 14) {
  el.addEventListener("mousemove", e => {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(700px) rotateX(${-py * max}deg) rotateY(${px * max}deg) translateZ(10px)`;
  });
  el.addEventListener("mouseleave", () => { el.style.transform = ""; });
}
tilt3D($("#polaroid"), 16);
$$(".tilt-me").forEach(el => tilt3D(el, 10));

/* ===== Envelope ===== */
const env = $("#envelope");
function openEnv() {
  if (env.classList.contains("open")) return;
  env.classList.add("open");
  if (!env.querySelector(".env-letter")) {
    const l = document.createElement("div");
    l.className = "env-letter";
    l.textContent = `Sherry, you light up every room you walk into. Thank you for being you. 💗`;
    env.appendChild(l);
  }
  sfxChime(); burst(innerWidth / 2, innerHeight * 0.6, 60, 6);
}
env.addEventListener("click", openEnv);
env.addEventListener("keydown", e => { if (e.key === "Enter") openEnv(); });

/* ===== Timeline reveal ===== */
const io = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add("show"); en.target.dataset.seen = "1"; io.unobserve(en.target); }
  });
}, { threshold: 0.3 });
$$("[data-reveal]").forEach(el => io.observe(el));

/* ===== Balloon pop game ===== */
const field = $("#balloonField"), scoreEl = $("#score");
const COLORS = ["#ff7eb6", "#ffe29a", "#7ee8d2", "#b59cff", "#ffb88c"];
let popped = 0;
const TOTAL = 12;
function spawnBalloons() {
  for (let i = 0; i < TOTAL; i++) {
    const b = document.createElement("div");
    b.className = "balloon";
    b.style.background = `radial-gradient(circle at 30% 30%, #fff8 0, ${COLORS[i % COLORS.length]} 45%)`;
    b.style.left = 6 + Math.random() * 82 + "%";
    b.style.top = 8 + Math.random() * 74 + "%";
    b.style.animationDelay = Math.random() * 2 + "s";
    b.addEventListener("click", () => {
      if (b.classList.contains("pop")) return;
      b.classList.add("pop"); popped++; sfxPop();
      const r = b.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, 24, 5);
      scoreEl.textContent = `${popped} / ${TOTAL} popped`;
      if (popped === TOTAL) {
        field.classList.add("clear");
        const d = document.createElement("div");
        d.className = "done"; d.textContent = `You did it, ${FRIEND_NAME}! 🎈`;
        field.appendChild(d); sfxChime(); confettiRain(90);
      }
    });
    field.appendChild(b);
  }
}
spawnBalloons();

/* ===== Cake: tap or blow into mic ===== */
const candles = [];
const row = $("#rowCandles");
for (let i = 0; i < 5; i++) {
  const c = document.createElement("span");
  c.className = "c";
  c.innerHTML = '<i class="f"></i>';
  row.appendChild(c); candles.push(c);
}
let blownOut = 0;
const cakeNote = $("#cakeNote");
function blowOne() {
  const left = candles.filter(c => !c.classList.contains("out"));
  if (!left.length) return;
  left[0].classList.add("out"); blownOut++;
  sfxPop();
  if (blownOut === candles.length) finishCake();
}
function finishCake() {
  cakeNote.textContent = `🌠 Wish granted, ${FRIEND_NAME}! Happy Birthday! 🌠`;
  cakeNote.classList.add("done");
  const r = $("#cakeStage").getBoundingClientRect();
  burst(r.left + r.width / 2, r.top, 140, 9);
  sfxChime(); confettiRain(120);
}
$("#cakeStage").addEventListener("click", blowOne);
$("#cakeStage").addEventListener("keydown", e => { if (e.key === "Enter") blowOne(); });

async function micBlow() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const src = ctx().createMediaStreamSource(stream);
    const an = ctx().createAnalyser(); an.fftSize = 512; src.connect(an);
    const buf = new Uint8Array(an.fftSize);
    cakeNote.textContent = "🎤 Blow into your mic!";
    const check = () => {
      if (blownOut >= candles.length) { stream.getTracks().forEach(t => t.stop()); return; }
      an.getByteTimeDomainData(buf);
      let s = 0; for (const v of buf) s += Math.abs(v - 128);
      if (s / buf.length > 22) blowOne();
      setTimeout(check, 180);
    };
    check();
  } catch (e) { /* mic denied: tap still works */ }
}
$("#cakeStage").addEventListener("dblclick", micBlow);

/* ===== Wish slips: 3D flip-in on pick ===== */
$$(".slip").forEach(s => s.addEventListener("click", () => {
  $$(".slip").forEach(x => x.classList.remove("picked"));
  s.classList.add("picked");
  $("#slipOut").textContent = `Your wish: ${s.dataset.wish}`;
  sfxChime(); burst(s.getBoundingClientRect().left + 40, s.getBoundingClientRect().top, 30, 4);
}));

/* ===== Glow counter button ===== */
let glows = 0;
$("#glowBtn").addEventListener("click", e => {
  glows++;
  $("#glowCount").textContent = "×" + glows;
  sfxPop();
  burst(e.clientX, e.clientY, 40, 6);
});

/* ===== Themes ===== */
const THEMES = ["midnight", "sunset", "mint", "bubblegum", "gold", "ocean", "forest", "neon", "cotton", "ember"];
let themeIdx = 0;
$("#themeBtn").addEventListener("click", () => {
  themeIdx = (themeIdx + 1) % THEMES.length;
  document.documentElement.dataset.theme = THEMES[themeIdx] === "midnight" ? "" : THEMES[themeIdx];
  if (!document.documentElement.dataset.theme) delete document.documentElement.dataset.theme;
  $("#themeBtn").textContent = "🎨 " + THEMES[themeIdx][0].toUpperCase() + THEMES[themeIdx].slice(1);
  sfxPop();
});

/* ===== Floating 3D shapes ===== */
for (let i = 0; i < 8; i++) {
  const s = document.createElement("div");
  s.className = "shape" + (i % 2 ? " round" : "");
  s.innerHTML = "<i></i>";
  s.style.left = Math.random() * 95 + "vw";
  s.style.top = Math.random() * 95 + "vh";
  s.style.animationDuration = 8 + Math.random() * 10 + "s";
  s.style.transform = `scale(${0.6 + Math.random() * 1.2})`;
  document.body.appendChild(s);
}

/* ===== Shooting stars ===== */
function shootingStar() {
  const s = document.createElement("div");
  s.className = "shoot";
  s.style.left = 40 + Math.random() * 60 + "vw";
  s.style.top = Math.random() * 40 + "vh";
  document.body.appendChild(s);
  setTimeout(() => s.remove(), 1300);
  setTimeout(shootingStar, 2500 + Math.random() * 4000);
}
setTimeout(shootingStar, 1500);

/* ===== Click anywhere = firework ===== */
addEventListener("click", e => {
  if (e.target.closest("button,a,.envelope,.slip,.balloon,.cake-stage")) return;
  burst(e.clientX, e.clientY, 36, 5);
  sfxPop();
});

/* ===== Countdown to end of today ===== */
function tickCountdown() {
  const now = new Date();
  const end = new Date(now); end.setHours(23, 59, 59, 999);
  const ms = Math.max(0, end - now);
  const h = Math.floor(ms / 3600000), m = Math.floor(ms % 3600000 / 60000), s = Math.floor(ms % 60000 / 1000);
  $("#countdown").textContent = ms > 0
    ? `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s 🎉`
    : "Happy Birthday, it's still your day! 🎂";
}
tickCountdown(); setInterval(tickCountdown, 1000);

/* ===== Scratch-to-reveal ===== */
(function scratchInit() {
  const c = $("#scratchCanvas"), g = c.getContext("2d");
  const fill = () => {
    const r = c.getBoundingClientRect(), dpr = devicePixelRatio || 1;
    c.width = r.width * dpr; c.height = r.height * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const grad = g.createLinearGradient(0, 0, r.width, r.height);
    grad.addColorStop(0, "#8b7fd1"); grad.addColorStop(1, "#c9a9f0");
    g.fillStyle = grad; g.fillRect(0, 0, r.width, r.height);
    g.fillStyle = "rgba(255,255,255,.85)"; g.font = "700 18px Quicksand, sans-serif"; g.textAlign = "center";
    g.fillText("✨ scratch me ✨", r.width / 2, r.height / 2 + 6);
  };
  fill(); addEventListener("resize", fill);
  let drawing = false, scratched = 0, done = false;
  const pos = e => { const r = c.getBoundingClientRect(); const p = e.touches ? e.touches[0] : e; return [p.clientX - r.left, p.clientY - r.top]; };
  const scratch = e => {
    if (!drawing || done) return;
    const [x, y] = pos(e);
    g.globalCompositeOperation = "destination-out";
    g.beginPath(); g.arc(x, y, 22, 0, 7); g.fill();
    scratched++;
    if (scratched > 60) { done = true; c.style.transition = "opacity .6s"; c.style.opacity = 0; sfxChime(); confettiRain(80); }
  };
  c.addEventListener("mousedown", e => { drawing = true; scratch(e); });
  c.addEventListener("mousemove", scratch);
  addEventListener("mouseup", () => drawing = false);
  c.addEventListener("touchstart", e => { drawing = true; scratch(e); }, { passive: true });
  c.addEventListener("touchmove", e => { scratch(e); }, { passive: true });
  addEventListener("touchend", () => drawing = false);
})();

/* ===== 3D carousel: click a card to snap to it ===== */
let carRot = 0;
$("#carousel").addEventListener("click", () => {
  carRot += 60;
  $("#carouselRing").style.animation = "none";
  $("#carouselRing").style.transform = `rotateY(${-carRot}deg)`;
  sfxPop();
});

/* ===== Music visualizer (bars pulse with the synth beat) ===== */
const viz = document.createElement("div");
viz.className = "viz";
for (let i = 0; i < 32; i++) viz.appendChild(document.createElement("i"));
document.body.appendChild(viz);
const vizBars = [...viz.children];
let beatLevel = 0;
const _tone = tone;
tone = function (freq, t, dur, vol, type) { beatLevel = 1; return _tone(freq, t, dur, vol, type); };
(function animViz() {
  beatLevel *= 0.9;
  vizBars.forEach((b, i) => {
    const wave = Math.abs(Math.sin(performance.now() / 300 + i * 0.5));
    b.style.height = (8 + (wave * 0.4 + beatLevel * 0.6) * 46) + "px";
  });
  requestAnimationFrame(animViz);
})();

/* ===== Birthday wall (saved in this browser) ===== */
const WALL_KEY = "sherlin-birthday-wall";
function loadWall() { try { return JSON.parse(localStorage.getItem(WALL_KEY)) || []; } catch (e) { return []; } }
function saveWall(list) { try { localStorage.setItem(WALL_KEY, JSON.stringify(list)); } catch (e) {} }
function esc(s) { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; }
function renderWall() {
  $("#wallList").innerHTML = loadWall().map(m => `<li><b>${esc(m.name)}</b>: ${esc(m.msg)}</li>`).join("");
}
$("#wallForm").addEventListener("submit", e => {
  e.preventDefault();
  const name = $("#wallName").value.trim(), msg = $("#wallMsg").value.trim();
  if (!name || !msg) return;
  const list = loadWall(); list.unshift({ name, msg });
  saveWall(list); renderWall();
  $("#wallMsg").value = "";
  sfxChime(); burst(innerWidth / 2, innerHeight / 2, 40, 5);
});
renderWall();

/* ===== Scroll progress bar ===== */
addEventListener("scroll", () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  $("#progress").style.width = (max > 0 ? scrollY / max * 100 : 0) + "%";
}, { passive: true });

/* ===== Flip cards ===== */
$$(".flipcard").forEach(c => c.addEventListener("click", () => {
  c.classList.toggle("flipped"); sfxPop();
}));

/* ===== Heart rain ===== */
const HEARTS = ["💖", "💗", "💕", "🌸", "✨"];
$("#heartRainBtn").addEventListener("click", () => {
  for (let i = 0; i < 60; i++) {
    const h = document.createElement("div");
    h.textContent = HEARTS[i % HEARTS.length];
    h.style.cssText = `position:fixed;top:-40px;left:${Math.random() * 100}vw;font-size:${18 + Math.random() * 22}px;z-index:180;pointer-events:none;animation:heartFall ${2.5 + Math.random() * 2}s linear ${Math.random() * 0.8}s forwards`;
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 5000);
  }
  sfxChime();
});
const hs = document.createElement("style");
hs.textContent = "@keyframes heartFall{to{transform:translateY(110vh) rotate(360deg);opacity:0}}";
document.head.appendChild(hs);

/* ===== Shimmer greeting ===== */
greetEl.classList.add("shimmer");

/* ===== Mouse sparkle trail ===== */
let lastSpark = 0;
addEventListener("mousemove", e => {
  const now = performance.now();
  if (now - lastSpark < 60) return;
  lastSpark = now;
  const s = document.createElement("span");
  s.className = "cursor-spark";
  s.textContent = ["✦", "♥", "✧"][Math.floor(Math.random() * 3)];
  s.style.left = e.clientX + "px"; s.style.top = e.clientY + "px";
  s.style.color = COLORS[Math.floor(Math.random() * COLORS.length)];
  document.body.appendChild(s);
  setTimeout(() => s.remove(), 700);
});
