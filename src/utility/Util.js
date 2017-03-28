function Util() {}

Util.shuffle = function(array) {
    if (!Array.isArray(array)) {
        throw new UtilException("Аргумент не массив.");
    }
    array.sort(function() {
        return Math.random() - 0.5;
    });
    return array;
};

Util.createElem = function(element, parent, classList, id, content, dataAttr) {
    var div = document.createElement(element);
    if (Array.isArray(classList)) {
        div.className = classList.join(' ')
    }
    if (id) {
        div.setAttribute("id", id);
    }
    if (content !== undefined) {
        div.innerHTML = content;
    }
    if (dataAttr) {
        for (var key in dataAttr) {
            if (!dataAttr.hasOwnProperty(key)) continue;
            div.dataset[key] = dataAttr[key];
        }
    }
    if (parent) {
        parent.appendChild(div);
    }
    return div;
};

Util.getNumberLength = function(number) {
    return number.toString().length;
};

Util.repeatString = function(times, string) {
    return (new Array(times + 1)).join(string);
};

Util.assert = function(assertion) {
    if (!assertion) {
        throw new UtilException("Неправильное выражение.");
    }
};

function UtilException(message) {
    this.name    = "UtilException";
    this.message = message;
}
