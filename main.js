let level = 1;
let gridSize = 4;
let tiles = [];
let selectedTile = null;
let timer = null;
let timeLeft = 0;
let shuffleUsed = false;

const imagePool = [
  "images/img1.jpg",
  "images/img2.jpg",
  "images/img3.jpg"
];

// ---------- SCREEN ----------
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// ---------- START ----------
function startGame() {
  level = 1;
  showDialogue("Let’s see if you can handle chaos.", setupLevel);
}

// ---------- LEVEL ----------
function setupLevel() {
  shuffleUsed = false;
  gridSize = Math.max(4, 3 + Math.floor(level / 3));
  showScreen("gameScreen");
  document.getElementById("levelText").textContent = `Level ${level}`;

  if (level % 3 === 0) startTimer(45);
  else stopTimer();

  loadImage().then(src => createPuzzle(src));

  setTimeout(triggerShuffle, 5000);
}

// ---------- IMAGE ----------
function loadImage() {
  return new Promise(resolve => {
    if (imagePool.length === 0) {
      resolve(makePlaceholder());
      return;
    }

    const src = imagePool[Math.floor(Math.random() * imagePool.length)];
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => resolve(makePlaceholder());
    img.src = src;
  });
}

function makePlaceholder() {
  const c = document.createElement("canvas");
  c.width = c.height = 320;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#444";
  ctx.fillRect(0, 0, 320, 320);
  ctx.fillStyle = "#aaa";
  ctx.font = "28px Arial";
  ctx.fillText("PLACEHOLDER", 60, 170);
  return c.toDataURL();
}

// ---------- PUZZLE ----------
function createPuzzle(img) {
  const puzzle = document.getElementById("puzzle");
  puzzle.innerHTML = "";
  puzzle.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

  tiles = [];

  for (let i = 0; i < gridSize * gridSize; i++) {
    tiles.push(i);
  }

  shuffleArray(tiles);

  tiles.forEach(pos => {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.dataset.correct = pos;

    const size = 320 / gridSize;
    const x = (pos % gridSize) * -size;
    const y = Math.floor(pos / gridSize) * -size;

    tile.style.backgroundImage = `url(${img})`;
    tile.style.backgroundPosition = `${x}px ${y}px`;

    tile.onclick = () => selectTile(tile);
    puzzle.appendChild(tile);
  });
}

// ---------- TAP SWAP ----------
function selectTile(tile) {
  if (!selectedTile) {
    selectedTile = tile;
    tile.classList.add("selected");
  } else if (tile !== selectedTile) {
    swapTiles(selectedTile, tile);
    selectedTile.classList.remove("selected");
    selectedTile = null;
    checkWin();
  }
}

function swapTiles(a, b) {
  const temp = a.style.backgroundPosition;
  a.style.backgroundPosition = b.style.backgroundPosition;
  b.style.backgroundPosition = temp;

  const d = a.dataset.correct;
  a.dataset.correct = b.dataset.correct;
  b.dataset.correct = d;
}

// ---------- SHUFFLE ----------
function triggerShuffle() {
  if (shuffleUsed) return;
  shuffleUsed = true;

  showDialogue(
    "I’m about to shuffle everything. Try your luck?",
    () => {
      showDialogueButtons([
        { text: "Accept Chaos", action: shuffleAll },
        { text: "Try Luck", action: () => showScreen("gambleScreen") }
      ]);
    }
  );
}

function shuffleAll() {
  showScreen("gameScreen");
  const puzzle = document.getElementById("puzzle");
  const list = Array.from(puzzle.children);
  shuffleArray(list);
  list.forEach(t => puzzle.appendChild(t));
}

// ---------- GAMBLE ----------
function resolveGamble(choice) {
  const result = Math.random() < 0.5 ? "heads" : "tails";
  if (choice === result) {
    showDialogue("Luck saved you… this time.", () => showScreen("gameScreen"));
  } else {
    showDialogue("Bad luck. Chaos wins.", shuffleAll);
  }
}

// ---------- WIN ----------
function checkWin() {
  const puzzle = document.getElementById("puzzle");
  const children = Array.from(puzzle.children);

  for (let i = 0; i < children.length; i++) {
    if (parseInt(children[i].dataset.correct) !== i) return;
  }

  stopTimer();
  showScreen("winScreen");
}

function nextLevel() {
  level++;
  setupLevel();
}

// ---------- TIMER ----------
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

// ---------- DIALOGUE ----------
function showDialogue(text, next) {
  showScreen("dialogueScreen");
  document.getElementById("dialogueText").textContent = text;
  showDialogueButtons([{ text: "Continue", action: next }]);
}

function showDialogueButtons(btns) {
  const box = document.getElementById("dialogueButtons");
  box.innerHTML = "";
  btns.forEach(b => {
    const btn = document.createElement("button");
    btn.textContent = b.text;
    btn.onclick = b.action;
    box.appendChild(btn);
  });
}

// ---------- UTIL ----------
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}