function GameEvent(type, data) {
    SyntheticEvent.apply(this, arguments);
}

GameEvent.prototype   = Object.create(SyntheticEvent.prototype);
GameEvent.constructor = SyntheticEvent;

GameEvent.CELL_CHANGED          = "Cell changed.";
GameEvent.SEVERAL_CELLS_CHANGED = "Several cells changed.";
GameEvent.GAME_STATUS_CHANGED   = "Status changed.";
GameEvent.TIMER_VALUE_CHANGED   = "Timer value changed.";
GameEvent.FLAGS_COUNTER_CHANGED = "Flags counter changed.";
GameEvent.FACE_CHANGED          = "Face changed.";
GameEvent.NEW_GAME              = "New game.";
GameEvent.GAME_OVER             = "Game over.";

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
