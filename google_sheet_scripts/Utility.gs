var Utility = {};

// General Section.

Utility.clearAll = function () {
  Table.clear();
  Utility.Spreadsheet.clear();
};

// Number data-type section.
Utility.Number = {};

Utility.Number.pad = function (number, size) {
    return Utility.String.pad(number.toString(), size, "0");
};

// String data-type section.
Utility.String = {};

Utility.String.pad = function (string, size, padding) {
    while (string.length < size) {
        string = padding + string;
    }
    return string;
};

// Array Section.

Utility.Array = {};

Utility.Array.unique = function (array) {
  var elementMap = {};
  var uniqueArray = [];

  for (var i = 0; i < array.length; ++i) {
    var value = array[i];
    if (value in elementMap) {
      continue;
    }

    elementMap[value] = true;
    uniqueArray.push(value);
  }

  return uniqueArray;
};

Utility.Array.shuffle = function (array) {
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
};

// Object Section.

Utility.Object = {};

Utility.Object.keys = function (object) {
  var keyArray = [];

  for (var key in object) {
    if (object.hasOwnProperty(key)) {
      keyArray.push(key);
    }
  }

  return keyArray;
}

// Error Section.

Utility.Error = {};

Utility.Error.create = function (message) {
  var error = new Error(message);
  error.isCustom = true;
  return error;
};

Utility.Error.log = function (error) {
  var message = error.message;

  if (Data.isDebugMode === true) {
    message += "\\n"
    + "Filename: " + error.fileName + "\\n"
    + "Line: " + error.lineNumber + "\\n"
  } else if (error.isCustom !== true) {
    message = "Neznáma interna chyba, prosím kontaktujte vývojára.";
  }

  Browser.msgBox("Nastala chyba", message, Browser.Buttons.OK);
};

// SpreadsheetApp Section.

Utility.Spreadsheet = {};

(function () {
  var _activeSpreadsheet;

  // Private vars SubSection.

  Utility.Spreadsheet.clear = function () {
    _activeSpreadsheet = undefined;
  };

  Utility.Spreadsheet.clear();

  function _loadActiveSpreadsheet() {
    if (_activeSpreadsheet === undefined) {
      _activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    }
    if (_activeSpreadsheet === null) {
      throw new Error("Unable to access the active spreadsheet.");
    }
  }

  // Methods SubSection.

  Utility.Spreadsheet.getInstance = function () {
    _loadActiveSpreadsheet();
    return _activeSpreadsheet;
  }

  Utility.Spreadsheet.getRangeByName = function (name) {
    _loadActiveSpreadsheet();

    var range = _activeSpreadsheet.getRangeByName(name);
    if (range === null) {
      throw Utility.Error.create("Nepodarilo sa načítať bunky s názvom '" + name + "'.");
    }

    return range;
  };

  Utility.Spreadsheet.getSheetByName = function (name) {
    _loadActiveSpreadsheet();

    if (!(name in Data.sheetNames)) {
      throw new Error("No sheet is identified under the name '" + name + "'");
    }
    var sheetName = Data.sheetNames[name];

    var sheet = _activeSpreadsheet.getSheetByName(sheetName);
    if (sheet === null) {
      throw Utility.Error.create("Nepodarilo sa načítať hárok s názvom '" + sheetName + "'.");
    }

    return sheet;
  };
})();
