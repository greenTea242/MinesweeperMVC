function MinesweeperGame(settings, dispatcher) {
    if (!settings.hasOwnProperty("width")  ||
        !settings.hasOwnProperty("height") ||
        !settings.hasOwnProperty("minesNumber")) {
        throw new MinesweeperGameException("Неправильные настройки.");
    }
    this._openCells = null;
    this._flags     = null;

    this._invisibleMines = null;
    this._visibleMines   = null;

    this._width  = null;
    this._height = null;

    this._minesNumber = null;

    this._benchmark = null;

    this._timerID    = null;
    this._timerValue = null;

    this._firstMove  = null;
    this._gameStatus = null;

    this._dispatcher = new EventDispatcher();

    this._setWidth(settings.width);
    this._setHeight(settings.height);
    this._setMinesNumber(settings.minesNumber);
    this._prepareNewGame();
}

MinesweeperGame.BEGINNER_MOD = {width: 9,  height: 9,  minesNumber: 10};
MinesweeperGame.ADVANCE_MOD  = {width: 16, height: 16, minesNumber: 40};
MinesweeperGame.PRO_MOD      = {width: 16, height: 30, minesNumber: 99};

MinesweeperGame.STATUS_WIN     = "win";
MinesweeperGame.STATUS_LOSE    = "lose";
MinesweeperGame.STATUS_PLAYING = "playing";

MinesweeperGame.MIN_WIDTH  = 9;
MinesweeperGame.MAX_WIDTH  = 30;

MinesweeperGame.MIN_HEIGHT = 9;
MinesweeperGame.MAX_HEIGHT = 24;

MinesweeperGame.MIN_MINES  = 10;
MinesweeperGame.MAX_MINES  = 668;

MinesweeperGame.MIN_FLAGS  = 1;
MinesweeperGame.MAX_FLAGS  = 668;

MinesweeperGame.MIN_TIMER_VALUE = 0;
MinesweeperGame.MAX_TIMER_VALUE = 999;

MinesweeperGame.prototype.getWidth = function() {
    return this._width;
};

MinesweeperGame.prototype.getHeight = function() {
    return this._height;
};

MinesweeperGame.prototype.getTimerValue = function() {
    return this._timerValue;
};

MinesweeperGame.prototype.getDispatcher = function() {
    return this._dispatcher;
};

MinesweeperGame.prototype.getFlagsCounter = function() {
    return this._minesNumber - this._flags.count();
};

MinesweeperGame.prototype.getOpenCells = function() {
    return this._openCells;
};

MinesweeperGame.prototype.getFlags = function() {
    return this._flags;
};

MinesweeperGame.prototype.getGameStatus = function() {
    return this._gameStatus;
};

MinesweeperGame.prototype.getVisibleMines = function() {
    return this._visibleMines;
};

MinesweeperGame.prototype.getInvisibleMines = function() {
    return this._invisibleMines;
};

MinesweeperGame.prototype.open = function(x, y) {
    if (!this._isCorrectCell(x, y)) {
        throw new MinesweeperGameException("Некорректные координаты.");
    } else if (this._gameStatus == MinesweeperGame.STATUS_LOSE ||
        !this.isPossibleToOpen(x, y)) {
        return false;
    } else if (this._firstMove) {
        this._firstMove = false;
        this._createMines(x, y);
        this._createTimer();
    }
    this._openCells.add(x, y, true);
    var cell = new CellSet();
    cell.add(x, y, true);
    this._dispatcher.dispatchEvent(new GameEvent(GameEvent.SEVERAL_CELLS_CHANGED, cell));
    //Проверяем можно ли открыть соседние клетки
    this._openNearCells(x, y);
    this._updateGameStatus();
    if (this._gameStatus != MinesweeperGame.STATUS_PLAYING) {
        this._endGame();
    }
};

MinesweeperGame.prototype.hasVisibleMine = function(x, y) {
    if (!this._visibleMines) {
        throw new MinesweeperGameException("Множество не установлено.");
    }
    return this._visibleMines.hasCell(x, y);
};

MinesweeperGame.prototype.hasInvisibleMine = function(x, y) {
    if (!this._invisibleMines) {
        throw new MinesweeperGameException("Множество не установлено.");
    }
    return this._invisibleMines.hasCell(x, y);
};

MinesweeperGame.prototype.hasFlag = function(x, y) {
    if (!this._flags) {
        throw new MinesweeperGameException("Множество не установлено.");
    }
    return this._flags.hasCell(x, y);
};

MinesweeperGame.prototype.hasOpen = function(x, y) {
    if (!this._openCells) {
        throw new MinesweeperGameException("Множество не установлено.");
    }
    return this._openCells.hasCell(x, y);
};

MinesweeperGame.prototype.isPossibleToOpen = function(x, y) {
    return !this._flags.hasCell(x, y) && !this._openCells.hasCell(x, y);
};

MinesweeperGame.prototype.showMines = function() {
    //Копируем множество невидимых мин в видимые
    this._visibleMines.merge(this._invisibleMines);
    this._dispatcher.dispatchEvent(new GameEvent(GameEvent.SEVERAL_CELLS_CHANGED, this._visibleMines));
};

MinesweeperGame.prototype.hideMines = function() {
    if (!this._visibleMines.count()) {
        throw new MinesweeperGameException("Нужно вначале показать мины.");
    }
    var copyVisibleMines = new CellSet();
    copyVisibleMines.merge(this._visibleMines);
    //Удаляем видимые мины
    this._visibleMines = new CellSet();
    this._dispatcher.dispatchEvent(new GameEvent(GameEvent.SEVERAL_CELLS_CHANGED, copyVisibleMines));
};

MinesweeperGame.prototype.toggleFlag = function(x, y) {
    if (!this._flags.hasCell(x, y)) {
        this._setFlag(x, y);
    } else {
        this._removeFlag(x, y);
    }
};

MinesweeperGame.prototype.setMine = function(x, y) {
    if (!this._isCorrectCell(x, y)) {
        throw new MinesweeperGameException("Некорректные координаты.");
    } else if (this._invisibleMines.hasCell(x, y)) {
        throw new MinesweeperGameException("Мина уже добавлена.");
    }
    this._invisibleMines.add(x, y, true);
};

MinesweeperGame.prototype.countNearMines = function(x, y) {
    if (!this._isCorrectCell(x, y)) {
        throw new MinesweeperGameException("Некорректные координаты.");
    }
    var nearCellList = this._getNearCells(x, y);
    return nearCellList.countEqualCells(this._invisibleMines);
};

//Метод капитуляции
MinesweeperGame.prototype.resign = function() {
    if (this._gameStatus != MinesweeperGame.STATUS_PLAYING) {
        throw new MinesweeperGameException("Метод resign не может быть" +
            " использован в завершенной игре.")
    }
    this._gameStatus = MinesweeperGame.STATUS_LOSE;
    this._dispatcher.dispatchEvent(new GameEvent(GameEvent.GAME_STATUS_CHANGED));
    this._endGame();
};

MinesweeperGame.prototype.reset = function() {
    /*
     * Собираем задействованные в процессе игры клетки
     * чтобы затем снова их скрыть
     */
    var involvedCells = new CellSet();
    involvedCells.merge(this._openCells);
    involvedCells.merge(this._visibleMines);
    involvedCells.merge(this._flags);
    //В вызове метода удалятся все множества
    this._prepareNewGame();
    this._dispatcher.dispatchEvent(new GameEvent(GameEvent.SEVERAL_CELLS_CHANGED, involvedCells));
    this._dispatcher.dispatchEvent(new GameEvent(GameEvent.NEW_GAME));
};

MinesweeperGame.prototype.countCells = function() {
    return this._width * this._height;
};

MinesweeperGame.prototype._prepareNewGame = function() {
    if (this._timerID) {
        this._stopTimer();
    }
    this._openCells = new CellSet();
    this._flags     = new CellSet();
    this._dispatcher.dispatchEvent(new GameEvent(GameEvent.FLAGS_COUNTER_CHANGED));
    this._invisibleMines = new CellSet();
    this._visibleMines   = new CellSet();
    this._timerValue     = 0;
    this._dispatcher.dispatchEvent(new GameEvent(GameEvent.TIMER_VALUE_CHANGED));
    this._benchmark  = 0;
    this._firstMove  = true;
    this._gameStatus = MinesweeperGame.STATUS_PLAYING;
    this._dispatcher.dispatchEvent(new GameEvent(GameEvent.GAME_STATUS_CHANGED));
};

MinesweeperGame.prototype._endGame = function() {
    if (this._gameStatus == MinesweeperGame.STATUS_PLAYING) {
        throw new MinesweeperGameException("Нельзя закончить игру со статусом " +
            MinesweeperGame.STATUS_PLAYING);
    } else if (this._timerID) {
        this._stopTimer();
    }
    this.showMines();
    this._dispatcher.dispatchEvent(new GameEvent(GameEvent.GAME_OVER));
};

MinesweeperGame.prototype._increaseTimerValue = function() {
    if (!this._timerID) {
        throw new MinesweeperGameException("Не иницилизрован таймер.");
    } else if (this._timerValue == MinesweeperGame.MAX_TIMER_VALUE) {
        this._stopTimer();
        return false;
    }
    this._timerValue++;
    this._dispatcher.dispatchEvent(new GameEvent(GameEvent.TIMER_VALUE_CHANGED));
};

MinesweeperGame.prototype._setFlag = function(x, y) {
    if (!this._isCorrectCell(x, y)) {
        throw new MinesweeperGameException("Некорректные координаты.");
    } else if(this._flags.hasCell(x, y)) {
        throw new MinesweeperGameException("Флаг уже поставлен.");
    } else if (this._openCells.hasCell(x, y) ||
        this.getFlagsCounter() < MinesweeperGame.MIN_FLAGS) {
        return false;
    }
    this._flags.add(x, y, true);
    var flag = new CellSet();
    flag.add(x, y, true);
    this._dispatcher.dispatchEvent(new GameEvent(GameEvent.SEVERAL_CELLS_CHANGED, flag));
    this._dispatcher.dispatchEvent(new GameEvent(GameEvent.FLAGS_COUNTER_CHANGED));
    //Если по правилам конец игры - завершаем ее
    if (this._gameStatus != MinesweeperGame.STATUS_PLAYING) {
        this._endGame();
    }
};

MinesweeperGame.prototype._removeFlag = function(x, y) {
    if (!this._isCorrectCell(x, y)) {
        throw new MinesweeperGameException("Некорректные координаты.");
    } else if (!this._flags.hasCell(x, y)) {
        throw new MinesweeperGame("Флаг отсутвует.");
    } else if (this.getFlagsCounter() > this._invisibleMines) {
        throw new MinesweeperGameException("Что-то пошло не так...");
    } else if (this._openCells.hasCell(x, y)) {
        return false;
    }
    this._flags.remove(x, y);
    var flag = new CellSet();
    flag.add(x, y, true);
    this._dispatcher.dispatchEvent(new GameEvent(GameEvent.SEVERAL_CELLS_CHANGED, flag));
    this._dispatcher.dispatchEvent(new GameEvent(GameEvent.FLAGS_COUNTER_CHANGED));
};

MinesweeperGame.prototype._isCorrectCell = function(x, y) {
    if (typeof x != "number" ||
        typeof y != "number") {
        throw new MinesweeperGameException("Не число.");
    } else if (x < 1    ||
        y < 1           ||
        x > this._width ||
        y > this._height) {
        return false;
    }
    return true;
};

MinesweeperGame.prototype._createTimer = function() {
    var self = this;
    this._timerID = setInterval(function() {
        self._increaseTimerValue();
    }, 1000);
};

MinesweeperGame.prototype._stopTimer = function() {
    if (!this._timerID) {
        throw new MinesweeperGameException("Не инициализрован таймер.");
    }
    clearTimeout(this._timerID);
    this._timerID = null;
};

MinesweeperGame.prototype._updateGameStatus = function() {
    if (this._hasLost()) {
        this._gameStatus = MinesweeperGame.STATUS_LOSE;
    } else if (this._hasWon()) {
        this._gameStatus = MinesweeperGame.STATUS_WIN;
    } else {
        this._gameStatus = MinesweeperGame.STATUS_PLAYING;
    }
    this._dispatcher.dispatchEvent(new GameEvent(GameEvent.GAME_STATUS_CHANGED));
};

MinesweeperGame.prototype._hasLost = function() {
    //Если открыта хоть одна мина
    return this._openCells.some(this._invisibleMines.hasCell.bind(this._invisibleMines));
};

MinesweeperGame.prototype._hasWon = function() {
    //Если открыты все клетки кроме мин
    return this._openCells.count() == this.countCells() - this._invisibleMines.count();
};

MinesweeperGame.prototype._openNearCells = function(x, y) {
    if (!this._isCorrectCell(x, y)) {
        throw new MinesweeperGameException("Некорректные координаты.");
    }
    /*
     * Подсчет количества рекурсивных вызовов метода.
     * В первом ходу может быть долгая загрузка из-за этого
     */
    this._benchmark++;
    var minesCounter = this.countNearMines(x, y);
    if (minesCounter != 0 ||
        this._invisibleMines.hasCell(x, y)) {
        return false;
    }
    var nearCellList = this._getNearCells(x, y);
    var that = this;
    nearCellList.forEach(function(nearCellX, nearCellY) {
        if (!that._openCells.hasCell(nearCellX, nearCellY) &&
            !that._flags.hasCell(nearCellX, nearCellY)) {
            that.open(nearCellX, nearCellY);
        }
    });
};

MinesweeperGame.prototype._getNearCells = function(x, y) {
    if (!this._isCorrectCell(x, y)) {
        throw new MinesweeperGameException("Некорректные координаты.");
    }
    var nearCellList = new CellSet();
    for (var vertical = -1; vertical <= 1; vertical++) {
        var nearCellY = y + vertical;
        for (var horizontal = -1; horizontal <= 1; horizontal++) {
            var nearCellX = x + horizontal;
            if ((vertical  == 0  &&
                horizontal == 0) ||
                !this._isCorrectCell(nearCellX, nearCellY)) {
                continue;
            }
            nearCellList.add(nearCellX, nearCellY, true);
        }
    }
    return nearCellList;
};

MinesweeperGame.prototype._createMines = function(firstMoveX, firstMoveY) {
    if (!this._isCorrectCell(firstMoveX, firstMoveY)) {
        throw new MinesweeperGameException("Некорректные координаты.");
    }
    if (this._minesNumber > this.countCells()) {
        throw new MinesweeperGameException("Мины > клетки.");
    }
    //Берем все координаты кроме первой кликнутой клетки...
    var cordsArray = this._getCordsArray(firstMoveX, firstMoveY);
    //...и перемешиваем их
    cordsArray     = Util.shuffle(cordsArray);
    for (var i = 0, counter = 0; i < this.countCells(); i++) {
        //Если создали нужное количество мин
        if (counter == this._minesNumber) {
            break;
        }
        this.setMine(cordsArray[i].x, cordsArray[i].y);
        counter++;
    }
    if (counter != this._minesNumber) {
        throw new MinesweeperGameException("В создании мин что-то пошло не так..");
    }
};

MinesweeperGame.prototype._getCordsArray = function(firstMoveX, firstMoveY) {
    /*
     * Словари не подойдут, так как ключи в объектах JS
     * сортируются по своему
     */
    var array = [];
    for (var y = 1; y <= this._height; y++) {
        for (var x = 1; x <= this._width; x++) {
            if (x == firstMoveX &&
                y == firstMoveY) {
                continue;
            }
            array.push({"x": x, "y": y});
        }
    }
    return array;
};

MinesweeperGame.prototype._setWidth = function(width) {
    if (typeof width != "number") {
        throw new MinesweeperGameException("Некорректное значение длины.");
    } else if (width < MinesweeperGame.MIN_WIDTH ||
        width > MinesweeperGame.MAX_WIDTH) {
        throw new MinesweeperGameException("Значение за пределами определенного диапозона.")
    }
    this._width = width;
};

MinesweeperGame.prototype._setHeight = function(height) {
    if (typeof height != "number") {
        throw new MinesweeperGameException("Некорректное значение высоты.");
    } else if (height < MinesweeperGame.MIN_HEIGHT ||
        height > MinesweeperGame.MAX_HEIGHT) {
        throw new MinesweeperGameException("Значение за пределами определенного диапозона.")
    }
    this._height = height;
};

MinesweeperGame.prototype._setMinesNumber = function(minesNumber) {
    if (typeof minesNumber != "number") {
        throw new MinesweeperGameException("Некорректное значение количества мин.");
    } else if (minesNumber < MinesweeperGame.MIN_MINES ||
        minesNumber > MinesweeperGame.MAX_MINES) {
        throw new MinesweeperGameException("Значение за пределами определенного диапозона.")
    } else if (minesNumber >= this.countCells()) {
        throw new MinesweeperGameException("Мин больше чем клеток!");
    }
    this._minesNumber = minesNumber;
};

function MinesweeperGameException(message) {
    this.name    = "MinesweeperModelException";
    this.message = message;
}
