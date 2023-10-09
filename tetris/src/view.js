export default class View {
    nextTetrominoSize = 4;
    constructor(viewPlayfield, playfieldSize, defaultCellColor) {
        this.viewPlayfield = viewPlayfield;
        this.playfieldSize = playfieldSize;
        this.defaultCellColor = defaultCellColor;
        this.scoreValue = document.getElementById("scoreValue");
        this.gameOverModal = document.getElementById("gameOverModal");
        this.leaderboardModal = document.getElementById("leaderboardModal");
        this.closeGameOverBtn = document.getElementById("closeGameOverModal");
        this.restartGameBtn = document.getElementById("restartGame");
        this.showLeaderboardBtn = document.getElementById("showLeaderboardBtn");
        this.closeLeaderboardBtn = document.getElementById("closeLeaderboardModal")
        this.nextTetromino = document.getElementsByClassName("nextFigure")[0];
        document.getElementById("nickname").textContent = localStorage.getItem("tetris.nickname");
        this.closeGameOverBtn.addEventListener("click", () => {
            this.hideGameOverModal();
            window.location.href = "index.html"
        });

        this.closeLeaderboardBtn.addEventListener("click", () => {
            this.hideLeaderboardModal();
        });

        this.createViewPlayfield();

    }

    createViewPlayfield() {
        for (let row = 0; row < this.playfieldSize.rows; row++) {
            for (let col = 0; col < this.playfieldSize.cols; col++) {
                const cell = document.createElement('div');
                cell.style.backgroundColor = this.defaultCellColor;
                this.viewPlayfield.appendChild(cell);
            }
        }

        for(let row = 0; row < this.nextTetrominoSize * this.nextTetrominoSize; row++) {
            const cell = document.createElement('div');
            cell.style.backgroundColor = this.defaultCellColor;
            this.nextTetromino.appendChild(cell);
        }
    }

    showNextTetromino(tetromino) {
        this.clearNextTetromino();
        for (let i = 0; i < this.nextTetrominoSize; i++) {
            for (let j = 0; j < this.nextTetrominoSize; j++) {
                if(tetromino.shape[i]?.[j] === 1) {
                    this.nextTetromino.children[i*this.nextTetrominoSize + j].style.backgroundColor = tetromino.color;
                }
            }
        }
    }

    clearNextTetromino() {
        for(let i = 0; i < this.nextTetrominoSize * this.nextTetrominoSize; i++) {
            this.nextTetromino.children[i].style.backgroundColor = this.defaultCellColor;
        }
    }

    clearViewPlayfield() {
        for (let i = 0; i < this.playfieldSize.rows * this.playfieldSize.cols; i++) {
            this.viewPlayfield.children[i].style.backgroundColor = this.defaultCellColor;
        }

    }

    showGameOverModal() {
        this.gameOverModal.style.display = "block";
    }

    hideGameOverModal() {
        this.gameOverModal.style.display = "none";
    }

    showLeaderboardModal() {
        const leaderboardDataJSON = localStorage.getItem("tetris.leaderboard");
        console.log(leaderboardDataJSON);
        if (leaderboardDataJSON) {
            const leaderboardData = JSON.parse(leaderboardDataJSON);
            console.log(leaderboardData)
            const table = document.getElementById("leaderboardTable");
            table.innerHTML = "";

            const header = table.insertRow(0);
            header.insertCell(0).textContent = "Игрок";
            header.insertCell(1).textContent = "Количество очков";

            leaderboardData.forEach((playerData, index) => {
               const row = table.insertRow(index + 1);
               row.insertCell(0).innerText = playerData.nickname;
               row.insertCell(1).innerText = playerData.score;
            });
        }

        this.leaderboardModal.style.display = "block";
    }

    hideLeaderboardModal() {
        this.leaderboardModal.style.display = "none";
    }


    drawFigure(currentTetrominoCoords, tetromino) {
        const shift = currentTetrominoCoords.row * this.playfieldSize.cols;

        for (let row = 0; row < tetromino.shape.length; row++) {
            for (let col = 0; col < tetromino.shape.length; col++) {
                if (currentTetrominoCoords.row + row < 0) {
                    continue;
                } if (tetromino.shape[row][col] === 1) {
                    this.viewPlayfield.children[shift + row * this.playfieldSize.cols + currentTetrominoCoords.col + col].style.backgroundColor = tetromino.color;
                }
            }
        }
    }

    eraseFigure(prevTetrominoCoords, prevTetromino) {
        for (let row = prevTetrominoCoords.row; row < (prevTetrominoCoords.row + prevTetromino.shape.length); row++) {
            for (let col = prevTetrominoCoords.col; col < (prevTetrominoCoords.col + prevTetromino.shape.length); col++) {
                const cellIndex = row * this.playfieldSize.cols + col;

                if (row < 0 || cellIndex < 0 || cellIndex > this.playfieldSize.rows * this.playfieldSize.cols - 1) {
                    continue;
                }

                if (prevTetromino.shape[row - prevTetrominoCoords.row ][col - prevTetrominoCoords.col] === 0) {
                    continue;
                }

                const cell = this.viewPlayfield.children[cellIndex];

                if (cell.style.backgroundColor === prevTetromino.color) {
                    cell.style.backgroundColor = this.defaultCellColor;
                }
            }
        }
    }

    eraseRow(rowsToErase) {
        for (let i = 0; i < rowsToErase.length; i++) {
            for (let j = rowsToErase[i] * this.playfieldSize.cols; j < (rowsToErase[i] + 1) * this.playfieldSize.cols; j++) {
                const cell = this.viewPlayfield.children[j];
                cell.style.backgroundColor = this.defaultCellColor;
            }
        }

        this.spliceRows();

    }

    spliceRows() {
        let shift = this.isRowEmpty(this.playfieldSize.rows - 1) ? 1 : 0;
        for (let row = this.playfieldSize.rows - 2; row > 0; row--) {
            if (this.isRowEmpty(row)) {
                shift++;
            } else if (shift !== 0) {
                this.dropRow(row, shift);
            }
        }
    }

    isRowEmpty(rowIndex) {
        for (let i = rowIndex * this.playfieldSize.cols; i < (rowIndex + 1) * this.playfieldSize.cols; i++) {
            if (this.viewPlayfield.children[i].style.backgroundColor !== this.defaultCellColor) {
                return false;
            }
        }
        return true;
    }

    dropRow(row, shift) {
        for (let i = (row + shift) * this.playfieldSize.cols; i < (row + shift + 1) * this.playfieldSize.cols; i++) {
            this.viewPlayfield.children[i].style.backgroundColor = this.viewPlayfield.children[i - shift * this.playfieldSize.cols].style.backgroundColor;
        }

        for (let i = row * this.playfieldSize.cols; i < (row + 1) * this.playfieldSize.cols; i++) {
            this.viewPlayfield.children[i].style.backgroundColor = this.defaultCellColor;
        }
    }

    updateScoreValue(score) {
        this.scoreValue.textContent = score;
    }

    resetView() {
        this.updateScoreValue(0);
        this.clearViewPlayfield();
        this.hideGameOverModal();
        this.hideLeaderboardModal();
    }
}