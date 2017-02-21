function PopupView(parentView, template, message) {
    this._modalWindow = null;
    this._popupBody   = null;
    this._parentView  = parentView;
    //За счет какого элемента из parentView будет позионироваться popup
    var anchor        = parentView.getAnchorForChildrenView();
    template          = template.replace(/\{\{text}}/, message);
    var popupBody     = Util.createElem("div", anchor, ["popup-body"], null, template);
    var cords         = anchor.getBoundingClientRect();

    var top = cords.top + (anchor.offsetHeight / 2) - (popupBody.offsetHeight / 2) + "px";
    popupBody.style.top = top;

    var left = cords.left + (anchor.offsetWidth / 2) - (popupBody.offsetWidth / 2) + "px";
    popupBody.style.left = left;

    this._popupBody = popupBody;
    this._createModalWindow();
}

PopupView.POPUP_NEW_GAME_OPTION = 4;
PopupView.POPUP_CANCEL_OPTION   = 5;

PopupView.prototype.clickToPopupOption = function(func) {
    this._popupBody.addEventListener("click", function(event) {
        var target = event.target;
        if (!target.dataset.option) {
            throw new DomGameViewException("Dataset не инициализирован у элемента.");
        } else if (!target.closest(".popup-options") ||
            target.tagName != "BUTTON") {
            return false;
        } else if (event.which == 1) {
            func(+target.dataset.option);
        }
    });
};

PopupView.prototype.getPopupBody = function() {
    return this._popupBody;
};

PopupView.prototype.getModalWindow = function() {
    return this._modalWindow;
};

PopupView.prototype._createModalWindow = function() {
    var space = this._parentView.getSpaceForModalWindow();
    this._modalWindow = Util.createElem("div", space, ["modal-window"]);
};


function PopupViewException(message) {
    this.name    = "PopupException";
    this.message = message;
}
