function Dictionary() {
    this._dictBody = {};
}

Dictionary.prototype.getDictValue = function() {
    return this._dictBody;
};

Dictionary.prototype.addCell = function(x, y) {
    if (this.hasCell(x, y)) {
        throw new MinesweeperGameException("Клетка уже существует в словаре.");
    }
    if (!this._dictBody[y]) {
        this._dictBody[y] = {};
    }
    this._dictBody[y][x] = true;
};

Dictionary.prototype.hasCell = function(x, y) {
    if (this._dictBody[y]) {
        return this._dictBody[y][x] !== undefined;
    }
    return false;
};

Dictionary.prototype.deleteCell = function(x, y) {
    if (!this.hasCell(x, y)) {
        throw new DictionaryException("Отсутсвует флаг с данными коориданатами.");
    }
    delete this._dictBody[y][x];
    if (Object.keys(this._dictBody[y]).length == 0) {
        delete this._dictBody[y];
    }
};

//Метод подсчета количества клеток
Dictionary.prototype.count = function() {
    var counter = 0;
    for (var y in this._dictBody) {
        if (!this._dictBody.hasOwnProperty(y)) continue;
        for (var x in this._dictBody[y]) {
            if (!this._dictBody[y].hasOwnProperty(x)) continue;
            counter++;
        }
    }
    return counter;
};

//Метод выполняющий функцию для каждой клетки
Dictionary.prototype.forEach = function(func) {
    for (var y in this._dictBody) {
        if (!this._dictBody.hasOwnProperty(y)) continue;
        for (var x in this._dictBody[y]) {
            if (!this._dictBody[y].hasOwnProperty(x)) continue;
            func(+x, +y);
        }
    }
};

Dictionary.prototype.some = function(func) {
    for (var y in this._dictBody) {
        if (!this._dictBody.hasOwnProperty(y)) continue;
        for (var x in this._dictBody[y]) {
            if (!this._dictBody[y].hasOwnProperty(x)) continue;
            if (func(+x, +y)) {
                return true;
            }
        }
    }
    return false;
};

//Метод удаляющий у своего словаря совпадения из словаря-аргумента
Dictionary.prototype.diff = function(dict) {
    if (!(dict instanceof Dictionary)) {
        throw new DictionaryException("Требуется объект класса Dictionary.");
    }
    var dictValue = dict.getDictValue();
    for (var y in dictValue) {
        if (!dictValue.hasOwnProperty(y)) continue;
        for (var x in dictValue[y]) {
            if (!dictValue[y].hasOwnProperty(x)) continue;
            if (this.hasCell(+x, +y)) {
                this.deleteCell(+x, +y);
            }
        }
    }
};

//Метод соединяющий два словаря*/
Dictionary.prototype.merge = function(dict) {
    if (!(dict instanceof Dictionary)) {
        throw new DictionaryException("Требуется объект класса Dictionary.");
    }
    var dictValue = dict.getDictValue();
    for (var y in dictValue) {
        if (!dictValue.hasOwnProperty(y)) continue;
        for (var x in dictValue[y]) {
            if (!dictValue[y].hasOwnProperty(x)) continue;
            if (!this.hasCell(+x, +y)) {
                this.addCell(+x, +y);
            }
        }
    }
};

Dictionary.prototype.countEqualCells = function(dict) {
    if (!(dict instanceof Dictionary)) {
        throw new DictionaryException("Требуется объект класса Dictionary.");
    }
    var counter = 0;
    var dictValue = dict.getDictValue();
    for (var y in dictValue) {
        if (!dictValue.hasOwnProperty(y)) continue;
        for (var x in dictValue[y]) {
            if (!dictValue[y].hasOwnProperty(x)) continue;
            if (this.hasCell(x, y)) {
                counter++;
            }
        }
    }
    return counter;
};

function DictionaryException(message) {
    this.name    = "DictionaryException";
    this.message = message;
}
