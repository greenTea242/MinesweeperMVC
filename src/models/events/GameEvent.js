function GameEvent(type, data) {
    SyntheticEvent.apply(this, arguments);
}

GameEvent.prototype   = Object.create(SyntheticEvent.prototype);
GameEvent.constructor = SyntheticEvent;

GameEvent.CELL_CHANGED          = "cell changed";
GameEvent.SEVERAL_CELLS_CHANGED = "several cells changed";
GameEvent.GAME_STATUS_CHANGED   = "status changed";
GameEvent.TIMER_VALUE_CHANGED   = "timer value changed";
GameEvent.FLAGS_COUNTER_CHANGED = "flags counter changed";
GameEvent.FACE_CHANGED          = "face changed";
GameEvent.NEW_GAME              = "new game";
GameEvent.GAME_OVER             = "game over";

GameEvent.typeList = [
    GameEvent.CELL_CHANGED,
    GameEvent.SEVERAL_CELLS_CHANGED,
    GameEvent.GAME_STATUS_CHANGED,
    GameEvent.TIMER_VALUE_CHANGED,
    GameEvent.FLAGS_COUNTER_CHANGED,
    GameEvent.FACE_CHANGED,
    GameEvent.NEW_GAME,
    GameEvent.GAME_OVER
];

GameEvent.prototype._setType = function(type) {
    if (typeof type !=  "string") {
        throw new GameEventException("Требуется строка.");
    } else if (GameEvent.typeList.indexOf(type) == -1) {
        throw new GameEventException("Несуществующий тип.");
    }
    this.type = type;
};

function GameEventException(message) {
    this.name    = "GameEventException";
    this.message = message;
}
