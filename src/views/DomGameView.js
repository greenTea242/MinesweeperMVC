function DomGameView(game) {
    this._game = null;

    this._cells     = null;
    this._cellSet   = null;

    this._userOptions   = null;
    this._devOptions    = null;
    this._gameStatusBar = null;

    this._header       = null;
    this._face         = null;
    this._timerValue   = null;
    this._flagsCounter = null;

    this._field = null;

    this._popupView = null;

    this._dispatcher = new EventDispatcher();

    this._setGame(game);
    //Подписались на события
    this._attachToGame();
    this._createContainer();
    //Отменили открытие меню правым кликом
    this._preventContextMenuOnField();
    this._setEvents();
}

DomGameView.USER_TOOLS_OPTION_1 = "1";
DomGameView.DEV_TOOLS_OPTION_1  = "2";
DomGameView.DEV_TOOLS_OPTION_2  = "3";
DomGameView.POPUP_OPTION_1      = "4";

DomGameView.COOL_FACE   = "cool-face";
DomGameView.DANGER_FACE = "danger-face";
DomGameView.LOSE_FACE   = "lose-face";
DomGameView.WIN_FACE    = "win-face";

//Метод передачи виджетам элемента в котором они будут позионироваться.
//Возможно будет перекрыт модальным окном
DomGameView.prototype.getContainer = function() {
    return this._cells;
};

DomGameView.prototype.getDispatcher = function() {
    return this._dispatcher;
};

DomGameView.prototype.getPopupView = function() {
    return this._popupView;
};

DomGameView.prototype.createPopup = function(headerText, bodyText, popupOption1Txt, cancelBtnTxt) {
    this._popupView = new PopupView(this, headerText, bodyText, cancelBtnTxt);
    this._popupView.addButton(DomGameView.POPUP_OPTION_1, popupOption1Txt);
    this._popupView.show();
    this._dispatcher.dispatchEvent(
        new DomGameViewEvent(DomGameViewEvent.POPUP_CREATED, this._popupView)
    );
};

DomGameView.prototype.removePopup = function() {
    this._popupView.remove();
    this._popupView = null;
};

DomGameView.prototype._attachToGame = function() {
    if (!this._game) {
        throw new DomGameViewException("Необходимо инициализировать модель.");
    }
    var that       = this;
    var dispatcher = this._game.getDispatcher();
    dispatcher.addEventListener(GameEvent.TIMER_VALUE_CHANGED, function(event) {
        that._redrawTimerValue();
    });
    dispatcher.addEventListener(GameEvent.SEVERAL_CELLS_CHANGED, function(event) {
        if (!event.data) {
            throw new DomGameViewException("Не переданы данные.");
        }
        that._redrawSeveralCells(event.data);
    });
    dispatcher.addEventListener(GameEvent.GAME_STATUS_CHANGED, function(event) {
        that._redrawGameStatusBar();
    });
    dispatcher.addEventListener(GameEvent.FLAGS_COUNTER_CHANGED, function(event) {
        that._redrawFlagsCounter();
    });
    dispatcher.addEventListener(GameEvent.NEW_GAME, function(event) {
        that._setFaceType(DomGameView.COOL_FACE);
        if (that._popupView) {
            that.removePopup();
        }
    });
    dispatcher.addEventListener(GameEvent.GAME_OVER, function(event) {
        var gameStatus = that._game.getGameStatus();
        if (gameStatus == MinesweeperGame.STATUS_WIN) {
            that._setFaceType(DomGameView.WIN_FACE);
        } else if (gameStatus == MinesweeperGame.STATUS_LOSE) {
            that._setFaceType(DomGameView.LOSE_FACE)
        } else {
            throw new DomGameViewException("Неизвестный игровой статус.");
        }
        var headerText = that._getGameStatusMessage();
        that.createPopup(headerText, "Заново?", "Да", "Нет");
    });
};

DomGameView.prototype._preventContextMenuOnField = function() {
    this._field.addEventListener("contextmenu", function(event) {
        event.preventDefault();
    });
};


DomGameView.prototype._createContainer = function() {
    this._cells = Util.createElem("div", document.body, ["game-container"]);
    this._createUserTools();
    this._createDevTools();
    this._createHeader();
    this._createField();
    this._fixHeaderWidth();
};



DomGameView.prototype._getGameStatusMessage = function() {
    switch(this._game.getGameStatus()) {
        case MinesweeperGame.STATUS_WIN:  return "Вы победили!";
        case MinesweeperGame.STATUS_LOSE: return "Вы проиграли!";
        default: throw new DomGameViewException("Требуются определенные игровые состояния " +
            + "для вызова этого метода.");
    }
};

DomGameView.prototype._fixHeaderWidth = function() {
    if (!this._field ||
        !this._header) {
        throw new DomGameViewException("Необходимо инициализровать поля _field и _header.");
    }
    var fieldWidth       = this._field.offsetWidth;
    var header           = this._header;
    var borderLeftWidth  = header.clientLeft;
    var borderRightWidth = header.offsetWidth - header.clientWidth - header.clientLeft;
    header.style.width   = fieldWidth - borderLeftWidth + borderRightWidth  + "px";
};

DomGameView.prototype._redrawTimerValue = function() {
    if (!this._timerValue) {
        throw new DomGameViewException("Отсутствует свойство _timerValue.");
    }
    var value = this._game.getTimerValue();
    this._setTimerValue(value);
};

DomGameView.prototype._addLeftMouseUpToFieldListener = function() {
    var that = this;
    this._field.addEventListener("mouseup", function(event) {
        var target = event.target;
        var x      = +target.dataset.x;
        var y      = +target.dataset.y;
        if (event.which != 1          ||
            !target.closest(".field") ||
            target.tagName != "TD") {
            return false;
        } else if (!x || !y) {
            throw new DomGameViewException("Dataset не инициализирован у элемента.");
        }
        that._setFaceType(DomGameView.COOL_FACE);
        that._dispatcher.dispatchEvent(
            new DomGameViewEvent(DomGameViewEvent.CLICK_TO_FIELD_LEFT, {"x": x, "y": y})
        );
    });

};

//Поменять смайлик как в классическом сапере
DomGameView.prototype._addLeftMouseDownToFieldListener = function() {
    var that = this;
    this._field.addEventListener("mousedown", function(event) {
        var target = event.target;
        var x      = +target.dataset.x;
        var y      = +target.dataset.y;
        if (event.which != 1          ||
            !target.closest(".field") ||
            target.tagName != "TD") {
            return false;
        } else if (!x || !y) {
            throw new DomGameViewException("Dataset не инициализирован у элемента.");
        } else if (that._game.isPossibleToOpen(x, y)) {
            that._setFaceType(DomGameView.DANGER_FACE);
        }
    });
};

DomGameView.prototype._addRightMouseDownToFieldListener = function() {
    var that = this;
    this._field.addEventListener("mousedown", function(event) {
        var target = event.target;
        var x      = +target.dataset.x;
        var y      = +target.dataset.y;
        if (event.which != 3          ||
            !target.closest(".field") ||
            target.tagName != "TD") {
            return false;
        } else if (!x || !y) {
            throw new DomGameViewException("Dataset не инициализирован у элемента.");
        }
        that._dispatcher.dispatchEvent(
            new DomGameViewEvent(DomGameViewEvent.CLICK_TO_FIELD_RIGHT, {"x": x, "y": y})
        );
    });
};

DomGameView.prototype._redrawFlagsCounter = function() {
    if (!this._flagsCounter) {
        throw new DomGameViewException("Отсутствует свойство _flagsCounter.");
    }
    var value = this._game.getFlagsCounter();
    this._setFlagsCounter(value);
};

DomGameView.prototype._redrawCell = function(x, y) {
    var cell = this._getCell(x, y);
    if (this._game.hasFlag(x, y)) {
        cell.classList.add("flag");
        cell.textContent = "F";
    } else if (this._game.hasVisibleMine(x, y)) {
        cell.classList.add("mine");
        cell.textContent = "M";
    } else if (this._game.hasOpen(x, y) &&
        !this._game.hasInvisibleMine(x, y)) {
        var minesCounter = this._game.countNearMines(x, y);
        cell.classList.add("near-mines-" + minesCounter);
        cell.textContent = minesCounter;
    } else {
        cell.className   = "cell";
        cell.textContent = "";
    }
};

DomGameView.prototype._setFaceType = function(type) {
    if (!this._face) {
        throw new DomGameViewException("Нет ссылки на элемент.");
    } else if (this._getFaceType()) {
        this._removeFaceType();
    }
    this._face.classList.add(type);
};

DomGameView.prototype._removeFaceType = function() {
    if (!this._face) {
        throw new DomGameViewException("Нет ссылки на элемент.");
    }
    var faceType = this._getFaceType();
    if (faceType) {
        this._face.classList.remove(faceType);
    } else {
        throw new DomGameViewException("Нечего удалять.");
    }
};

DomGameView.prototype._redrawSeveralCells = function(cellSet) {
    if (!(cellSet instanceof CellSet)) {
        throw new DomGameViewException("Аргумент не множество.");
    }
    cellSet.forEach(this._redrawCell.bind(this));
};

DomGameView.prototype._redrawGameStatusBar = function() {
    this._gameStatusBar.textContent = this._game.getGameStatus();
};

DomGameView.prototype._setFlagsCounter = function(value) {
    if (!this._flagsCounter) {
        throw new DomGameViewException("Нет ссылки на элемент.");
    }
    value     = this._getThreeDigitsString(value);
    var array = value.split("");
    if (array.length != this._flagsCounter.children.length) {
        throw new DomGameViewException("Массивы не равны.");
    }
    for (var i = 0; i < array.length; i++) {
        this._flagsCounter.children[i].textContent = array[i];
    }
};

DomGameView.prototype._setTimerValue = function(value) {
    if (!this._timerValue) {
        throw new DomGameViewException("Нет ссылки на элемент.");
    }
    value     = this._getThreeDigitsString(value);
    var array = value.split("");
    if (array.length != this._timerValue.children.length) {
        throw new DomGameViewException("Массивы не равны.");
    }
    for (var i = 0; i < array.length; i++) {
        this._timerValue.children[i].textContent = array[i];
    }
};

DomGameView.prototype._getFaceType = function() {
    if (!this._face) {
        throw new DomGameViewException("Нет ссылки на элемент.");
    }
    var regex = /\w+-face/i;
    var match = this._face.className.match(regex);
    return (match) ? match[0] : null;
};

DomGameView.prototype._getThreeDigitsString = function(number) {
    return Util.repeatString(3 - Util.getNumberLength(number), "0") + number;
};

DomGameView.prototype._createUserTools = function() {
    var template      = document.querySelector(".template-user-tools");
    var userTools     = Util.createElem("div", this._cells, ["user-tools"], null, template.innerHTML);
    this._userOptions = userTools.querySelector(".user-options");
};

DomGameView.prototype._createDevTools = function() {
    var template                    = document.querySelector(".template-dev-tools");
    var devTools                    = Util.createElem("div", this._cells, ["dev-tools"], null, template.innerHTML);
    this._devOptions                = devTools.querySelector(".dev-options");
    this._gameStatusBar             = devTools.querySelector(".game-status-bar");
    this._gameStatusBar.textContent = this._game.getGameStatus();
};

DomGameView.prototype._createHeader = function() {
    var template       = document.querySelector(".template-header");
    this._header       = Util.createElem("div", this._cells, ["header"], null, template.innerHTML);
    this._flagsCounter = this._header.querySelector(".flags-counter");
    this._timerValue   = this._header.querySelector(".timer-value");
    this._face         = this._header.querySelector(".face");
    this._setFlagsCounter(this._game.getFlagsCounter());
    this._setTimerValue(this._game.getTimerValue());
    this._setFaceType(DomGameView.COOL_FACE);
};

DomGameView.prototype._createField = function() {
    var container = Util.createElem("div", this._cells, ["outer-field"]);
    var field     = Util.createElem("table", container, ["field", "no-select"]);
    var cellSet   = new CellSet();
    for (var y = 1; y <= this._game.getHeight(); y++) {
        var tr = Util.createElem("tr", field);
        for (var x = 1; x <= this._game.getWidth(); x++) {
            var td = Util.createElem("td", tr, ["cell"], null, null, {"x": x, "y": y});
            cellSet.add(x, y, td);
        }
    }
    this._field   = field;
    this._cellSet = cellSet;
};

DomGameView.prototype._getCell = function(x, y) {
    if (!this._cellSet) {
        throw new DomGameViewException("Необходим словарь клеток.");
    }
    return this._cellSet.getCell(x, y);
};

DomGameView.prototype._setEvents = function() {
    this._addLeftClickToFieldListener();
    this._addRightClickToFieldListener();
    this._addLeftClickToFaceListener();
    this._addLeftClickToDevOptionsListener();
    this._addLeftClickToUserOptionsListener();
};

DomGameView.prototype._addLeftClickToFaceListener = function() {
    var that = this;
    this._face.addEventListener("click", function(event) {
        var target = event.target;
        if (!target.classList.contains("face")) {
            return false;
        }
        that._dispatcher.dispatchEvent(
            new DomGameViewEvent(DomGameViewEvent.CLICK_TO_FACE_LEFT)
        );
    });
};

//Установка флажков
DomGameView.prototype._addRightClickToFieldListener = function() {
    this._addRightMouseDownToFieldListener();
};

DomGameView.prototype._addLeftClickToFieldListener = function() {
    this._addLeftMouseDownToFieldListener();
    this._addLeftMouseUpToFieldListener();
};

DomGameView.prototype._addLeftClickToDevOptionsListener = function() {
    var that = this;
    this._devOptions.addEventListener("click", function(event) {
        var target = event.target;
        var option = target.dataset.option;
        if (!target.closest(".dev-options") ||
            target.tagName != "BUTTON") {
            return false;
        } else if(!option) {
            throw new DomGameViewException("Dataset не инициализирован у элемента.");
        }
        that._dispatcher.dispatchEvent(
            new DomGameViewEvent(DomGameViewEvent.CLICK_TO_DEV_OPTIONS_LEFT, {"option": option})
        );
    });
};

DomGameView.prototype._addLeftClickToUserOptionsListener = function() {
    var that = this;
    this._userOptions.addEventListener("click", function(event) {
        var target = event.target;
        var option = target.dataset.option;
        if (!target.closest(".user-options") ||
            target.tagName != "BUTTON") {
            return false;
        } else if(!option) {
            throw new DomGameViewException("Dataset не инициализирован у элемента.");
        }
        that._dispatcher.dispatchEvent(
            new DomGameViewEvent(DomGameViewEvent.CLICK_TO_USER_OPTIONS_LEFT, {"option": option})
        );
    });
};

DomGameView.prototype._setGame = function(game) {
    if (!(game instanceof MinesweeperGame)) {
        throw new DomGameViewException("Неправильный тип аргумента minesweeperGame.");
    }
    this._game = game;
};

function DomGameViewException(message) {
    this.name    = "DomGameViewException";
    this.message = message;
}
