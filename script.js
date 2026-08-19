const SIZE = 11;
const TARGET_SIZE = 7;
const STEPS = 12;
const start = { row: 5, col: 5, direction: 0 };
const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];
const boardElement = document.querySelector('#board');
const targetElement = document.querySelector('#targetBoard');
const resultElement = document.querySelector('#result');
let state;
let rules = { black: 'left', white: 'right' };

function makeGrid(element, size, cellClass) {
  element.innerHTML = '';
  for (let index = 0; index < size * size; index += 1) {
    const cell = document.createElement('div');
    cell.className = cellClass;
    cell.dataset.index = index;
    element.appendChild(cell);
  }
}

function targetPattern() {
  const pattern = new Set();
  let row = start.row; let col = start.col; let direction = start.direction;
  const colors = new Set();
  for (let step = 0; step < STEPS; step += 1) {
    const key = `${row},${col}`;
    const isBlack = colors.has(key);
    pattern.add(key);
    if (isBlack) direction = (direction + 3) % 4;
    else direction = (direction + 1) % 4;
    if (isBlack) colors.delete(key); else colors.add(key);
    row += directions[direction][0]; col += directions[direction][1];
  }
  return pattern;
}

const target = targetPattern();
function renderTarget() {
  makeGrid(targetElement, TARGET_SIZE, 'target-cell');
  target.forEach((key) => {
    const [row, col] = key.split(',').map(Number);
    const targetRow = row - 2; const targetCol = col - 2;
    if (targetRow >= 0 && targetRow < TARGET_SIZE && targetCol >= 0 && targetCol < TARGET_SIZE) targetElement.children[targetRow * TARGET_SIZE + targetCol].classList.add('black');
  });
}

function reset() {
  state = { row: start.row, col: start.col, direction: start.direction, blackCells: new Set(), steps: 0 };
  resultElement.textContent = '';
  resultElement.className = 'result';
  render();
}

function render() {
  [...boardElement.children].forEach((cell, index) => {
    const row = Math.floor(index / SIZE); const col = index % SIZE;
    cell.className = 'cell';
    if (state.blackCells.has(`${row},${col}`)) cell.classList.add('black');
    if (row === state.row && col === state.col) cell.classList.add('ant');
  });
  document.querySelector('#directionLabel').textContent = ['N', 'E', 'S', 'W'][state.direction];
}

function step() {
  const key = `${state.row},${state.col}`;
  const color = state.blackCells.has(key) ? 'black' : 'white';
  state.direction = rules[color] === 'left' ? (state.direction + 3) % 4 : (state.direction + 1) % 4;
  if (state.blackCells.has(key)) state.blackCells.delete(key); else state.blackCells.add(key);
  state.row += directions[state.direction][0]; state.col += directions[state.direction][1]; state.steps += 1;
}

function run() {
  reset();
  for (let stepIndex = 0; stepIndex < STEPS; stepIndex += 1) step();
  render();
  const matches = [...state.blackCells].every((key) => target.has(key)) && [...target].every((key) => state.blackCells.has(key));
  resultElement.textContent = matches ? '✓ PATTERN MATCHED / MISSION COMPLETE' : '× NOT YET / ADJUST THE RULES';
  resultElement.classList.add(matches ? 'success' : 'fail');
}

makeGrid(boardElement, SIZE, 'cell');
renderTarget(); reset();
document.querySelectorAll('.turn-button').forEach((button) => button.addEventListener('click', () => {
  const { color, turn } = button.dataset; rules[color] = turn;
  document.querySelectorAll(`[data-color="${color}"]`).forEach((item) => item.classList.toggle('active', item === button));
  document.querySelector(`#${color}Turn`).textContent = `TURN ${turn.toUpperCase()}`;
}));
document.querySelector('#runButton').addEventListener('click', run);
document.querySelector('#resetButton').addEventListener('click', reset);
document.querySelector('#resetTop').addEventListener('click', reset);