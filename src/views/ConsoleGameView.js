function ConsoleGameView(minesweeperGame) {
    this._game = null;
    this._setGame(minesweeperGame);
}

ConsoleGameView.LEFT_PAD_MAX_LENGTH = 3;

ConsoleGameView.alphabet = "abcdefghijklmnopqrstuvwxyz";

ConsoleGameView.prototype.show = function() {
    //+ unknown
    //. opened
    for (var y = 0; y <= this._game.getHeight(); y++) {
        var line = "";
        var leftPad = this._padLeft(y, ConsoleGameView.LEFT_PAD_MAX_LENGTH);
        for (var x = 0; x <= this._game.getWidth(); x++) {
            if (y == 0) {
                var string = this.getAlphabetString(this._game.getWidth());
                string = Util.repeatString(3, " ") + string;
                string = string.replace(/(\w)/g, "$1 ");
                line += string;
                break;
            } else if (x == 0) {
                line += y + leftPad;
                continue;
            }
            if (this._game.hasFlag(x, y)) {
                line += "F ";
            } else if (this._game.hasOpen(x, y)) {
                if (this._game.hasVisibleMine(x, y)) {
                    line += "M ";
                    continue;
                }
                var counter = this._game.countNearMines(x, y);
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

ConsoleGameView.prototype._padLeft = function(num, padMaxLength) {
    var spacesNumber = padMaxLength - Util.getNumberLength(num);
    return Util.repeatString(spacesNumber, " ");

};

ConsoleGameView.prototype.getAlphabetString = function(length) {
    return ConsoleGameView.alphabet.slice(0, length)
};

ConsoleGameView.prototype._setGame = function(game) {
    if (!(game instanceof MinesweeperGame)) {
        throw new ConsoleGameViewException("Неправильный тип аргумента minesweeperGame.");
    }
    this._game = game;
};

function ConsoleGameViewException(message) {
    this.name    = "ConsoleGameViewException";
    this.message = message;
}
