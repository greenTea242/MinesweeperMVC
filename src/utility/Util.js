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
        for (var i = 0; i < classList.length; i++) {
            div.classList.add(classList[i]);
        }
    }
    if (id) {
        div.setAttribute("id", id);
    }
    if (content !== undefined) {
        div.innerHTML = content;
    }
    if (dataAttr) {
        var keys  = Object.keys(dataAttr);
        for (i = 0; i < keys.length; i++) {
            if (dataAttr.hasOwnProperty(keys[i])) {
                div.dataset[keys[i]] = dataAttr[keys[i]];
            }
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

function UtilException(message) {
    this.name    = "UtilException";
    this.message = message;
}
