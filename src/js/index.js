
const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");
let gameRunning = false;
const BASE_DROP_INTERVAL = 1000; // 1000 мс или 1 секунда
let dropInterval = BASE_DROP_INTERVAL;
let score = 0;
let level = 1;
context.scale(30, 30); // масштабируем каждый блок

function arenaSweep() {
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        score += 10 * level;
        
    }
}

function updateScore() {
    document.getElementById('score').textContent = "Score: " + score;
    document.getElementById('level').textContent = "Level: " + level;

    if (score >= level * 100) {
        level++;
        dropInterval = BASE_DROP_INTERVAL - (50 * level); // Уменьшаем интервал на 50 мс за каждый уровень
        if (dropInterval < 100) dropInterval = 100; // Задаем минимальный интервал, чтобы фигуры не падали слишком быстро
    }
}




function collide(arena, player) {
    for (let y = 0; y < player.matrix.length; ++y) {
        for (let x = 0; x < player.matrix[y].length; ++x) {
            if (player.matrix[y][x] !== 0 &&
                (arena[y + player.pos.y] &&
                arena[y + player.pos.y][x + player.pos.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function endGame() {
    gameRunning = false;
    document.getElementById("endBtn").style.display = "none";
    document.getElementById("startBtn").style.display = "none";
    document.getElementById("endScreen").style.display = "block";
}


function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type) {
    if (type === 'T') {
        return [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0],
        ];
    } else if (type === 'O') {
        return [
            [2, 2],
            [2, 2],
        ];
    } else if (type === 'L') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3],
        ];
    } else if (type === 'J') {
        return [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0],
        ];
    } else if (type === 'I') {
        return [
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'Z') {
        return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0],
        ];
    }
}
const colors = [
    null,
    'purple', // T
    'yellow', // O
    'orange', // L
    'blue',   // J
    'cyan',   // I
    'green',  // S
    'red'     // Z
];

function draw() {
    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}

function rotate(matrix, dir) {
    // Транспонирование матрицы
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }

    // Если направление вращения положительное, обратим каждую строку
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}


function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x,
                                 y + offset.y,
                                 1, 1);
            }
        });
    });
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);

        if (player.pos.y === 0) { // Если фигура зафиксирована у верхнего края поля
            endGame();
            return;
        }

        updateScore()
        playerReset();
        arenaSweep();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerReset() {
    const pieces = 'TOLJISZ';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                   (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        endGame();
    }
}


let dropCounter = 0;
let lastTime = 0;

function update(time = 0) {
    if (!gameRunning) return;

    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
        dropCounter = 0;
    }
    
    draw();
    requestAnimationFrame(update);
}

const arena = createMatrix(10, 20);

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
};

document.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
        playerMove(-1);
    } else if (event.key === 'ArrowRight') {
        playerMove(1);
    } else if (event.key === 'ArrowDown') {
        playerDrop();
    } else if (event.key === 'ArrowUp') {
        playerRotate(1);
    }
});

document.getElementById("startBtn").addEventListener("click", function() {
    if (!gameRunning) {
        gameRunning = true;
        playerReset(); 
        score = 0;    
        level = 1;    
        dropInterval = BASE_DROP_INTERVAL;
        document.getElementById("endBtn").style.display = "block";  // Показать кнопку "Завершить игру"
        document.getElementById("startBtn").style.display = "none"; // Скрыть кнопку "Начать игру"
        arena.forEach(row => row.fill(0)); // очищаем поле
        update();      
    }
});


document.getElementById("endBtn").addEventListener("click", function() {
    gameRunning = false;
    document.getElementById("endBtn").style.display = "none";    // Скрыть кнопку "Завершить игру"
    document.getElementById("startBtn").style.display = "block"; // Показать кнопку "Начать игру"
});


document.getElementById("restartBtn").addEventListener("click", function() {
    gameRunning = true;
    arena.forEach(row => row.fill(0)); // очищаем поле
    playerReset();
    score = 0;
    level = 1;
    dropInterval = BASE_DROP_INTERVAL;
    arena.forEach(row => row.fill(0));  // Очищаем игровое поле
    document.getElementById("endScreen").style.display = "none";
    document.getElementById("endBtn").style.display = "block";
    update();
});


playerReset();
update();
