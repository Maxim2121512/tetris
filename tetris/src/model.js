import {tetrominoes} from "/src/tetrominoes.js";

export default class Model {
    leaderBoardSize = 10;
    isNewTetromino = false;
    isGameOver = false;
    constructor(playfieldSize) {
        this.playfieldSize = playfieldSize;
        this.modelPlayfield = Array.from({length: playfieldSize.rows}, () => Array(playfieldSize.cols).fill(0) );
        this.currentTetrominoCoords = {};
        this.prevTetrominoCorrds = null;
        this.score = 0;
        this.lvl = 0;
        this.tetromino = null;
        this.nextTetromino = null;
        this.prevTetromino = null;
        this.generateTetromino();
    }

    generateTetromino() {
        this.isNewTetromino = false;
        if (this.tetromino == null) {
            const tetrominoIndex = Math.floor(Math.random() * tetrominoes.length);
            this.tetromino = tetrominoes[tetrominoIndex];
        } else {
            this.tetromino = this.nextTetromino;
        }
        const nextTetrominoIndex = Math.floor(Math.random() * tetrominoes.length);
        this.nextTetromino = tetrominoes[nextTetrominoIndex];
        this.currentTetrominoCoords.row = -2;
        this.currentTetrominoCoords.col = this.playfieldSize.cols / 2 - Math.floor(this.tetromino.shape.length / 2);
        this.prevTetrominoCorrds = this.currentTetrominoCoords;
    }

    savePrevTetromino() {
        this.prevTetrominoCorrds = {... this.currentTetrominoCoords };
        this.prevTetromino = {... this.tetromino};
    }

    moveTetrominoLeft() {
        this.savePrevTetromino();
        this.currentTetrominoCoords.col--;
        if(!this.checkBounds([this.checkVerticalBounds])) {
            this.currentTetrominoCoords.col++;
        }
    }

    moveTetrominoRight() {
        this.savePrevTetromino();
        this.currentTetrominoCoords.col++;
        if(!this.checkBounds([this.checkVerticalBounds])) {
            this.currentTetrominoCoords.col--;
        }
    }

    moveTetrominoDown() {
        this.savePrevTetromino();
        this.currentTetrominoCoords.row++;
        if(!this.checkBounds([this.checkHorizontalBounds])) {
            this.currentTetrominoCoords.row--;
            this.setTetromino();
            return false;
        }
        return true;
    }

    rotateTetromino() {
        this.savePrevTetromino();
        const shapeLength = this.tetromino.shape.length;
        const rotatedTetromino = Array.from({length: shapeLength}, () => Array.from({length: shapeLength}).fill(0));

        for (let row = 0; row < shapeLength; row++) {
            for (let col = 0; col < shapeLength; col++) {
                rotatedTetromino[col][shapeLength - row - 1] = this.tetromino.shape[row][col];
            }
        }

        this.tetromino = {
            shape: rotatedTetromino,
            color: this.tetromino.color
        }

        if (!this.checkBounds([this.checkVerticalBounds, this.checkHorizontalBounds])) {
            this.tetromino = {...this.prevTetromino};
        }
    }

    checkBounds(predicates) {
        for (let row = 0; row < this.tetromino.shape.length; row++) {
            for (let col = 0; col < this.tetromino.shape.length; col++) {
                if (this.tetromino.shape[row][col] === 0) {
                    continue;
                }

                for(const predicate of predicates) {
                    if (!(predicate.call(this, row, col))) {
                        return false;
                    }
                }

            }
        }
        return true;
    }

    checkVerticalBounds(row, col) {
        return (
            this.currentTetrominoCoords.col + col >= 0 &&
            this.currentTetrominoCoords.col + col <= this.playfieldSize.cols - 1 &&
            this.modelPlayfield[this.currentTetrominoCoords.row + row]?.[this.currentTetrominoCoords.col + col] !== 1
        )
    }

    checkHorizontalBounds(row, col) {
        return (
            this.currentTetrominoCoords.row + row <= this.playfieldSize.rows - 1 &&
            this.modelPlayfield[this.currentTetrominoCoords.row + row]?.[this.currentTetrominoCoords.col + col] !== 1
        )
    }

    setTetromino() {
        if(this.currentTetrominoCoords.row === -1) {
            this.isGameOver = true;
            return;
        }
        for (let row = this.currentTetrominoCoords.row; row < this.currentTetrominoCoords.row + this.tetromino.shape.length; row++) {
            for (let col = this.currentTetrominoCoords.col; col < this.currentTetrominoCoords.col + this.tetromino.shape.length; col++) {
                if (this.tetromino.shape[row - this.currentTetrominoCoords.row][col - this.currentTetrominoCoords.col] !== 0 && row > 0) {
                    this.modelPlayfield[row][col] = 1;
                }
            }
        }
        this.isNewTetromino = true;
    }

    getRowsToRemove() {
        let rowsToRemove = [];
        for (let row = this.prevTetrominoCorrds.row + this.prevTetromino.shape.length - 1; row >= this.prevTetrominoCorrds.row; row--) {
            if (row < 0) {
                continue;
            }
            if (row < this.playfieldSize.rows && this.modelPlayfield[row].every(cell => cell === 1)) {
                rowsToRemove.push(row);
            }
        }
        return rowsToRemove;
    }

    removeRows(rowsToRemove) {
        for (let i = 0; i < rowsToRemove.length; i++) {
            this.modelPlayfield.splice(rowsToRemove[i], 1);
        }

        for (let i = 0; i < rowsToRemove.length; i++) {
            this.modelPlayfield.unshift(Array(this.playfieldSize.cols).fill(0));
        }

        this.score += (300 * rowsToRemove.length);
        this.updateLvl();
    }

    clearModelPlayfield() {
        this.modelPlayfield.forEach(row => row.fill(0));
    }

    resetModel() {
        this.clearModelPlayfield();
        this.score = 0;
        this.isNewTetromino = false;
        this.isGameOver = false;
        this.generateTetromino();
    }

    updateLvl() {
        this.lvl = Math.floor(this.score / 1000);
    }

    updateLeaderBoard() {
        const playerNickname = localStorage.getItem("tetris.nickname");

        let leaderboard = JSON.parse(localStorage.getItem("tetris.leaderboard")) || [];

        const isPlayerInTable = leaderboard.findIndex(playerData => playerData.nickname === playerNickname);

        if (isPlayerInTable === -1) {
            leaderboard.push({
                nickname: playerNickname,
                score: this.score
            });
        } else if (this.score >= leaderboard[isPlayerInTable].score){
            leaderboard[isPlayerInTable].score = this.score;
        }

        leaderboard.sort( (a,b) => b.score - a.score);

        if (leaderboard.length > this.leaderBoardSize) {
            leaderboard.pop();
        }

        localStorage.setItem("tetris.leaderboard", JSON.stringify(leaderboard));

    }
}