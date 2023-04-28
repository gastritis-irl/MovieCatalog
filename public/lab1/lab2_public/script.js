const playerInfo = document.getElementById('player-info');
const gameBoard = document.getElementById('game-board');
const result = document.getElementById('result');
const feedbackCanvas = document.getElementById('feedback-canvas');
const ctx = feedbackCanvas.getContext('2d');

const colors = ['R', 'G', 'B', 'Y', 'P', 'O'];
let attempts = 0;

const ageForm = document.getElementById('age-form');
const ageInput = document.getElementById('age-input');

let age = null;

ageForm.addEventListener('submit', (event) => {
  event.preventDefault();
  age = parseInt(ageInput.value, 10);
  playerInfo.textContent = `Játékos: ${age} éves`;
  ageForm.style.display = 'none';
});

function drawFeedback(correct, incorrect) {
  const yPos = attempts * 25;
  for (let i = 0; i < correct; i++) {
    ctx.fillStyle = '#fff'; // Fehér szín a helyes találatokhoz
    ctx.fillRect(i * 25, yPos, 20, 20);
  }
  for (let i = correct; i < correct + incorrect; i++) {
    ctx.fillStyle = '#000'; // Fekete szín a helytelen találatokhoz
    ctx.fillRect(i * 25, yPos, 20, 20);
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function generateSecretColors() {
  const secret = [];
  const shuffledColors = shuffleArray(colors.slice());
  for (let i = 0; i < 4; i++) {
    secret.push(shuffledColors[i]);
  }
  return secret;
}

const secretColors = generateSecretColors();

for (let i = 0; i < 4; i++) {
  const select = document.createElement('select');
  colors.forEach((color) => {
    const option = document.createElement('option');
    option.textContent = color;
    select.appendChild(option);
  });
  gameBoard.appendChild(select);
}

function getCorrectIndices(guess, colorsToGuess) {
  const correctIndices = new Set();
  for (let i = 0; i < 4; i++) {
    if (guess[i] === colorsToGuess[i]) {
      correctIndices.add(i);
    }
  }
  return correctIndices;
}

function countIncorrectGuesses(guess, colorsToGuess, correctIndices) {
  let incorrect = 0;
  const guessColorCount = {};
  const colorsToGuessCount = {};

  for (let i = 0; i < 4; i++) {
    if (!correctIndices.has(i)) {
      guessColorCount[guess[i]] = (guessColorCount[guess[i]] || 0) + 1;
      colorsToGuessCount[colorsToGuess[i]] = (colorsToGuessCount[colorsToGuess[i]] || 0) + 1;
    }
  }

  Object.keys(guessColorCount).forEach((color) => {
    if (colorsToGuessCount[color]) {
      incorrect += Math.min(guessColorCount[color], colorsToGuessCount[color]);
    }
  });

  return incorrect;
}

const button = document.createElement('button');

function makeGuess() {
  const guess = [];
  for (let i = 0; i < 4; i++) {
    guess.push(gameBoard.children[i].value);
  }

  const correctIndices = getCorrectIndices(guess, secretColors);
  const correct = correctIndices.size;
  const incorrect = countIncorrectGuesses(guess, secretColors, correctIndices);

  drawFeedback(correct, incorrect);
  attempts++;

  const guessButton = button;

  if (correct === 4) {
    result.textContent = `Nyertél! ${attempts} lépésből találtad ki.`;
    if (age < 18) {
      result.textContent += ' Jó munka!';
    } else {
      result.textContent += ' Gratulálunk!';
    }
    guessButton.disabled = true;
    return; // Hozzáadjuk ezt a sort, hogy megálljon a függvény végrehajtása, ha a játékos nyert
  }

  if (attempts === 8) {
    result.textContent = 'Vesztettél! Nem találtad ki időben.';
    guessButton.disabled = true;
  }
}

button.textContent = 'Tippelés';
button.onclick = makeGuess;
gameBoard.appendChild(button);
