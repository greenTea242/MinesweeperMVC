function DomGameViewEvent(type, data) {
    SyntheticEvent.apply(this, arguments);
}

DomGameViewEvent.prototype   = Object.create(SyntheticEvent.prototype);
DomGameViewEvent.constructor = SyntheticEvent;

DomGameViewEvent.CLICK_TO_FIELD_LEFT  = "click to field left";
DomGameViewEvent.CLICK_TO_FIELD_RIGHT = "click to field right";

DomGameViewEvent.CLICK_TO_FACE_LEFT = "click to face left";

DomGameViewEvent.CLICK_TO_DEV_OPTIONS_LEFT   = "click to dev options left";
DomGameViewEvent.CLICK_TO_USER_OPTIONS_LEFT  = "click to user options left";
DomGameViewEvent.CLICK_TO_POPUP_OPTIONS_LEFT = "click to popup options left";

DomGameViewEvent.POPUP_CREATED = "popup created.";
DomGameViewEvent.POPUP_REMOVED = "popup removed";

DomGameViewEvent.typeList = [
    DomGameViewEvent.CLICK_TO_FIELD_LEFT,
    DomGameViewEvent.CLICK_TO_FIELD_RIGHT,
    DomGameViewEvent.CLICK_TO_FACE_LEFT,
    DomGameViewEvent.CLICK_TO_DEV_OPTIONS_LEFT,
    DomGameViewEvent.CLICK_TO_USER_OPTIONS_LEFT,
    DomGameViewEvent.CLICK_TO_POPUP_OPTIONS_LEFT,
    DomGameViewEvent.POPUP_CREATED
];

DomGameViewEvent.prototype._setType = function(type) {
    if (typeof type !=  "string") {
        throw new DomGameViewEventException("Требуется строка.");
    } else if (DomGameViewEvent.typeList.indexOf(type) == -1) {
        throw new DomGameViewEventException("Несуществующий тип.");
    }
    this.type = type;
};

function DomGameViewEventException(message) {
    this.name    = "DomGameViewEventException";
    this.message = message;
}
