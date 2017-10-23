// Constructor for the table object.
var Table = function (headersRangeName, options) {
  const self = this;
  const _options = $.Object.merge({}, options);

  // Load current spread sheet.
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!activeSpreadsheet) {
    throw $.Error.create('Unable to access the active spreadsheet.');
  }

  // Load the header range.
  this._headersRange = activeSpreadsheet.getRangeByName(headersRangeName);
  if (!this._headersRange) {
    throw $.Error.create('Nepodarilo sa načítať bunky s názvom "' + headersRangeName + '".', true);
  }

  // Determine table sheet.
  this._sheet = this._headersRange.getSheet();

  // Load table headers.
  this._headers = {};
  this._headersRange.getValues()[0].forEach(function (value, columnOffset) {
    if (value) {
      self._headers[value] = {
        name: value,
        range: self._headersRange.getCell(1, columnOffset + 1),
        columnOffset: columnOffset,
      };
    }
  });

  // Filter headers if needed.
  const includeOnlyFromHeaders = _options.includeOnlyFromHeaders;
  if (includeOnlyFromHeaders) {
    Object.keys(this._headers).forEach(function (headerName) {
      if (!$.Array.contains(includeOnlyFromHeaders, headerName)) {
        delete self._headers[headerName];
      }
    });
  }

  // Determine first and last possible rows in table.
  const firstRow = this._headersRange.getRow() + 1;
  const lastRow = this._sheet.getMaxRows();
  if (firstRow > lastRow) {
    throw $.Error.create('Tabulka má chybne označené riadky v hárku "' + this._sheet.getName() + '"', true);
  }

  // Load table rows range.
  const rowsRangeValues = this._sheet.getRange(
    firstRow, this._headersRange.getColumn(),
    lastRow - firstRow + 1, this._headersRange.getNumColumns()
  ).getValues();

  // Load table rows from spreadsheet.
  this._originalRows = [];
  for (var i = 0, iLength = rowsRangeValues.length; i < iLength; ++i) {
    var rowValuesArray = rowsRangeValues[i];

    // Determine if the previous row was the last.
    var areAllEmpty = true;
    for (var j = 0, jLength = rowValuesArray.length; j < jLength; ++j) {
      if (rowValuesArray[j] !== '') {
        areAllEmpty = false;
        break;
      }
    }
    if (areAllEmpty) {
      break;
    }

    // Add row to original rows.
    var rowObject = {};
    $.Object.forEach(this._headers, function (headerName, headerObject) {
      var value = rowValuesArray[headerObject.columnOffset];
      if (typeof value === 'string') {
        value = value.replace(/\t/g, '');
      }
      rowObject[headerName] = value;
    });
    this._originalRows.push(rowObject);
  }

  // Initialize new rows.
  this._newRows = [];
};

Table.prototype.getHeadersRange = function () {
  return this._headersRange;
};

Table.prototype.getSheet = function () {
  return this._sheet;
};

// Return a boolean value indicating the existance of the supplied header name in the table.
Table.prototype.existsHeader = function (headerName) {
  return headerName in this._headers;
};

// Verify the existance of the supplied header name in the table.
// If the verification fails, an error is thrown.
Table.prototype.verifyHeader = function (headerName) {
  if (!this.existsHeader(headerName)) {
    throw $.Error.create('Nebolo možné nájsť stĺpec "' + headerName + '" v hárku "' + this.getSheet().getName() + '"', true);
  }
}

// Verify the existance of the supplied header names in the table.
// If the verification fails, an error is thrown.
Table.prototype.verifyHeaders = function (headerNames) {
  const self = this;

  const missingHeaderNames = [];
  headerNames.forEach(function (headerName) {
    if (!self.existsHeader(headerName)) {
      missingHeaderNames.push(headerName);
    }
  });

  if (missingHeaderNames.length > 0) {
    const errorMessage = 'Nebolo možné nájsť nasledujúce stĺpce'
    + ' v hárku "' + this._sheet.getName() + '":\\n'
    + missingHeaderNames.join(', ');

    throw $.Error.create(errorMessage, true);
  }
};

// Retrieve all the table headers.
Table.prototype.getHeaderNames = function () {
  return Object.keys(this._headers);
};

Table.prototype.getHeaderRange = function (headerName) {
  this.verifyHeader(headerName);

  return this._headers[headerName].range;
}

// Replace the original header name with a new one.
// The change is reflected in the rows as well.
// If the original header does not exist or the new header already exists, an error is thrown.
Table.prototype.renameHeader = function (originalHeaderName, newHeaderName) {
  const self = this;

  this.verifyHeader(originalHeaderName);

  // No rename necessary if the original header is the same as the new header.
  if (originalHeaderName === newHeaderName) {
    return;
  }

  if (this.existsHeader(newHeaderName)) {
    const errorMessage = 'Nebolo možné prementovať stĺpec'
    + ' v hárku "' + this.getSheet().getName() + '", meno už existuje.';

    throw $.Error.create(errorMessage, true);
  }

  // Replace in headers.
  const headerObject = this._headers[originalHeaderName];
  delete this._headers[originalHeaderName];
  headerObject.name = newHeaderName;
  this._headers[newHeaderName] = headerObject;

  // Replace in rows.
  this.getRows().forEach(function (rowObject, row) {
    const value = rowObject[originalHeaderName];
    delete rowObject[originalHeaderName];
    rowObject[newHeaderName] = value;
    self.setRow(row, rowObject);
  });
};

// Add a new header to the table.
// The change is reflected in the rows as well.
// If the header object does not contain a name or the header name already exists within the table, an error is thrown.
Table.prototype.addHeader = function (headerName) {
  const self = this;

  if (!headerName) {
    throw $.Error.create('The supplied header name is invalid.');
  }

  if (this.existsHeader(headerName)) {
    const errorMessage = 'Stĺpec, ktorý sa snažíte pridať už existuje'
    + ' v hárku "' + this._sheet.getName() + '".';

    throw $.Error.create(errorMessage, true);
  }

  // Add to headers.
  this._headers[headerName] = { name: headerName };

  // Add in rows.
  this.getRows().forEach(function (rowObject, row) {
    rowObject[headerName] = '';
    self.setRow(row, rowObject);
  });
};

// Remove an existing header from the table.
// The change is reflected in the rows as well.
// If the header name does not exists within the table, an error is thrown.
Table.prototype.removeHeader = function (headerName) {
  const self = this;

  this.verifyHeader(headerName);

  // Remove in headers.
  delete this._headers[headerName];

  // Remove in rows.
  this.getRows().forEach(function (rowObject, row) {
    delete rowObject[headerName];
    self.setRow(row, rowObject);
  });
};

// Verify whether keys within the row object matches the table headers.
// If the verification fails, an error is thrown.
Table.prototype.verifyRowObject = function (rowObject) {
  var self = this;

  const extraRowObjectKeys = [];
  const missingRowObjectKeys = [];

  // Verify whether all keys in the row object are header names in the table.
  Object.keys(rowObject).forEach(function (rowObjectKey) {
    if (!self.existsHeader(rowObjectKey)) {
      extraRowObjectKeys.push(rowObjectKey);
    }
  });

  // Verify whether all header names in the table are keys in the row object.
  Object.keys(this._headers).forEach(function (headerName) {
    if (!(headerName in rowObject)) {
      missingRowObjectKeys.push(headerName);
    }
  });

  // If a mismatch was found throw a custom error.
  if ((extraRowObjectKeys.length > 0) || (missingRowObjectKeys.length > 0)) {
    const errorMessage = 'Bola nájdená nezhoda medzi riadkom dát a stĺpcami tabulky:\\n'
    + ' - stĺpce navyše: [\\n  ' + extraRowObjectKeys.join(',\\n  ') + '\\n  ]'
    + ' - chýbajúce stĺpce: [\\n  ' + missingRowObjectKeys.join(',\\n  ') + '\\n  ]';

    throw $.Error.create(errorMessage, true);
  }
}

// Verify whether the supplied row number is within the bounds of the table's rows.
// If the verification fails, an error is thrown.
Table.prototype.verifyRowNumber = function (row) {
  if (row < 0) {
    throw $.Error.create('The supplied row number is smaller than the smallest row number within the table.');
  }
  if (row >= this.countRows()) {
    throw $.Error.create('The supplied row number is greater than the largest row number within the table.');
  }
};

// Add a row to the table.
// If the keys within the row object do not match the table headers, an error is thrown.
Table.prototype.addRow = function (rowObject) {
  this.verifyRowObject(rowObject);

  this._newRows.push(rowObject);
};

// Overwrites the row object at the supplied row number.
// If the supplied row is an invalid row number, an error is thrown.
// If the keys within the row object do not match the table headers, an error is thrown.
Table.prototype.setRow = function (row, rowObject) {
  this.verifyRowNumber(row);
  this.verifyRowObject(rowObject);

  if (row < this._newRows.length) {
    this._newRows[row] = rowObject;
  } else {
    this._originalRows[row - this._newRows.length] = rowObject;
  }
};

// Retrieves the row object at the supplied row number.
// If the supplied row is an invalid row number, an error is thrown.
Table.prototype.getRow = function (row) {
  this.verifyRowNumber(row);

  if (row < this._newRows.length) {
    return $.Object.clone(this._newRows[row]);
  }
  return $.Object.clone(this._originalRows[row - this._newRows.length]);
};

// Retireve an array of all the row objects within this table.
Table.prototype.getRows = function () {
  return this._newRows.concat(this._originalRows);
};

// Returns an array of values of the supplied header for all rows.
// If the header name does not exists within the table, an error is thrown.
Table.prototype.getRowsByHeader = function (headerName)  {
  this.verifyHeader(headerName);

  return this.getRows().map(function (rowObject) {
    return rowObject[headerName];
  });
};

// If only the first argument is supplied a map from row values under
// the key header to row numbers is created.
// If both arguments are supplied a map from row values under the key header to
// row values under the value header is created.
// If any of the supplied header names does not exist within the table, an error is thrown.
Table.prototype.mapRows = function (keyHeaderName, valueHeaderName) {
  this.verifyHeader(keyHeaderName);

  const result = {};
  this.getRowsByHeader(keyHeaderName).forEach(function (keyHeaderValue) {
    result[keyHeaderValue] = [];
  });

  if (valueHeaderName) {
    this.verifyHeader(valueHeaderName);

    this.getRows().forEach(function (rowObject) {
      result[rowObject[keyHeaderName]].push(rowObject[valueHeaderName]);
    });
  } else {
    this.getRows().forEach(function (rowObject, row) {
      result[rowObject[keyHeaderName]].push(row);
    });
  }

  return result;
};

// Iterates through all given rows in the first argument (an array of row objects).
// Finds a matching row in the rows stored within this table object by comparing the values under the merge key header name.
// If the matching row is found, empty string values in the matching row are replaced by values from the supplied row object.
// Otherwise the row object is added to the table, any extra keys are removed and any missing keys are added as an empty strings.
// No new headers are added in the process.
// If the suppliead merge header does not exist in the table, an error is thrown.
// If the merge header row values are not unique for each row, an error is thrown.
Table.prototype.mergeRows = function (inputRowObjects, mergeKeyHeaderName) {
  const self = this;

  this.verifyHeader(mergeKeyHeaderName);

  // Create map from merge header row values to row numbers.
  const mergeHeaderMap = this.mapRows(mergeKeyHeaderName);

  // Iterate through the supplied row objects array.
  const newRowObjects = [];
  inputRowObjects.forEach(function (inputRowObject) {
    const mergeHeaderValue = inputRowObject[mergeKeyHeaderName];

    if (mergeHeaderValue in mergeHeaderMap) {
      mergeHeaderMap[mergeHeaderValue].forEach(function (row) {
        const rowObject = self.getRow(row);

        $.Object.forEach(rowObject, function (rowKey, rowValue) {
          if ((rowValue === '') && (rowKey in inputRowObject)) {
            rowObject[rowKey] = inputRowObject[rowKey];
          }
        });

        self.setRow(row, rowObject);
      });
    } else {
      const rowObject = {};

      self.getHeaderNames().forEach(function (headerName) {
        if (headerName in inputRowObject) {
          rowObject[headerName] = inputRowObject[headerName];
        } else {
          rowObject[headerName] = '';
        }
      });

      newRowObjects.push(rowObject);
    }
  });

  newRowObjects.forEach(function (rowObject) {
    self.addRow(rowObject);
  });
};

// Returns the number of rows withing this table object.
Table.prototype.countRows = function () {
  return this._newRows.length + this._originalRows.length;
};

// Writes the data stored within this table object into the sheet.
Table.prototype.save = function () {
  const self = this;

  // Insert new rows into the sheet.
  if (this._newRows.length > 0) {
    this.getSheet().insertRowsBefore(this._headersRange.getLastRow() + 1, this._newRows.length);
  }

  // Retrieve merged row count.
  const rowCount = this.countRows();

  // Write data to origianl rows.
  $.Object.forEach(this._headers, function (headerName, headerObject) {
    const headerObjectRange = headerObject.range;
    const rowsRange = self.getSheet().getRange(
      headerObjectRange.getLastRow() + 1, headerObjectRange.getColumn(),
      rowCount, headerObjectRange.getNumColumns()
    );

    rowsRange.setValues(self.getRowsByHeader(headerName).map(function (rowValue) {
      return [rowValue];
    }));
  });

  // Modify original rows and new rows arrays.
  this._originalRows = this.getRows();
  this._newRows = [];
};
