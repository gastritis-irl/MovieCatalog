const playerInfo = document.getElementById('player-info');
const gameBoard = document.getElementById('game-board');
const result = document.getElementById('result');
const feedbackCanvas = document.getElementById('feedback-canvas');
const ctx = feedbackCanvas.getContext('2d');

const colors = ['R', 'G', 'B', 'Y', 'P', 'O'];
const age = 25; // A játékos életkora

let attempts = 0;

playerInfo.textContent = 'Játékos: 25 éves';

function drawFeedback(correct, incorrect) {
  const yPos = attempts * 25;
  ctx.fillStyle = '#000';
  for (let i = 0; i < correct; i++) {
    ctx.fillRect(i * 25, yPos, 20, 20);
  }
  ctx.fillStyle = '#fff';
  for (let i = 0; i < incorrect; i++) {
    ctx.fillRect((i + correct) * 25, yPos, 20, 20);
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

function makeGuess() {
  const guess = [];
  for (let i = 0; i < 4; i++) {
    guess.push(gameBoard.children[i].value);
  }

  let correct = 0;
  let incorrect = 0;
  const usedIndices = new Set();

  for (let i = 0; i < 4; i++) {
    if (guess[i] === secretColors[i]) {
      correct++;
      usedIndices.add(i);
    }
  }

  for (let i = 0; i < 4; i++) {
    if (!usedIndices.has(i)) {
      for (let j = 0; j < 4; j++) {
        if (!usedIndices.has(j) && guess[i] === secretColors[j]) {
          incorrect++;
          usedIndices.add(j);
          break;
        }
      }
    }
  }

  drawFeedback(correct, incorrect);
  attempts++;

  const button = document.createElement('button');
  button.textContent = 'Tippelés';
  button.onclick = makeGuess;

  if (correct === 4) {
    result.textContent = `Nyertél! ${attempts} lépésből találtad ki.`;
    if (age < 18) {
      result.textContent += ' Jó munka!';
    } else {
      result.textContent += ' Gratulálunk!';
    }
    button.disabled = true;
  } else if (attempts === 8) {
    result.textContent = 'Vesztettél! Nem találtad ki időben.';
    button.disabled = true;
  }
}

const button = document.createElement('button');
button.textContent = 'Tippelés';
button.onclick = makeGuess;
gameBoard.appendChild(button);
