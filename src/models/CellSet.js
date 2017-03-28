function CellSet() {
    this._cells = {};
}

CellSet.prototype.getCellList = function() {
    return this._cells;
};

CellSet.prototype.getCell = function(x, y) {
    var cell = this._cells[y][x];
    if (!cell) {
        throw new СellSetException("Клетка не найдена.");
    }
    return cell;
};

CellSet.prototype.add = function(x, y, value) {
    if (this.hasCell(x, y)) {
        throw new MinesweeperGameException("Клетка уже существует в множестве.");
    }
    if (!this._cells[y]) {
        this._cells[y] = {};
    }
    this._cells[y][x] = value;
};

CellSet.prototype.hasCell = function(x, y) {
    return !!(this._cells[y] && this._cells[y][x]);
};

CellSet.prototype.remove = function(x, y) {
    if (!this.hasCell(x, y)) {
        throw new СellSetException("Отсутсвует флаг с данными коориданатами.");
    }
    delete this._cells[y][x];
    if (Object.keys(this._cells[y]).length == 0) {
        delete this._cells[y];
    }
};

//Метод подсчета количества клеток
CellSet.prototype.count = function() {
    var counter = 0;
    for (var y in this._cells) {
        if (!this._cells.hasOwnProperty(y)) continue;
        for (var x in this._cells[y]) {
            if (!this._cells[y].hasOwnProperty(x)) continue;
            counter++;
        }
    }
    return counter;
};

//Метод выполняющий функцию для каждой клетки
CellSet.prototype.forEach = function(func) {
    for (var y in this._cells) {
        if (!this._cells.hasOwnProperty(y)) continue;
        for (var x in this._cells[y]) {
            if (!this._cells[y].hasOwnProperty(x)) continue;
            func(+x, +y);
        }
    }
};

CellSet.prototype.some = function(func) {
    for (var y in this._cells) {
        if (!this._cells.hasOwnProperty(y)) continue;
        for (var x in this._cells[y]) {
            if (!this._cells[y].hasOwnProperty(x)) continue;
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
    var cellSetBody = cellSet.getCellList();
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
    var cellSetBody = cellSet.getCellList();
    for (var y in cellSetBody) {
        if (!cellSetBody.hasOwnProperty(y)) continue;
        for (var x in cellSetBody[y]) {
            if (!cellSetBody[y].hasOwnProperty(x)) continue;
            if (!this.hasCell(+x, +y)) {
                this.add(+x, +y, cellSetBody[y][x]);
            }
        }
    }
};

CellSet.prototype.countEqualCells = function(cellSet) {
    if (!(cellSet instanceof CellSet)) {
        throw new СellSetException("Требуется объект класса CellSet.");
    }
    var counter = 0;
    var cellSetBody = cellSet.getCellList();
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
