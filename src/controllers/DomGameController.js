function DomGameController(minesweeperGame, domGameView) {
    this._game        = null;
    this._domGameView = null;
    this._setGame(minesweeperGame);
    this._setDomGameView(domGameView);
    this._attachToDomGameView();
    this._setEvents();
}

DomGameController.prototype.open = function(x, y) {
    this._game.open(x, y);
};

DomGameController.prototype.toggleFlag = function(x, y) {
    this._game.toggleFlag(x, y);
};

DomGameController.prototype.resign = function() {
    this._game.resign();
};

DomGameController.prototype.reset = function() {
    this._game.reset();
};

DomGameController.prototype.chooseDevOption = function(option) {
    if (option == DomGameView.DEV_TOOLS_OPTION_1) {
        this._game.showMines();
    } else if (option == DomGameView.DEV_TOOLS_OPTION_2) {
        this._game.hideMines();
    } else {
        throw new DomGameControllerException("Некорректная опция.");
    }
};

DomGameController.prototype.chooseUserOption = function(option) {
    if (option == DomGameView.USER_TOOLS_OPTION_1) {
        this._game.resign();
    } else {
        throw new DomGameControllerException("Некорректная опция.");
    }
};

DomGameController.prototype.choosePopupOption = function(option) {
    if (option == DomGameView.POPUP_OPTION_1) {
        this._game.reset();
    } else if (option == PopupEvent.CLOSE_OPTION) {
        alert("¯\\_(ツ)_/¯");
    } else {
        throw new DomGameControllerException("Некорректная опция.");
    }
};

DomGameController.prototype._setGame = function(minesweeperGame) {
    if (!(minesweeperGame instanceof MinesweeperGame)) {
        throw new ConsoleGameViewException("Неправильный тип аргумента minesweeperGame.");
    }
    this._game = minesweeperGame;
};

DomGameController.prototype._setDomGameView = function(domGameView) {
    if (!(domGameView instanceof DomGameView)) {
        throw new DomGameViewException("Неправильный тип аргумента domView.");
    }
    this._domGameView = domGameView;
};

DomGameController.prototype._attachToDomGameView = function() {
    var dispatcher = this._domGameView.getDispatcher();
    var that       = this;
    dispatcher.addEventListener(DomGameViewEvent.CLICK_TO_FIELD_LEFT, function(event) {
        that.open(event.data.x, event.data.y);
    });
    dispatcher.addEventListener(DomGameViewEvent.CLICK_TO_FIELD_RIGHT, function(event) {
        that.toggleFlag(event.data.x, event.data.y);
    });
    dispatcher.addEventListener(DomGameViewEvent.CLICK_TO_FACE_LEFT, function(event) {
        that.reset();
    });
    dispatcher.addEventListener(DomGameViewEvent.CLICK_TO_DEV_OPTIONS_LEFT, function(event) {
        that.chooseDevOption(event.data.option);
    });
    dispatcher.addEventListener(DomGameViewEvent.CLICK_TO_USER_OPTIONS_LEFT, function(event) {
        that.chooseUserOption(event.data.option);
    });
    dispatcher.addEventListener(DomGameViewEvent.POPUP_CREATED, function(event) {
        that._attachToPopup();
    });
};

DomGameController.prototype._attachToPopup = function() {
    var popup = this._domGameView.getPopupView();
    if (!popup) {
        throw new DomGameControllerException("Popup отсутствует у View.")
    }
    var dispatcher = popup.getDispatcher();
    var that       = this;
    dispatcher.addEventListener(PopupEvent.SELECT_OPTION, function(event) {
        that.choosePopupOption(event.data.option);
    });
};

DomGameController.prototype._setEvents = function() {
    this._domGameView.addLeftClickToFieldListener();
    this._domGameView.addRightClickToFieldListener();
    this._domGameView.addLeftClickToFaceListener();
    this._domGameView.addLeftClickToDevOptionsListener();
    this._domGameView.addLeftClickToUserOptionsListener();
};

function DomGameControllerException(message) {
    this.name    = "DomGameControllerException";
    this.message = message;
}
