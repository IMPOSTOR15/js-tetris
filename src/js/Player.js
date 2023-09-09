export default class Player {
    constructor(game) {
        this.game = game;
        this.pos = { x: 0, y: 0 };
        this.matrix = null;
        this.dropCounter = 0;
    }

    playerReset() {
        const pieces = 'ILJOTSZ';
        this.matrix = this.createPiece(pieces[pieces.length * Math.random() | 0]);
        this.pos.y = 0;
        this.pos.x = (this.game.arena.matrix[0].length / 2 | 0) - (this.matrix[0].length / 2 | 0);

        if (this.game.arena.collide(this)) {
            this.game.arena.matrix.forEach(row => row.fill(0));
            this.game.saveHighScore()
            this.game.score = 0;
            this.game.endGame();
        }
    }

    playerMove(dir) {
        this.pos.x += dir;
        if (this.game.arena.collide(this)) {
            this.pos.x -= dir;
        }
    }

    playerDrop() {
        this.pos.y++;
        if (this.game.arena.collide(this)) {
            this.pos.y--;
            this.game.arena.merge(this);
            this.playerReset();
            this.game.arenaSweep();
        }
        this.dropCounter = 0;
    }

    playerRotate(dir) {
        const pos = this.pos.x;
        let offset = 1;
        this.rotateMatrix(this.matrix, dir);
        while (this.game.arena.collide(this)) {
            this.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > this.matrix[0].length) {
                this.rotateMatrix(this.matrix, -dir);
                this.pos.x = pos;
                return;
            }
        }
    }

    rotateMatrix(matrix, dir) {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
            }
        }

        if (dir > 0) {
            matrix.forEach(row => row.reverse());
        } else {
            matrix.reverse();
        }
    }

    createPiece(type) {
        if (type === 'I') {
            return [
                [0, 1, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 0, 0],
            ];
        } else if (type === 'L') {
            return [
                [0, 2, 0],
                [0, 2, 0],
                [0, 2, 2],
            ];
        } else if (type === 'J') {
            return [
                [0, 3, 0],
                [0, 3, 0],
                [3, 3, 0],
            ];
        } else if (type === 'O') {
            return [
                [4, 4],
                [4, 4],
            ];
        } else if (type === 'T') {
            return [
                [0, 5, 0],
                [5, 5, 5],
                [0, 0, 0],
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
}
