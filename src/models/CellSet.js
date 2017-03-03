function CellSet() {
    this._parentContainer = {};
}

CellSet.prototype.getParentContainer = function() {
    return this._parentContainer;
};

CellSet.prototype.add = function(x, y) {
    if (this.hasCell(x, y)) {
        throw new MinesweeperGameException("Клетка уже существует в множестве.");
    }
    if (!this._parentContainer[y]) {
        this._parentContainer[y] = {};
    }
    this._parentContainer[y][x] = true;
};

CellSet.prototype.hasCell = function(x, y) {
    if (this._parentContainer[y]) {
        return this._parentContainer[y][x] !== undefined;
    }
    return false;
};

CellSet.prototype.remove = function(x, y) {
    if (!this.hasCell(x, y)) {
        throw new СellSetException("Отсутсвует флаг с данными коориданатами.");
    }
    delete this._parentContainer[y][x];
    if (Object.keys(this._parentContainer[y]).length == 0) {
        delete this._parentContainer[y];
    }
};

//Метод подсчета количества клеток
CellSet.prototype.count = function() {
    var counter = 0;
    for (var y in this._parentContainer) {
        if (!this._parentContainer.hasOwnProperty(y)) continue;
        for (var x in this._parentContainer[y]) {
            if (!this._parentContainer[y].hasOwnProperty(x)) continue;
            counter++;
        }
    }
    return counter;
};

//Метод выполняющий функцию для каждой клетки
CellSet.prototype.forEach = function(func) {
    for (var y in this._parentContainer) {
        if (!this._parentContainer.hasOwnProperty(y)) continue;
        for (var x in this._parentContainer[y]) {
            if (!this._parentContainer[y].hasOwnProperty(x)) continue;
            func(+x, +y);
        }
    }
};

CellSet.prototype.some = function(func) {
    for (var y in this._parentContainer) {
        if (!this._parentContainer.hasOwnProperty(y)) continue;
        for (var x in this._parentContainer[y]) {
            if (!this._parentContainer[y].hasOwnProperty(x)) continue;
            if (func(+x, +y)) {
                return true;
            }
        }
    }
    return false;
};

//Метод удаляющий у своего множества совпадения из множества-аргумента
CellSet.prototype.diff = function(cellSet) {
    if (!(cellSet instanceof CellSet)) {
        throw new СellSetException("Требуется объект класса CellSet.");
    }
    var cellSetBody = cellSet.getParentContainer();
    for (var y in cellSetBody) {
        if (!cellSetBody.hasOwnProperty(y)) continue;
        for (var x in cellSetBody[y]) {
            if (!cellSetBody[y].hasOwnProperty(x)) continue;
            if (this.hasCell(+x, +y)) {
                this.remove(+x, +y);
            }
        }
    }
};

//Метод соединяющий два множества
CellSet.prototype.merge = function(cellSet) {
    if (!(cellSet instanceof CellSet)) {
        throw new СellSetException("Требуется объект класса CellSet.");
    }
    var cellSetBody = cellSet.getParentContainer();
    for (var y in cellSetBody) {
        if (!cellSetBody.hasOwnProperty(y)) continue;
        for (var x in cellSetBody[y]) {
            if (!cellSetBody[y].hasOwnProperty(x)) continue;
            if (!this.hasCell(+x, +y)) {
                this.add(+x, +y);
            }
        }
    }
};

CellSet.prototype.countEqualCells = function(cellSet) {
    if (!(cellSet instanceof CellSet)) {
        throw new СellSetException("Требуется объект класса CellSet.");
    }
    var counter = 0;
    var cellSetBody = cellSet.getParentContainer();
    for (var y in cellSetBody) {
        if (!cellSetBody.hasOwnProperty(y)) continue;
        for (var x in cellSetBody[y]) {
            if (!cellSetBody[y].hasOwnProperty(x)) continue;
            if (this.hasCell(x, y)) {
                counter++;
            }
        }
    }
    return counter;
};

function СellSetException(message) {
    this.name    = "СellSetException";
    this.message = message;
}
