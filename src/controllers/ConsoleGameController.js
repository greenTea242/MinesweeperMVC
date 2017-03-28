function ConsoleGameController(minesweeperGame, consoleGameView) {
    this._game            = null;
    this._consoleGameView = null;
    this._setGame(minesweeperGame);
    this._setConsoleGameView(consoleGameView);
}

ConsoleGameController.prototype.show = function() {
    this._consoleGameView.show();
};

ConsoleGameController.prototype.open = function(strCell) {
    var cords = this._strCellToObjCell(strCell);
    var x     = +cords.x;
    var y     = +cords.y;
    this._game.open(x, y);
    this._consoleGameView.show();
};

ConsoleGameController.prototype.toggleFlag = function(strCell) {
    var cords = this._strCellToObjCell(strCell);
    var x     = +cords.x;
    var y     = +cords.y;
    this._game.toggleFlag(x, y);
};

ConsoleGameController.prototype.resign = function() {
    this._game.resign();
};

ConsoleGameController.prototype.reset = function() {
    this._game.reset();
};

ConsoleGameController.prototype._strCellToObjCell = function(strCell) {
    Util.assert(typeof strCell == "string" &&
        strCell.search(/^\w\d+$/i) != -1);
    strCell = strCell.toLowerCase();
    var widthSymbols = this._consoleGameView.getAlphabetString(this._game.getWidth());
    var x = widthSymbols.indexOf(strCell.slice(0, 1)) + 1;
    var y = +strCell.slice(1);
    if (x == -1 ||
        y < 1   ||
        y > this._game.getHeight()) {
        throw new ConsoleGameControllerException("Клетка " + strCell + " не существует.");
    }
    return {"x": x, "y": y};
};

ConsoleGameController.prototype._setGame = function(game) {
    if (!(game instanceof MinesweeperGame)) {
        throw new TypeError("Неправильный тип аргумента minesweeperGame.");
    }
    this._game = game;
};

ConsoleGameController.prototype._setConsoleGameView = function(consoleGameView) {
    if (!(consoleGameView instanceof ConsoleGameView)) {
        throw new TypeError("Неправильный тип аргумента consoleView.");
    }
    this._consoleGameView = consoleGameView;
};

function ConsoleGameControllerException(message) {
    this.name    = "ConsoleGameControllerException";
    this.message = message;
}
