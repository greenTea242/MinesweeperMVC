function DomGameView(minesweeperGame) {
    this._minesweeperGame = null;

    this._gameContainer = null;

    this._userOptions   = null;
    this._devOptions    = null;
    this._gameStatusBar = null;

    this._header       = null;
    this._face         = null;
    this._timerValue   = null;
    this._flagsCounter = null;

    this._field = null;

    this._setMinesweeperGame(minesweeperGame);
    //Подписались на события
    this.attach();
    this._createGameContainer();
    //Отменили открытие меню правым кликом
    this.preventContextMenuOnField();
}

DomGameView.SURRENDER_USER_OPTION = 1;
DomGameView.SHOW_MINES_DEV_OPTION = 2;
DomGameView.HIDE_MINES_DEV_OPTION = 3;

DomGameView.COOL_FACE   = "cool-face";
DomGameView.DEAD_FACE   = "dead-face";
DomGameView.WIN_FACE    = "win-face";
DomGameView.DANGER_FACE = "danger-face";

//Поделиться с дочерними View и Controller(?) моделью
DomGameView.prototype.getMinesweeperGame = function() {
    return this._minesweeperGame;
};

DomGameView.prototype.clickToFieldLeft = function(func) {
    this._addLeftMouseDownToFieldListener();
    this._addLeftMouseUpToFieldListener(func);
};

DomGameView.prototype.clickToFieldRight = function(func) {
    this._addRightMouseDownToFieldListener(func);
};

DomGameView.prototype.clickToFaceLeft = function(func) {
    this._addLeftClickToFaceListener(func);
};

DomGameView.prototype.clickToDevOptionsLeft = function(func) {
    this._addLeftClickToDevOptionsListener(func);
};

DomGameView.prototype.clickToUserOptionsLeft = function(func) {
    this._addLeftClickToUserOptionsListener(func);
};

DomGameView.prototype.preventContextMenuOnField = function() {
    this._field.addEventListener("contextmenu", function(event) {
        event.preventDefault();
    });
};

DomGameView.prototype.setFaceType = function(type) {
    if (!this._face) {
        throw new DomGameViewException("Нет ссылки на элемент.");
    } else if (this._getFaceType()) {
        this.removeFaceType();
    }
    this._face.classList.add(type);
};

DomGameView.prototype.removeFaceType = function() {
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

//Метод передачи виджетам элемента в котором они будут позионироваться
DomGameView.prototype.getAnchorForChildrenView = function() {
    return this._gameContainer;
};

//Метод передачи для виджетов элемента который заблочится модальным окном
DomGameView.prototype.getSpaceForModalWindow = function() {
    return this._gameContainer;
};

DomGameView.prototype.attach = function() {
    if (!this._minesweeperGame) {
        throw new DomGameViewException("Необходимо инициализировать модель.");
    }
    var that = this;
    this._minesweeperGame.addEventListener(GameEvent.TIMER_VALUE_CHANGED, function(e) {
        that._redrawTimerValue();
    });
    this._minesweeperGame.addEventListener(GameEvent.CELL_CHANGED, function(e) {
        that._redrawCell(+e.data.x, +e.data.y);
    });
    this._minesweeperGame.addEventListener(GameEvent.SEVERAL_CELLS_CHANGED, function(e) {
        that._redrawSeveralCells(e.data);
    });
    this._minesweeperGame.addEventListener(GameEvent.GAME_STATUS_CHANGED, function(e) {
        that._redrawGameStatusBar();
    });
    this._minesweeperGame.addEventListener(GameEvent.FLAGS_COUNTER_CHANGED, function(e) {
        that._redrawFlagsCounter();
    });
    this._minesweeperGame.addEventListener(GameEvent.NEW_GAME, function(e) {
        that.setFaceType(DomGameView.COOL_FACE);
        if (that._popupView ||
            that._popupCntr) {
            that._removePopup();
        }
    });
    this._minesweeperGame.addEventListener(GameEvent.GAME_OVER, function(e) {
        var message = that._getMessageForPopup();
        that._createPopup(message);
    });
};

DomGameView.prototype._createGameContainer = function() {
    this._gameContainer = Util.createElem("div", document.body, ["game-container"]);
    this._createUserTools();
    this._createDevTools();
    this._createHeader();
    this._createField();
    this._fixHeaderWidth();
};

DomGameView.prototype._createPopup = function(message) {
    var template    = document.querySelector(".template-popup");
    this._popupView = new PopupView(this, template.innerHTML, message);
    this._popupCntr = new PopupController(this, this._popupView);
};

DomGameView.prototype._removePopup = function() {
    var popupBody   = this._popupView.getPopupBody();
    var popupParent = popupBody.parentNode;
    popupParent.removeChild(popupBody);
    var modalWindow       = this._popupView.getModalWindow();
    var modalWindowParent = modalWindow.parentNode;
    modalWindowParent.removeChild(modalWindow);
    this._popupView = null;
    this._popupCntr = null;
};

DomGameView.prototype._getMessageForPopup = function() {
    switch(this._minesweeperGame.getGameStatus()) {
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
    //Не всегда шапка правильно удлиняется под поле (бордер по 0.8 вместо 1)
    //console.log(borderLeftWidth, borderRightWidth, fieldWidth, this.getHeader().offsetWidth);
};

DomGameView.prototype._redrawTimerValue = function() {
    if (!this._timerValue) {
        throw new DomGameViewException("Отсутствует свойство _timerValue.");
    }
    var value = this._minesweeperGame.getTimerValue();
    this._setTimerValue(value);
};

DomGameView.prototype._addLeftMouseUpToFieldListener = function(func) {
    var that = this;
    this._field.addEventListener("mouseup", function(event) {
        var target = event.target;
        if (!target.dataset.x ||
            !target.dataset.y) {
            throw new DomGameViewException("Dataset не инициализирован у элемента.");
        } else if (event.which != 1) {
            return false;
        }
        func(+target.dataset.x, +target.dataset.y);
        switch(that._minesweeperGame.getGameStatus()) {
            case MinesweeperGame.STATUS_WIN:     that.setFaceType(DomGameView.WIN_FACE);  break;
            case MinesweeperGame.STATUS_LOSE:    that.setFaceType(DomGameView.DEAD_FACE); break;
            case MinesweeperGame.STATUS_PLAYING: that.setFaceType(DomGameView.COOL_FACE); break;
            default: throw new DomGameViewException("Неизвестный игровой статус.");
        }
    });
};

DomGameView.prototype._addLeftClickToDevOptionsListener = function(func) {
    this._devOptions.addEventListener("click", function(event) {
        var target = event.target;
        if (!target.dataset.option) {
            throw new DomGameViewException("Dataset не инициализирован у элемента.");
        } else if(!target.closest(".dev-options") ||
            target.tagName != "BUTTON") {
            return false;
        } else if (event.which == 1) {
            func(+target.dataset.option);
        }
    });
};

DomGameView.prototype._addLeftClickToUserOptionsListener = function(func) {
    this._userOptions.addEventListener("click", function(event) {
        var target = event.target;
        if (!target.dataset.option) {
            throw new DomGameViewException("Dataset не инициализирован у элемента.");
        } else if(!target.closest(".user-options") ||
            target.tagName != "BUTTON") {
            return false;
        } else if (event.which == 1) {
            func(+target.dataset.option);
        }
    });
};

//Установка флажков
DomGameView.prototype._addRightMouseDownToFieldListener = function(func) {
    this._field.addEventListener("mousedown", function(event) {
        var target = event.target;
        if (!target.dataset.x ||
            !target.dataset.y) {
            throw new DomGameViewException("Dataset не инициализирован у элемента.");
        } else if (event.which == 3) {
            func(+target.dataset.x, +target.dataset.y);
        }
    });
};

DomGameView.prototype._addLeftClickToFaceListener = function(func) {
    this._face.addEventListener("click", function(event) {
        func();
    });
};

//Поменять смайлик как в классическом сапере
DomGameView.prototype._addLeftMouseDownToFieldListener = function() {
    var that = this;
    this._field.addEventListener("mousedown", function(event) {
        if (event.which == 1) {
            that.setFaceType(DomGameView.DANGER_FACE);
        }
    });
};

DomGameView.prototype._redrawFlagsCounter = function() {
    if (!this._flagsCounter) {
        throw new DomGameViewException("Отсутствует свойство _flagsCounter.");
    }
    var value = this._minesweeperGame.getFlagsCounter();
    this._setFlagsCounter(value);
};

DomGameView.prototype._redrawCell = function (x, y) {
    var cell = this._getCell(x, y);
    var visibleMines = this._minesweeperGame.getVisibleMines();
    var openCells    = this._minesweeperGame.getOpenCells();
    var flags        = this._minesweeperGame.getFlags();
    if (flags.hasCell(x, y)) {
        cell.classList.add("flag");
        cell.textContent = "F";
    } else if (visibleMines.hasCell(x, y)) {
        cell.classList.add("mine");
        cell.textContent = "M";
    } else if (openCells.hasCell(x, y)) {
        var minesCounter = this._minesweeperGame.countNearMines(x, y);
        cell.classList.add("near-mines-" + minesCounter);
        cell.textContent = minesCounter;
    } else {
        cell.className = "cell";
        cell.textContent = "";
    }
};

DomGameView.prototype._redrawSeveralCells = function(dict) {
    if (!(dict instanceof Dictionary)) {
        throw new DomGameViewException("Аргумент не словарь.");
    }
    dict.forEach(this._redrawCell.bind(this));
};

DomGameView.prototype._redrawGameStatusBar = function() {
    this._gameStatusBar.textContent = this._minesweeperGame.getGameStatus();
};

DomGameView.prototype._setFlagsCounter = function(value) {
    if (!this._flagsCounter) {
        throw new DomGameViewException("Нет ссылки на элемент.");
    }
    value = this._getThreeDigitsString(value);
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
    value = this._getThreeDigitsString(value);
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
    var template  = document.querySelector(".template-user-tools");
    var userTools = Util.createElem("div", this._gameContainer, ["user-tools"], null, template.innerHTML);
    this._userOptions = userTools.querySelector(".user-options");
};

DomGameView.prototype._createDevTools = function() {
    var template                    = document.querySelector(".template-dev-tools");
    var devTools                    = Util.createElem("div", this._gameContainer, ["dev-tools"], null, template.innerHTML);
    this._devOptions                = devTools.querySelector(".dev-options");
    this._gameStatusBar             = devTools.querySelector(".game-status-bar");
    this._gameStatusBar.textContent = this._minesweeperGame.getGameStatus();
};

DomGameView.prototype._createHeader = function() {
    var template       = document.querySelector(".template-header");
    this._header       = Util.createElem("div", this._gameContainer, ["header"], null, template.innerHTML);
    this._flagsCounter = this._header.querySelector(".flags-counter");
    this._timerValue   = this._header.querySelector(".timer-value");
    this._face         = this._header.querySelector(".face");
    this._setFlagsCounter(this._minesweeperGame.getFlagsCounter());
    this._setTimerValue(this._minesweeperGame.getTimerValue());
    this.setFaceType(DomGameView.COOL_FACE);
};

DomGameView.prototype._createField = function() {
    var container = Util.createElem("div", this._gameContainer, ["outer-field"]);
    var field     = Util.createElem("table", container, ["field", "no-select"]);
    for (var y = 1; y <= this._minesweeperGame.getHeight(); y++) {
        var tr = Util.createElem("tr", field);
        for (var x = 1; x <= this._minesweeperGame.getWidth(); x++) {
            var td = Util.createElem("td", tr, ["cell"], null, null, {"x": x, "y": y});
        }
    }
    this._field = field;
};

DomGameView.prototype._getCell = function(x, y) {
    if (!this._field) {
        throw new DomGameViewException("Необходимо поле.");
    }
    x = "\'" + x + "\'";
    y = "\'" + y + "\'";
    var cell = this._field.querySelector("td[data-x=" + x + "][data-y= " +  y + "]");
    if (!cell) {
        throw new DomGameViewException("Клетка не найдена.");
    }
    return cell;
};

DomGameView.prototype._setMinesweeperGame = function(minesweeperGame) {
    if (!(minesweeperGame instanceof MinesweeperGame)) {
        throw new DomGameViewException("Неправильный тип аргумента minesweeperGame.");
    }
    this._minesweeperGame = minesweeperGame;
};

function DomGameViewException(message) {
    this.name    = "DomGameViewException";
    this.message = message;
}
