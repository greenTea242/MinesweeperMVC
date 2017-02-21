function ConsoleGameView(minesweeperGame) {
    this._minesweeperGame = null;
    this._setMinesweeperGame(minesweeperGame);
}

ConsoleGameView.alphabet = "abcdefghijklmnopqrstuvwxyz";

ConsoleGameView.prototype.show = function() {
    //+ unknown
    //. opened
    var visibleMines = this._minesweeperGame.getVisibleMines();
    var openCells    = this._minesweeperGame.getOpenCells();
    var flags        = this._minesweeperGame.getFlags();
    for (var y = 0; y <= this._minesweeperGame.getHeight(); y++) {
        var line = "";
        var spacesCounter = 3 - Util.getNumberLength(y);
        var pad = Util.repeatString(spacesCounter, " ");
        for (var x = 0; x <= this._minesweeperGame.getWidth(); x++) {
            if (y == 0) {
                var string = this.getAlphabetString(this._minesweeperGame.getWidth());
                string = Util.repeatString(3, " ") + string;
                string = string.replace(/(\w)/g, "$1 ");
                line += string;
                break;
            } else if (x == 0) {
                line += y + pad;
                continue;
            }
            if (flags.hasCell(x, y)) {
                line += "F ";
            } else if (openCells.hasCell(x, y)) {
                if (visibleMines.hasCell(x, y)) {
                    line += "M ";
                    continue;
                }
                var counter = this._minesweeperGame.countNearMines(x, y);
                if (counter == 0) {
                    line += ". ";
                } else {
                    line += counter + " ";

                }
            } else {
                line += "+ ";
            }
        }
        console.log(line);
    }
};

ConsoleGameView.prototype.getAlphabetString = function(length) {
    return ConsoleGameView.alphabet.slice(0, length)
};

ConsoleGameView.prototype._setMinesweeperGame = function(minesweeperGame) {
    if (!(minesweeperGame instanceof MinesweeperGame)) {
        throw new ConsoleGameViewException("Неправильный тип аргумента minesweeperGame.");
    }
    this._minesweeperGame = minesweeperGame;
};

function ConsoleGameViewException(message) {
    this.name    = "ConsoleGameViewException";
    this.message = message;
}
