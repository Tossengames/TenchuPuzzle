let level = 1;
let gridSize = 2;
let pieces = [];
let dragged = null;
let timer = null;
let timeLeft = 0;
let shuffleTriggered = false;

const imagePool = [
  "images/img1.jpg",
  "images/img2.jpg"
];

// ===== SCREEN UTILS =====
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// ===== GAME START =====
function startGame() {
  level = 1;
  showDialogue("Let's see how long you last.", setupLevel);
}

// ===== LEVEL SETUP =====
function setupLevel() {
  shuffleTriggered = false;
  gridSize = level < 4 ? 2 : level < 8 ? 3 : 4;
  showScreen("gameScreen");
  document.getElementById("levelText").textContent = `Level ${level}`;

  if (level % 3 === 0) {
    startTimer(30);
  } else {
    stopTimer();
  }

  loadImage().then(img => createPuzzle(img));
}

// ===== IMAGE LOAD WITH FALLBACK =====
function loadImage() {
  return new Promise(resolve => {
    const img = new Image();
    const src = imagePool[Math.floor(Math.random() * imagePool.length)];

    img.onload = () => resolve(src);
    img.onerror = () => resolve(createPlaceholder());

    img.src = src;
  });
}

function createPlaceholder() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 300;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#444";
  ctx.fillRect(0,0,300,300);
  ctx.fillStyle = "#888";
  ctx.font = "30px sans-serif";
  ctx.fillText("NO IMAGE", 70, 160);
  return canvas.toDataURL();
}

// ===== PUZZLE =====
function createPuzzle(imgSrc) {
  const puzzle = document.getElementById("puzzle");
  puzzle.innerHTML = "";
  puzzle.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  pieces = [];

  for (let i = 0; i < gridSize * gridSize; i++) {
    pieces.push(i);
  }

  shuffleArray(pieces);

  pieces.forEach((val, index) => {
    const piece = document.createElement("div");
    piece.className = "piece";
    piece.draggable = true;
    piece.dataset.correct = val;
    piece.dataset.index = index;

    const x = (val % gridSize) * -100;
    const y = Math.floor(val / gridSize) * -100;

    piece.style.backgroundImage = `url(${imgSrc})`;
    piece.style.backgroundPosition = `${x}px ${y}px`;
    piece.style.width = piece.style.height = `${300 / gridSize}px`;

    piece.ondragstart = () => dragged = piece;
    piece.ondragover = e => e.preventDefault();
    piece.ondrop = () => swapPieces(piece);

    puzzle.appendChild(piece);
  });

  setTimeout(triggerShuffleCheck, 4000);
}

function swapPieces(target) {
  if (!dragged || dragged === target) return;

  const a = dragged.style.backgroundPosition;
  dragged.style.backgroundPosition = target.style.backgroundPosition;
  target.style.backgroundPosition = a;

  const c = dragged.dataset.correct;
  dragged.dataset.correct = target.dataset.correct;
  target.dataset.correct = c;

  checkWin();
}

// ===== SHUFFLE HANDICAP =====
function triggerShuffleCheck() {
  if (shuffleTriggered) return;
  shuffleTriggered = true;

  showDialogue(
    "I'm about to shuffle everything. Feeling lucky?",
    () => {
      showDialogueButtons([
        { text: "Accept Chaos", action: shufflePuzzle },
        { text: "Try Luck", action: () => showScreen("gambleScreen") }
      ]);
    }
  );
}

function shufflePuzzle() {
  showScreen("gameScreen");
  const puzzle = document.getElementById("puzzle");
  const children = Array.from(puzzle.children);
  shuffleArray(children);
  children.forEach(c => puzzle.appendChild(c));
}

// ===== GAMBLE =====
function resolveGamble(choice) {
  showScreen("dialogueScreen");
  const result = Math.random() < 0.5 ? "heads" : "tails";
  if (choice === result) {
    showDialogue("Luck is on your side. No shuffle.", () => showScreen("gameScreen"));
  } else {
    showDialogue("Bad choice. Chaos time.", shufflePuzzle);
  }
}

// ===== WIN / LOSE =====
function checkWin() {
  const pieces = document.querySelectorAll(".piece");
  for (let p of pieces) {
    if (parseInt(p.dataset.correct) !== [...p.parentNode.children].indexOf(p)) return;
  }
  stopTimer();
  showScreen("winScreen");
}

function nextLevel() {
  level++;
  setupLevel();
}

function startTimer(seconds) {
  stopTimer();
  timeLeft = seconds;
  document.getElementById("timerText").textContent = timeLeft;

  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("timerText").textContent = timeLeft;
    if (timeLeft <= 0) {
      stopTimer();
      showScreen("loseScreen");
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
  document.getElementById("timerText").textContent = "";
}

// ===== DIALOGUE =====
function showDialogue(text, callback) {
  showScreen("dialogueScreen");
  document.getElementById("dialogueText").textContent = text;
  showDialogueButtons([{ text: "Continue", action: callback }]);
}

function showDialogueButtons(buttons) {
  const box = document.getElementById("dialogueButtons");
  box.innerHTML = "";
  buttons.forEach(b => {
    const btn = document.createElement("button");
    btn.textContent = b.text;
    btn.onclick = b.action;
    box.appendChild(btn);
  });
}

// ===== UTIL =====
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}