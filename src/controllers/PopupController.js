function PopupController(parentView, popupView) {
    if (!(popupView instanceof PopupView)) {
        throw new PopupControllerException("Неправильный класс аргумента.");
    } else if (!parentView.getMinesweeperGame) {
        throw new PopupController("Требуется parentView с определенной model.");
    }
    this._popupView  = popupView;
    this._parentView = parentView;
    this._setEvents();
}

PopupController.prototype.choosePopupOption = function(option) {
    if (option == PopupView.POPUP_NEW_GAME_OPTION) {
        this._parentView.getMinesweeperGame().reset();
    } else if (option == PopupView.POPUP_CANCEL_OPTION) {
        alert("¯\_(ツ)_/¯");
    } else {
        throw new PopupControllerException("Некорректная опция.");
    }
};

PopupController.prototype._setEvents = function() {
    this._popupView.clickToPopupOption(this.choosePopupOption.bind(this))
};

function PopupControllerException(message) {
    this.name    = "PopupException";
    this.message = message;
}
