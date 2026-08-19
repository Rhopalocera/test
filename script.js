const SIZE = 11;
const TARGET_SIZE = 7;
const STEPS = 12;
const start = { row: 5, col: 5, direction: 0 };
const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];
const boardElement = document.querySelector('#board');
const targetElement = document.querySelector('#targetBoard');
const resultElement = document.querySelector('#result');
let state;
let history = [];
let currentStep = 0;
let rules = { black: ['none', 'none', 'none'], white: ['none', 'none', 'none'] };
const hiddenSolution = createPuzzleRules();

function makeGrid(element, size, cellClass) {
  element.innerHTML = '';
  for (let index = 0; index < size * size; index += 1) {
    const cell = document.createElement('div');
    cell.className = cellClass;
    cell.dataset.index = index;
    element.appendChild(cell);
  }
}

function targetPattern(solution) {
  const colors = new Set();
  let row = start.row; let col = start.col; let direction = start.direction;
  for (let step = 0; step < STEPS; step += 1) {
    const key = `${row},${col}`;
    const isBlack = colors.has(key);
    const commands = isBlack ? solution.black : solution.white;
    commands.forEach((command) => {
      if (command === 'left') direction = (direction + 3) % 4;
      if (command === 'right') direction = (direction + 1) % 4;
      if (command === 'straight') {
        row += directions[direction][0];
        col += directions[direction][1];
      }
    });
    if (isBlack) colors.delete(key); else colors.add(key);
    if (row < 0 || row >= SIZE || col < 0 || col >= SIZE) return null;
  }
  return colors;
}

function createPuzzleRules() {
  const commandOptions = ['left', 'right', 'straight', 'none'];
  const makeSequence = () => {
    const length = Math.floor(Math.random() * 4);
    return Array.from({ length }, () => commandOptions[Math.floor(Math.random() * commandOptions.length)]);
  };
  let puzzle;
  let pattern;
  do {
    puzzle = { black: makeSequence(), white: makeSequence() };
    pattern = targetPattern(puzzle);
  } while (!pattern || pattern.size === 0 || [...pattern].some((key) => {
    const [row, col] = key.split(',').map(Number);
    return row < 2 || row > 8 || col < 2 || col > 8;
  }));
  return puzzle;
}

const target = targetPattern(hiddenSolution);
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
  history = [snapshot(state)];
  for (let stepIndex = 0; stepIndex < STEPS; stepIndex += 1) {
    step();
    history.push(snapshot(state));
  }
  currentStep = 0;
  state = snapshot(history[0]);
  resultElement.textContent = '';
  resultElement.className = 'result';
  render();
}

function snapshot(source) {
  return { row: source.row, col: source.col, direction: source.direction, blackCells: new Set(source.blackCells), steps: source.steps };
}

function render() {
  [...boardElement.children].forEach((cell, index) => {
    const row = Math.floor(index / SIZE); const col = index % SIZE;
    cell.className = 'cell';
    if (state.blackCells.has(`${row},${col}`)) cell.classList.add('black');
    if (row === state.row && col === state.col) cell.classList.add('ant');
  });
  document.querySelector('#directionLabel').textContent = ['N', 'E', 'S', 'W'][state.direction];
  document.querySelector('#currentStep').textContent = String(currentStep).padStart(2, '0');
}

function step() {
  const key = `${state.row},${state.col}`;
  const color = state.blackCells.has(key) ? 'black' : 'white';
  if (state.blackCells.has(key)) state.blackCells.delete(key); else state.blackCells.add(key);
  rules[color].forEach((command) => {
    if (command === 'left') state.direction = (state.direction + 3) % 4;
    if (command === 'right') state.direction = (state.direction + 1) % 4;
    if (command === 'straight') {
      state.row += directions[state.direction][0];
      state.col += directions[state.direction][1];
    }
  });
  state.steps += 1;
}

function run() {
  currentStep = STEPS;
  state = snapshot(history[currentStep]);
  render();
  const matches = [...state.blackCells].every((key) => target.has(key)) && [...target].every((key) => state.blackCells.has(key));
  resultElement.textContent = matches ? '✓ PATTERN MATCHED / MISSION COMPLETE' : '× NOT YET / ADJUST THE RULES';
  resultElement.classList.add(matches ? 'success' : 'fail');
}

makeGrid(boardElement, SIZE, 'cell');
renderTarget(); reset();
const commandCycle = ['none', 'left', 'right', 'straight'];
const commandDisplay = { none: '×', left: '↶', right: '↷', straight: '↑' };
const commandNames = { none: 'なし', left: '左回転', right: '右回転', straight: '直進' };
document.querySelectorAll('.command-slots').forEach((slotGroup) => slotGroup.addEventListener('click', (event) => {
  const slot = event.target.closest('.command-slot');
  if (!slot) return;
  const nextIndex = (commandCycle.indexOf(slot.dataset.command) + 1) % commandCycle.length;
  const nextCommand = commandCycle[nextIndex];
  slot.dataset.command = nextCommand;
  slot.textContent = commandDisplay[nextCommand];
  slot.title = commandNames[nextCommand];
  slot.setAttribute('aria-label', `${slotGroup.dataset.color === 'black' ? '黒' : '白'}タイルの命令: ${commandNames[nextCommand]}`);
  rules[slotGroup.dataset.color] = [...slotGroup.querySelectorAll('.command-slot')].map((button) => button.dataset.command);
  reset();
}));
document.querySelector('#runButton').addEventListener('click', run);
document.querySelector('#resetButton').addEventListener('click', reset);
document.querySelector('#resetTop').addEventListener('click', reset);
document.querySelector('#previousStep').addEventListener('click', () => {
  currentStep = (currentStep - 1 + STEPS + 1) % (STEPS + 1);
  state = snapshot(history[currentStep]);
  resultElement.textContent = '';
  resultElement.className = 'result';
  render();
});
document.querySelector('#nextStep').addEventListener('click', () => {
  currentStep = (currentStep + 1) % (STEPS + 1);
  state = snapshot(history[currentStep]);
  resultElement.textContent = '';
  resultElement.className = 'result';
  render();
});