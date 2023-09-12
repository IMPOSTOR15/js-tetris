import Arena from "./Arena";
import Player from "./Player";

const colors = [
    null,
    'purple',
    'yellow',
    'orange',
    'blue',
    'cyan',
    'green',
    'red'
];

export default class TetrisGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.context = this.canvas.getContext("2d");
        this.context.scale(30, 30);
        this.gameRunning = false;
        this.BASE_DROP_INTERVAL = 1000;
        this.dropInterval = this.BASE_DROP_INTERVAL;
        this.lastTime = 0;
        this.score = 0;
        this.level = 1;

        this.audio = document.getElementById('myAudio');

        this.levelElement = document.getElementById('level');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.endBtnElement = document.getElementById("endBtn");
        this.startBtn = document.getElementById("startBtn");
        this.endScreenElement = document.getElementById("endScreen");
        this.highScoreElement.textContent = localStorage.getItem('high-score') || 0;

        this.leftBtnElemetn = document.getElementById('btnLeft');
        this.rightBtnElemetn = document.getElementById('btnRight');
        this.bottomBtnElemetn = document.getElementById('btnBottom');
        this.rotateBtnElemetn = document.getElementById('btnRotate');

        this.arena = new Arena(10, 20);
        this.player = new Player(this);
        this.player.playerReset();
        this.update();
        this.setupEventListeners();
    }

    arenaSweep() {
        outer: for (let y = this.arena.matrix.length - 1; y > 0; --y) {
            for (let x = 0; x < this.arena.matrix[y].length; ++x) {
                if (this.arena.matrix[y][x] === 0) {
                    continue outer;
                }
            }

            const row = this.arena.matrix.splice(y, 1)[0].fill(0);
            this.arena.matrix.unshift(row);
            ++y;

            this.score += 10 * this.level;
            this.updateScore();
        }
    }

    updateScore() {
        this.scoreElement.textContent = "Очки: " + this.score;
        this.levelElement.textContent = "Уровень: " + this.level;
        if (this.score >= this.level * 100) {
            
            this.level++;
            if (this.level <= 18) {
                this.dropInterval = this.BASE_DROP_INTERVAL - (50 * this.level);
            }
            
            if (this.dropInterval < 100) this.dropInterval = 100;
        }
    }
    saveHighScore() {
        const pastScore = JSON.parse(localStorage.getItem('high-score'))
        if (!pastScore) {
            localStorage.setItem('high-score', 0)
        }
        if (this.score > pastScore) {
            localStorage.setItem('high-score', this.score)
            this.highScoreElement.textContent = this.score
        }
    }
    endGame() {
        this.audio.pause()
        this.gameRunning = false;
        this.endBtnElement.style.display = "none";
        this.startBtn.style.display = "none";
        this.endScreenElement.style.display = "block";
    }

    draw() {
        this.context.fillStyle = "#000";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawMatrix(this.arena.matrix, {x: 0, y: 0});
        this.drawMatrix(this.player.matrix, this.player.pos);
        this.drawGrid()
    }
    drawGrid() {
        const blockSize = 1;
        this.context.strokeStyle = 'rgba(255,255,255,0.1)';
        this.context.strokeStyle = "rgba(221,192,34, 0.2)";
        this.context.lineWidth = 0.05;
    
        for(let i = 0; i <= this.arena.matrix[0].length; i += blockSize) {
            this.context.beginPath();
            this.context.moveTo(i, 0);
            this.context.lineTo(i, this.arena.matrix.length);
            this.context.stroke();
        }
    
        for(let j = 0; j <= this.arena.matrix.length; j += blockSize) {
            this.context.beginPath();
            this.context.moveTo(0, j);
            this.context.lineTo(this.arena.matrix[0].length, j);
            this.context.stroke();
        }
    }
    
    drawMatrix(matrix, offset) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.context.fillStyle = colors[value];
                    this.context.fillRect(x + offset.x,
                                          y + offset.y,
                                          1, 1);
                }
            });
        });
    }

    update(time = 0) {
        if (!this.gameRunning) return;
        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        this.player.dropCounter += deltaTime;
        if (this.player.dropCounter > this.dropInterval) {
            this.player.playerDrop();
            this.player.dropCounter = 0;
        }
        this.draw();
        requestAnimationFrame(this.update.bind(this));
    }

    startGame() {
        this.arena.matrix.forEach(row => row.fill(0));
        this.player.playerReset();
        this.score = 0;
        this.level = 1;
        this.dropInterval = this.BASE_DROP_INTERVAL;
        this.endBtnElement.style.display = "block";
        this.startBtn.style.display = "none";
        this.audio.currentTime = 0;
        this.audio.play()
        this.update();
    };

    setupEventListeners() {
        document.addEventListener('keydown', event => {
            if (event.key === 'ArrowLeft') {
                this.player.playerMove(-1);
            } else if (event.key === 'ArrowRight') {
                this.player.playerMove(1);
            } else if (event.key === 'ArrowDown') {
                this.player.playerDrop();
            } else if (event.key === 'ArrowUp') {
                this.player.playerRotate(1);
            }
        });
        this.leftBtnElemetn.addEventListener('click', () => {
            this.player.playerMove(-1);
        })
        this.rightBtnElemetn.addEventListener('click', () => {
            this.player.playerMove(1);
        })
        this.bottomBtnElemetn.addEventListener('click', () => {
            this.player.playerDrop();
        })
        this.rotateBtnElemetn.addEventListener('click', () => {
            this.player.playerRotate(1);
        })

        this.startBtn.addEventListener("click", () => {
            
            this.gameRunning = true;
            this.startGame()
            this.scoreElement.textContent = "Очки: " + this.score;
            this.levelElement.textContent = "Уровень: " + this.level;
            this.endBtnElement.style.display = "block";
            this.startBtn.style.display = "none";
            this.endScreenElement.style.display = "none";
        });

        this.endBtnElement.addEventListener("click", () => {
            this.gameRunning = false;
            this.endBtnElement.style.display = "none";
            this.startBtn.style.display = "block";
        });

        document.getElementById("restartBtn").addEventListener("click", () => {
            this.endScreenElement.style.display = "none";
            this.gameRunning = true;
            this.endBtnElement.style.display = "none";
            this.scoreElement.textContent = "Очки: " + this.score;
            this.levelElement.textContent = "Уровень: " + this.level;
            this.startGame()
        });
    }
}
