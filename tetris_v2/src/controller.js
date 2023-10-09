
export default class Controller {
    scalingFactor = 0.95;
    defaultDropDelay = 1000;
    dropDelay = this.defaultDropDelay; // мс
    constructor(view, model) {
        this.view = view;
        this.model = model;
        this.keyPressHandlerVal = this.keyPressHandler.bind(this);
        this.bindKeyPressHandler();

        this.view.restartGameBtn.addEventListener("click", () => {
            this.dropDelay = this.defaultDropDelay;
            this.model.resetModel();
            this.view.resetView();
            this.bindKeyPressHandler();
            this.startGame();
        });

        this.view.showLeaderboardBtn.addEventListener("click", () => {
            this.model.updateLeaderBoard();
            this.view.showLeaderboardModal();
        });
    }


    bindKeyPressHandler() {
        document.addEventListener("keydown", this.keyPressHandlerVal);
    }

    unbindKeyPressHandler() {
        document.removeEventListener("keydown", this.keyPressHandlerVal);
    }


    keyPressHandler(event){
        switch (event.key){
            case 'ArrowLeft':
                this.moveLeftHandler();
                break;
            case 'ArrowRight':
                this.moveRightHandler();
                break;
            case 'ArrowDown':
                this.dropHandler();
                break;
            case 'ArrowUp':
                this.rotateHandler();
                break;
        }
    }


    moveLeftHandler() {
        this.model.moveTetrominoLeft()
        this.updateView();
    }

    moveRightHandler() {
        this.model.moveTetrominoRight()
        this.updateView();
    }

    dropHandler() {
        while (this.model.moveTetrominoDown()) {
            this.updateView();
        }

        this.updateView();
    }

    moveDownHandler() {
        this.model.moveTetrominoDown();
        this.updateView();
    }

    rotateHandler() {
        this.model.rotateTetromino();
        this.updateView();
    }

    removeRowsHandler() {
        const rowsToRemove = this.model.getRowsToRemove();

        if (rowsToRemove.length > 0) {
            this.model.removeRows(rowsToRemove);
            this.view.eraseRow(rowsToRemove);
        }
    }

    updateView() {

        if (this.model.isGameOver) {
            this.stopGame();
            this.unbindKeyPressHandler();
            this.view.showGameOverModal();
            return;
        }

        if (this.model.currentTetrominoCoords.row === -1 ) {
            this.view.showNextTetromino(this.model.nextTetromino);
        }

        if (this.model.isNewTetromino) {
            this.view.drawFigure(this.model.currentTetrominoCoords, this.model.tetromino);
            let prevLvl = this.model.lvl;
            this.removeRowsHandler();
            this.view.updateScoreValue(this.model.score);
            if (prevLvl !== this.model.lvl) {
                this.updateDropDelay();
            }
            this.model.generateTetromino();
        }

        this.view.eraseFigure(this.model.prevTetrominoCorrds, this.model.prevTetromino);
        this.view.drawFigure(this.model.currentTetrominoCoords, this.model.tetromino);

        console.log(this.dropDelay);

    }

    startGame() {
        this.moveDownInterval = setInterval( () => {
            this.moveDownHandler()
        }, this.dropDelay)
    }

    stopGame() {
        clearInterval(this.moveDownInterval);
    }

    updateDropDelay() {
        this.stopGame();
        this.dropDelay *= this.scalingFactor;
        this.startGame();
    }


}