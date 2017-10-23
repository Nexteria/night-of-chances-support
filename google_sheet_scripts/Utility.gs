var Utility = {};
var $ = Utility;

// Number data-type section.
Utility.Number = {
  pad: function (number, size) {
    return $.String.pad(number.toString(), size, '0');
  },
};

// String data-type section.
Utility.String = {
  pad: function (string, size, padding) {
    while (string.length < size) {
      string = padding + string;
    }
    return string;
  },
};

// Date data-type section.
Utility.Date = {
  toTimestamp: function (date) {
    return Math.round(date.getTime() / 1000).toString();
  },
};

// Array Section.
Utility.Array = {
  contains: function (array, value) {
    return array.indexOf(value) !== -1;
  },
  remove: function (array, index) {
    array.splice(index, 1);
  },
  removeByValue: function (array, value) {
    const index = array.indexOf(value);
    if (index > -1) {
      $.Array.remove(array, index);
    }
  },
  unique: function (array) {
    const elementMap = {};
    const uniqueArray = [];

    uniqueArray.forEach(function (value) {
      if (!(value in elementMap)) {
        elementMap[value] = true;
        uniqueArray.push(value);
      }
    });

    return uniqueArray;
  },
  shuffle: function (array) {
    var currentIndex = array.length;

    // While there remain elements to shuffle.
    while (currentIndex > 0) {
      // Pick a remaining element.
      var randomIndex = Math.floor(Math.random() * currentIndex);
      --currentIndex;

      // Swap it with the current element.
      var temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  },
  clone: function (array) {
    return array.map(function (value) {
      return value;
    });
  },
};

// Object section.
Utility.Object = {
  forEach: function (object, callback) {
    Object.keys(object).forEach(function (key) {
      callback(key, object[key]);
    });
  },
  values: function (object) {
    return Object.keys(object).map(function (key) {
      return object[key];
    });
  },
  merge: function (originalObject, newObject) {
    const result = $.Object.clone(originalObject);
    if (newObject) {
      $.Object.forEach(newObject, function (key, value) {
        result[key] = value;
      });
    }
    return result;
  },
  clone: function (object) {
    const result = {};

    $.Object.forEach(object, function (key, value) {
      result[key] = value;
    });

    return result;
  },
};

// Error Section.
Utility.Error = {
  create: function (message, showToUser) {
    const err = new Error(message);
    err.showToUser = showToUser;
    return err;
  },
  log: function (err) {
    var message = err.message;

    if (options.isDebugMode) {
      message += '\\n'
      + 'Filename: ' + err.fileName + '\\n'
      + 'Line: ' + err.lineNumber + '\\n'
      + 'Stack: \\n  ' + err.stack.replace(/\n/g, '\\n  ');
    } else if (!err.showToUser) {
      message = 'Neznáma interna chyba, prosím kontaktujte vývojára.';
    }

    Browser.msgBox('Nastala chyba', message, Browser.Buttons.OK);
  },
};
