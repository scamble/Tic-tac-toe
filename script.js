const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('status-display');
const resetBtn = document.getElementById('reset-btn');
const modeSelect = document.getElementById('mode-select');

let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let gameMode = 'pvp';

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

function initGame() {
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'winner');
    });
    resetBtn.addEventListener('click', resetGame);
    modeSelect.addEventListener('change', handleModeChange);
    
    statusDisplay.textContent = `Player ${currentPlayer}'s turn`;
    statusDisplay.style.color = 'var(--text-color)';
}

function handleCellClick(e) {
    const clickedCell = e.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (board[clickedCellIndex] !== '' || !gameActive) {
        return;
    }

    handlePlayerMove(clickedCell, clickedCellIndex);
}

function handlePlayerMove(clickedCell, index) {
    board[index] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    clickedCell.classList.add(currentPlayer.toLowerCase());

    checkWinOrDraw();

    if (gameActive) {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateStatus();

        if (currentPlayer === 'O' && gameMode.startsWith('ai')) {
            gameActive = false;
            setTimeout(makeAIMove, 500);
        }
    }
}

function updateStatus() {
    statusDisplay.textContent = currentPlayer === 'O' && gameMode.startsWith('ai') 
        ? "AI is thinking..." 
        : `Player ${currentPlayer}'s turn`;
}

function checkWinOrDraw() {
    let roundWon = false;
    let winningCells = [];

    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            roundWon = true;
            winningCells = [a, b, c];
            break;
        }
    }

    if (roundWon) {
        announceWinner(winningCells);
        gameActive = false;
        return;
    }

    if (!board.includes('')) {
        announceDraw();
        gameActive = false;
        return;
    }
}

function announceWinner(winningCells) {
    const winnerMessage = (currentPlayer === 'O' && gameMode.startsWith('ai')) ? 'AI Wins!' : `Player ${currentPlayer} Wins!`;
    statusDisplay.textContent = winnerMessage;
    statusDisplay.style.color = currentPlayer === 'X' ? 'var(--x-color)' : 'var(--o-color)';
    
    winningCells.forEach(index => {
        cells[index].classList.add('winner');
    });
}

function announceDraw() {
    statusDisplay.textContent = 'Game ended in a Draw!';
    statusDisplay.style.color = 'var(--text-color)';
}

function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'winner');
    });
    
    updateStatus();
    statusDisplay.style.color = 'var(--text-color)';
}

function handleModeChange(e) {
    gameMode = e.target.value;
    resetGame();
}

function makeAIMove() {
    if (!board.includes('')) return;

    let moveIndex;

    switch (gameMode) {
        case 'ai-easy':
            moveIndex = getRandomMove();
            break;
        case 'ai-medium':
            moveIndex = Math.random() < 0.5 ? getRandomMove() : getBestMove();
            break;
        case 'ai-hard':
            moveIndex = getBestMove();
            break;
        default:
            moveIndex = getRandomMove();
    }

    gameActive = true;
    if (moveIndex !== undefined && moveIndex !== -1) {
        handlePlayerMove(cells[moveIndex], moveIndex);
    }
}

function getRandomMove() {
    const availableCells = board.map((val, index) => val === '' ? index : null).filter(val => val !== null);
    const randomIndex = Math.floor(Math.random() * availableCells.length);
    return availableCells[randomIndex];
}

function getBestMove() {
    let bestScore = -Infinity;
    let move = -1;

    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            let score = minimax(board, 0, false);
            board[i] = '';
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

const scores = {
    'O': 10,
    'X': -10,
    'tie': 0
};

function minimax(newBoard, depth, isMaximizing) {
    let result = checkWinnerForMinimax();
    if (result !== null) {
        return scores[result] - depth;
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (newBoard[i] === '') {
                newBoard[i] = 'O';
                let score = minimax(newBoard, depth + 1, false);
                newBoard[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (newBoard[i] === '') {
                newBoard[i] = 'X';
                let score = minimax(newBoard, depth + 1, true);
                newBoard[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinnerForMinimax() {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    if (!board.includes('')) return 'tie';
    return null;
}

initGame();
