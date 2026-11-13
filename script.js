/* PERSONALIZE THESE SETTINGS */
const CONFIG = {
  passcode: "1411",              // Change this to any 4-digit PIN you choose
  birthdayDate: "2026-11-14",    // YYYY-MM-DD
  birthdayName: "Akka"
};

const $ = (id) => document.getElementById(id);
let enteredPin = "";
let audioContext = null;
let musicPlaying = false;
let musicTimer = null;
let currentStep = 0;
let steps = [];

const surpriseMessages = [
  "The universe has many stars, but there's only one you. ✨",
  "You make ordinary days feel a little more beautiful. ♡",
  "May happiness find you in the smallest, sweetest moments. 🌷",
  "You deserve every good thing this universe has to offer. 💜",
  "No matter how far life takes us, you'll always be my Akka. ✧",
  "Keep shining in your own lovely way. The world needs your light. 🌙",
  "A little reminder: you are loved more than you know. ♡"
];

/* CREATE A TWINKLING STAR FIELD */
function createStars() {
  const field = $("starField");
  for (let i = 0; i < 95; i++) {
    const star = document.createElement("span");
    star.className = "sky-star";
    star.textContent = Math.random() > 0.5 ? "✦" : "·";
    star.style.left = Math.random() * 100 + "vw";
    star.style.top = Math.random() * 100 + "vh";
    star.style.fontSize = (5 + Math.random() * 11) + "px";
    star.style.setProperty("--duration", (1.5 + Math.random() * 4) + "s");
    star.style.animationDelay = (Math.random() * 4) + "s";
    field.appendChild(star);
  }
}

/* FLOATING HEARTS */
function createFloatingHeart() {
  const heart = document.createElement("span");
  heart.className = "floating-heart";
  heart.textContent = Math.random() > 0.5 ? "♡" : "♥";
  heart.style.left = Math.random() * 100 + "vw";
  heart.style.fontSize = (12 + Math.random() * 17) + "px";
  heart.style.setProperty("--duration", (7 + Math.random() * 6) + "s");
  $("floatingLayer").appendChild(heart);
  setTimeout(() => heart.remove(), 14000);
}

/* PIN SCREEN */
function updatePinDots() {
  $("pinDots").textContent = Array.from({ length: 4 }, (_, index) => index < enteredPin.length ? "●" : "○").join(" ");
}
function addDigit(digit) {
  if (enteredPin.length >= 4) return;
  enteredPin += digit;
  updatePinDots();
  $("pinError").textContent = "";
  if (enteredPin.length === 4) setTimeout(unlock, 180);
}
function clearPin() {
  enteredPin = "";
  updatePinDots();
  $("pinError").textContent = "";
}
function unlock() {
  if (enteredPin === CONFIG.passcode) {
    $("gateScreen").classList.add("hidden");
    $("celebration").classList.remove("hidden");
    initSteps();
    updateCountdown();
    setInterval(updateCountdown, 1000);
    burstConfetti(65);
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    $("pinError").textContent = "That isn't the secret code. Try once more, Akka ♡";
    enteredPin = "";
    updatePinDots();
  }
}

$("keypad").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.digit !== undefined) addDigit(button.dataset.digit);
  if (button.dataset.action === "clear") clearPin();
  if (button.dataset.action === "unlock") unlock();
});
$("unlockButton").addEventListener("click", unlock);
document.addEventListener("keydown", (event) => {
  if ($("gateScreen").classList.contains("hidden")) return;
  if (/^[0-9]$/.test(event.key)) addDigit(event.key);
  if (event.key === "Backspace") clearPin();
  if (event.key === "Enter") unlock();
});

/* COUNTDOWN TO 14 NOVEMBER 2026 */
function updateCountdown() {
  const [year, month, day] = CONFIG.birthdayDate.split("-").map(Number);
  const target = new Date(year, month - 1, day, 0, 0, 0);
  const now = new Date();
  let difference = target - now;
  if (difference <= 0) {
    $("countdownHeading").textContent = "Your special day is here!";
    $("countdownSub").textContent = "Let the birthday magic begin, Akka! ✨";
    $("days").textContent = "00"; $("hours").textContent = "00";
    $("minutes").textContent = "00"; $("seconds").textContent = "00";
    return;
  }
  $("countdownHeading").textContent = "Counting down to your day";
  $("countdownSub").textContent = "Every second brings us closer to celebrating you.";
  const days = Math.floor(difference / 86400000); difference %= 86400000;
  const hours = Math.floor(difference / 3600000); difference %= 3600000;
  const minutes = Math.floor(difference / 60000); difference %= 60000;
  const seconds = Math.floor(difference / 1000);
  $("days").textContent = String(days).padStart(2, "0");
  $("hours").textContent = String(hours).padStart(2, "0");
  $("minutes").textContent = String(minutes).padStart(2, "0");
  $("seconds").textContent = String(seconds).padStart(2, "0");
}

/* ONE SCREEN AT A TIME + A LITTLE MESSAGE ON EVERY SCREEN */
function initSteps() {
  steps = Array.from(document.querySelectorAll("#celebration .journey-step"));
  const nav = document.createElement("nav");
  nav.className = "step-nav";
  nav.setAttribute("aria-label", "Birthday journey navigation");
  nav.innerHTML = '<button type="button" class="step-btn" id="stepBack">← Back</button>' +
    '<span class="step-dots" id="stepDots" aria-label="Journey progress"></span>' +
    '<button type="button" class="step-btn step-next" id="stepNext">Next →</button>';
  document.body.appendChild(nav);
  $("stepDots").innerHTML = steps.map(() => "<i></i>").join("");
  $("stepBack").addEventListener("click", () => goToStep(currentStep - 1));
  $("stepNext").addEventListener("click", () => goToStep(currentStep + 1));
  $("startButton").addEventListener("click", () => { goToStep(1); burstConfetti(35); });
  $("topButton").addEventListener("click", () => goToStep(0));
  goToStep(0);
}
function goToStep(index) {
  if (!steps.length) return;
  currentStep = Math.max(0, Math.min(steps.length - 1, index));
  steps.forEach((section, i) => {
    section.classList.toggle("step-hidden", i !== currentStep);
    if (i === currentStep) {
      section.classList.remove("step-in");
      void section.offsetWidth;
      section.classList.add("step-in");
      const note = section.querySelector(".surprise-text");
      if (note) note.textContent = section.dataset.surprise || surpriseMessages[currentStep % surpriseMessages.length];
    }
  });
  document.querySelectorAll("#stepDots i").forEach((dot, i) => dot.classList.toggle("on", i === currentStep));
  $("stepBack").style.visibility = currentStep === 0 ? "hidden" : "visible";
  $("stepNext").style.visibility = currentStep === steps.length - 1 ? "hidden" : "visible";
  window.scrollTo({ top: 0, behavior: "smooth" });
}
document.addEventListener("keydown", (event) => {
  if (!steps.length || $("celebration").classList.contains("hidden")) return;
  if (event.key === "ArrowRight") goToStep(currentStep + 1);
  if (event.key === "ArrowLeft") goToStep(currentStep - 1);
});

/* SECRET STAR MESSAGES */
document.querySelectorAll(".message-star").forEach((star) => {
  star.addEventListener("click", () => {
    $("starMessage").textContent = star.dataset.message;
    burstConfetti(12);
  });
});

/* ANIMATED GIFT BOX */
$("giftBox").addEventListener("click", () => {
  $("giftBox").classList.add("opened");
  $("giftMessage").classList.remove("hidden");
  $("giftHint").textContent = "Surprise unlocked! A little love, just for you. 💗";
  burstConfetti(45);
});

/* MAGICAL LETTER OPENING */
$("openLetterButton").addEventListener("click", () => {
  $("letterEnvelope").classList.add("opened");
  $("letterPaper").classList.remove("hidden");
  $("openLetterButton").classList.add("hidden");
  burstConfetti(28);
});

/* INTERACTIVE BIRTHDAY CAKE */
$("blowButton").addEventListener("click", () => {
  document.querySelector(".cake-scene").classList.add("blown");
  $("wishText").textContent = "Your wish has been sent to the stars. May it come true! ✨";
  $("finalMessage").classList.remove("hidden");
  $("blowButton").textContent = "Your wish is on its way ♡";
  $("blowButton").disabled = true;
  burstConfetti(100);
});

/* CONFETTI / SPARKLE BURST */
function burstConfetti(count = 50) {
  const layer = $("sparkleLayer");
  const symbols = ["✦", "✧", "♡", "✿", "✨", "💗"];
  for (let i = 0; i < count; i++) {
    const piece = document.createElement("span");
    piece.className = "sparkle";
    piece.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.top = (-5 - Math.random() * 25) + "px";
    piece.style.fontSize = (12 + Math.random() * 18) + "px";
    piece.style.setProperty("--duration", (3 + Math.random() * 3) + "s");
    layer.appendChild(piece);
    setTimeout(() => piece.remove(), 6500);
  }
}

/* ORIGINAL SOFT BELL-LIKE BACKGROUND MELODY USING WEB AUDIO API */
function playNote(frequency, start, duration, volume = 0.03) {
  if (!audioContext) return;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  oscillator.connect(gain); gain.connect(audioContext.destination);
  oscillator.start(start); oscillator.stop(start + duration + 0.04);
}
function startMusic() {
  const melody = [523.25,659.25,783.99,659.25,587.33,698.46,880,698.46,523.25,659.25,783.99,1046.5];
  let index = 0;
  const playBar = () => {
    if (!musicPlaying || !audioContext) return;
    const now = audioContext.currentTime;
    playNote(melody[index % melody.length], now, 0.48, 0.025);
    if (index % 4 === 0) playNote(melody[index % melody.length] / 2, now, 0.65, 0.012);
    index++;
  };
  playBar();
  musicTimer = setInterval(playBar, 430);
}
$("musicButton").addEventListener("click", async () => {
  try {
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) { showToast("This browser does not support the music feature."); return; }
      audioContext = new AudioContextClass();
    }
    if (audioContext.state === "suspended") await audioContext.resume();
    musicPlaying = !musicPlaying;
    if (musicPlaying) {
      startMusic();
      $("musicButton").innerHTML = "♫ <span>Pause music</span>";
      $("musicButton").setAttribute("aria-pressed", "true");
    } else {
      clearInterval(musicTimer);
      $("musicButton").innerHTML = "♫ <span>Play music</span>";
      $("musicButton").setAttribute("aria-pressed", "false");
    }
  } catch (error) { showToast("Tap the music button once more to start the tune."); }
});

function showToast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  setTimeout(() => $("toast").classList.remove("show"), 2600);
}

/* START THE BACKGROUND DECORATIONS */
createStars();
setInterval(createFloatingHeart, 950);
