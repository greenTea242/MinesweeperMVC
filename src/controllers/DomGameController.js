function DomGameController(minesweeperGame, domGameView) {
    this._minesweeperGame = null;
    this._domGameView     = null;
    this._setMinesweeperGame(minesweeperGame);
    this._setDomGameView(domGameView);
    this._setEvents();
}

//Поделиться с дочерними Controller моделью
DomGameController.prototype.getMinesweeperGame = function() {
    return this._minesweeperGame;
};

DomGameController.prototype.open = function(x, y) {
    this._minesweeperGame.open(x, y);
};

DomGameController.prototype.toggleFlag = function(x, y) {
    this._minesweeperGame.toggleFlag(x, y);
};

DomGameController.prototype.resign = function() {

};

DomGameController.prototype.reset = function() {
    this._minesweeperGame.reset();
};

DomGameController.prototype.chooseDevOption = function(option) {
    if (option == DomGameView.SHOW_MINES_DEV_OPTION) {
        this._minesweeperGame.showMines();
    } else if (option == DomGameView.HIDE_MINES_DEV_OPTION) {
        this._minesweeperGame.hideMines();
    } else {
        throw new DomGameControllerException("Некорректная опция.");
    }
};

DomGameController.prototype.chooseUserOption = function(option) {
    if (option == DomGameView.SURRENDER_USER_OPTION) {
        this._minesweeperGame.resign();
    } else {
        throw new DomGameControllerException("Некорректная опция.");
    }
};

DomGameController.prototype._setMinesweeperGame = function(minesweeperGame) {
    if (!(minesweeperGame instanceof MinesweeperGame)) {
        throw new ConsoleGameViewException("Неправильный тип аргумента minesweeperGame.");
    }
    this._minesweeperGame = minesweeperGame;
};

DomGameController.prototype._setDomGameView = function(domGameView) {
    if (!(domGameView instanceof DomGameView)) {
        throw new DomGameViewException("Неправильный тип аргумента domView.");
    }
    this._domGameView = domGameView;
};

DomGameController.prototype._setEvents = function() {
    this._domGameView.clickToFieldLeft(this.open.bind(this));
    this._domGameView.clickToFieldRight(this.toggleFlag.bind(this));
    this._domGameView.clickToFaceLeft(this.reset.bind(this));
    this._domGameView.clickToDevOptionsLeft(this.chooseDevOption.bind(this));
    this._domGameView.clickToUserOptionsLeft(this.chooseUserOption.bind(this));
};

function DomGameControllerException(message) {
    this.name    = "DomGameControllerException";
    this.message = message;
}
