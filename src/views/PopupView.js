function PopupView(parentView, headerText, bodyText, cancelBtnTxt) {
    if (!parentView.getContainer) {
        throw new PopupViewException("Необходим заданный метод у аргумента-объекта.");
    }
    this._parentView = parentView;
    //За счет этого элемента из parentView будет позионироваться popup
    this._cells = parentView.getContainer();

    this._container   = null;
    this._modalWindow = null;

    this._buttons      = null;
    this._cancelButton = null;

    this._dispatcher = new EventDispatcher();

    this._createContainer(headerText, bodyText, cancelBtnTxt);
    this._createModalWindow();
}

PopupView.prototype.getContainer = function() {
    return this._container;
};

PopupView.prototype.getButtons = function() {
    return this._buttons;
};

PopupView.prototype.getDispatcher = function() {
    return this._dispatcher;
};

PopupView.prototype.addButton = function(option, title) {
    if (!this._buttons) {
        throw new PopupViewException("Необходимо создать контейнер кнопок.");
    }
    var button            = document.createElement("button");
    button.textContent    = title;
    button.dataset.option = option;
    this._buttons.insertBefore(button, this._buttons.firstElementChild);
};

PopupView.prototype.show = function() {
    if (!this._container ||
        !this._cells) {
        throw new PopupViewException("Необходимо создать контейнер.");
    }
    this._cells.appendChild(this._container);
    this._addLeftClickToPopupButtonsListener();
    this._fixPosition();
    this._dispatcher.dispatchEvent(
        new PopupEvent(PopupEvent.POPUP_CREATED, this)
    );
};

PopupView.prototype.remove = function() {
    if (!this._container ||
        !this._cells) {
        throw new PopupViewException("Необходимо создать контейнер.");
    } else if (!this._modalWindow) {
        throw new PopupEventException("Неободимо создать модальное окно.");
    }
    var popupBody   = this._container;
    var popupParent = this._cells;
    popupParent.removeChild(popupBody);
    var modalWindow       = this._modalWindow;
    var modalWindowParent = modalWindow.parentNode;
    modalWindowParent.removeChild(modalWindow);
    this._dispatcher.dispatchEvent(new PopupEvent(PopupEvent.POPUP_REMOVED));
};

PopupView.prototype._fixPosition = function() {
    if (!this._container) {
        throw new PopupViewException("Необходимо создать контейнер.");
    } else if (!this._container.parentNode) {
        throw new PopupViewException("Popup не соединен с DOM.");
    }
    this._container.style.marginTop  = -this._container.offsetHeight / 2 + "px";
    this._container.style.marginLeft = -this._container.offsetWidth  / 2 + "px";
};

PopupView.prototype._createContainer = function(headerTxt, bodyTxt, cancelBtnTxt) {
    var template  = document.querySelector(".template-popup");
    if (!template) {
        throw new PopupViewException("Не найдет шаблон.");
    }
    var templateInner = template.innerHTML;
    templateInner     = templateInner.replace(/\{\{header-text}}/, headerTxt);
    templateInner     = templateInner.replace(/\{\{body-text}}/, bodyTxt);

    this._container = Util.createElem("div", null, ["popup-container"], null, templateInner);
    this._createButtons(cancelBtnTxt);
};

PopupView.prototype._createButtons  = function(cancelBtnTxt) {
    if (!this._container) {
        throw new PopupViewException("Необходимо создать контейнер.");
    }
    this._buttons                  = this._container.querySelector(".popup-options");
    this._cancelButton             = this._buttons.querySelector(".cancel-option");
    this._cancelButton.textContent = cancelBtnTxt;
};

PopupView.prototype._addLeftClickToPopupButtonsListener = function() {
    if (!this._buttons) {
        throw new PopupViewException("Необходимо создать контейнер кнопок.");
    }
    var that = this;
    this._buttons.addEventListener("click", function(event) {
        var target = event.target;
        var option = target.dataset.option;
        if (!target.closest(".popup-options") ||
            target.tagName != "BUTTON") {
            return false;
        } else if (!option) {
            throw new DomGameViewException("Dataset не инициализирован у элемента.");
        }
        that._dispatcher.dispatchEvent(new PopupEvent(PopupEvent.SELECT_OPTION, {"option": option}));
    });
};

PopupView.prototype._createModalWindow = function() {
    if (!this._cells) {
        throw new PopupViewException("Необходимо создать контейнер.");
    }
    var space         = this._cells;
    this._modalWindow = Util.createElem("div", space, ["modal-window"]);
};

function PopupViewException(message) {
    this.name    = "PopupException";
    this.message = message;
}
