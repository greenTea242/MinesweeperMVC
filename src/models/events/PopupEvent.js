function PopupEvent(type, data) {
    SyntheticEvent.apply(this, arguments);
}

PopupEvent.prototype   = Object.create(SyntheticEvent.prototype);
PopupEvent.constructor = SyntheticEvent;

PopupEvent.SELECT_OPTION = "select";
PopupEvent.CLOSE_OPTION  = "close";
PopupEvent.POPUP_CREATED = "created";
PopupEvent.POPUP_REMOVED = "removed";

function PopupEventException(message) {
    this.name    = "PopupEventException";
    this.message = message;
}
