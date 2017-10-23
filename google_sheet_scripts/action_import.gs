function testImport() {
  runImportAction();
}

var runImportAction = function () {
  // Load import tables and options.
  var importTables = {};
  var importTablesOptions = {};
  options.importTables.forEach(function (importTableOptions) {
    const importTableName = importTableOptions.name;
    importTables[importTableName] = new Table(importTableOptions.headerRangeName);
    importTablesOptions[importTableName] = importTableOptions;
  });

  // Load data tables.
  const aliasTable = new Table('Alias_Headers');
  const workshopTable = new Table('Workshop_Headers');
  const speedDateTable = new Table('SpeedDate_Headers');
  const skillTable = new Table('Skill_Headers');

  // Verify data table headers.
  aliasTable.verifyHeaders(options.aliasTable.headerNames);
  skillTable.verifyHeaders(options.skillTable.headerNames);
  workshopTable.verifyHeaders(options.workshopTable.headerNames);
  speedDateTable.verifyHeaders(options.speedDateTable.headerNames);

  // Collect workshop and speed date ids.
  const workshopIds = workshopTable.getRowsByHeader('Id');
  const speedDateIds = speedDateTable.getRowsByHeader('Id');
  const allIds = workshopIds.concat(speedDateIds);

  // Cache student helper data.
  const studentAssignValues = options.studentTable.studAssignValues;
  const studAssignHeaderName = options.studentTable.assignHeaderNames.stud;

  // Define required student headers.
  const includeOnlyFromStudentHeaders = [];
  $.Object.values(importTablesOptions).forEach(function (importTableOptions) {
    $.Object.values(importTableOptions.headerNamesMap).forEach(function (value) {
      includeOnlyFromStudentHeaders.push(value);
    });
  });
  allIds.forEach(function (id) {
    includeOnlyFromStudentHeaders.push(id + studAssignHeaderName);
  });
  skillTable.getRowsByHeader('Id').forEach(function (skillId) {
    includeOnlyFromStudentHeaders.push(skillId);
  });

  // Create student table with excluded unecassary student headers.
  const studentTable = new Table('Student_Headers', {
    includeOnlyFromHeaders: includeOnlyFromStudentHeaders,
  });
  const originalCellCount = studentTable.countRows();

  // TODO: Add check for WS and SD ids.

  // Create alias names map for workshop and speed date ids.
  const aliasNameToIdMap = aliasTable.mapRows('Name', 'Id');

  $.Object.forEach(importTables, function (importTableName, importTable) {
    const importTableOptions = importTablesOptions[importTableName];

    // Modify import table.
    if ('beforeRemoveAndRenameMutator' in importTableOptions) {
      importTableOptions.beforeRemoveAndRenameMutator(importTable);
    }

    // Remove extra headers within import tables.
    importTable.getHeaderNames().forEach(function (headerName) {
      if (!(headerName in importTableOptions.headerNamesMap)) {
        importTable.removeHeader(headerName);
      }
    });

    // Rename headers within import tables.
    $.Object.forEach(importTableOptions.headerNamesMap, function (originalHeaderName, newHeaderName) {
      importTable.renameHeader(originalHeaderName, newHeaderName);
    });

    // Modify import table.
    if ('beforePreferenceMutator' in importTableOptions) {
      importTableOptions.beforePreferenceMutator(importTable);
    }

    // Add workshop and speed date student preference headers to import tables.
    allIds.forEach(function (id) {
      importTable.addHeader(id + studAssignHeaderName);
    });

    // Add preferences to import table.
    function _generateAddPreferencesCallback(preferenceValues, rowObject, ids) {
      return function (preferenceValue) {
        if (!preferenceValue) {
          return;
        }

        var assignValue = studentAssignValues.agnostic;

        if (preferenceValue in aliasNameToIdMap) {
          aliasNameToIdMap[preferenceValue].forEach(function (id) {
            rowObject[id + studAssignHeaderName] = studentAssignValues.interested;
          });
        } else if ($.Array.contains(preferenceValues.acceptAll, preferenceValue)) {
          assignValue = studentAssignValues.available;
        } else if ($.Array.contains(preferenceValues.rejectAll, preferenceValue)) {
          assignValue = studentAssignValues.rejected;
        } else if (!$.Array.contains(preferenceValues.ignorable, preferenceValue)) {
          const preferenceValueChars = [];
          for (var i = 0, length = preferenceValue.length; i < length; ++i) {
            preferenceValueChars.push(preferenceValue.charCodeAt(i));
          }

          const errorMessage = 'Nájdená hodnota "' + preferenceValue + '"\\n'
          + 'Znakové kódy [' + preferenceValueChars.join(', ') + ']';
          throw $.Error.create(errorMessage, true);
        }

        if (assignValue !== studentAssignValues.agnostic) {
          ids.forEach(function (id) {
            const key = id + studAssignHeaderName;
            if (rowObject[key] === studentAssignValues.agnostic) {
              rowObject[key] = assignValue;
            }
          });
        }
      };
    }

    importTable.getRows().forEach(function (rowObject, row) {
      try {
        rowObject.WorkshopPreferences.split(importTableOptions.multiValueDelimiter).forEach(
          _generateAddPreferencesCallback(importTableOptions.workshopPreferenceValues, rowObject, workshopIds));
      } catch (err) {
        err.message = 'V tabulke "' + importTable.getSheet().getName() + '" sa našla neznáma hodnota pod'
        + ' záujemu o Workshop-y v riadku ' + (row + importTable.getHeadersRange().getLastRow()) + '\\n'
        + err.message;
        throw err;
      }

      try {
        rowObject.SpeedDatePreferences.split(importTableOptions.multiValueDelimiter).forEach(
          _generateAddPreferencesCallback(importTableOptions.speedDatePreferenceValues, rowObject, speedDateIds));
      } catch (err) {
        err.message = 'V tabulke "' + importTable.getSheet().getName() + '" sa našla neznáma hodnota pod'
        + ' záujemu o Speed Date-y v riadku ' + (row + importTable.getHeadersRange().getLastRow()) + '\\n'
        + err.message;
        throw err;
      }

      importTable.setRow(row, rowObject);
    });

    // Modify import table.
    if ('beforeMergeMutator' in importTableOptions) {
      importTableOptions.beforeMergeMutator(importTable);
    }

    // Merge the import table into the student table.
    studentTable.mergeRows(importTable.getRows(), importTableOptions.mergeHeaderName);
  });

  // Save the student table.
  studentTable.save();

  // Realocate memory.
  importTables = null;
  importTablesOptions = null;

  // Initialize student table.
  const studentSheet = studentTable.getSheet();

  // Copy score calculation formula to new cells.
  const newRowCount = studentTable.countRows() - originalCellCount;
  if (newRowCount > 0) {
    const scoreAssignHeaderName = options.studentTable.assignHeaderNames.score;

    const studentScoreHeaders = [];
    allIds.forEach(function (id) {
      studentScoreHeaders.push(id + scoreAssignHeaderName);
    });

    const newStudentTable = new Table('Student_Headers', {
      includeOnlyFromHeaders: studentScoreHeaders,
    });

    studentScoreHeaders.forEach(function (headerName) {
      const headerRange = newStudentTable.getHeaderRange(headerName);
      headerRange.offset(newRowCount + 1, 0).copyTo(
        studentSheet.getRange(headerRange.getRow() + 1, headerRange.getColumn(), newRowCount));
    });
  }

  // Set last imported time and user.
  studentSheet.getRange(3, 1).setValue(Session.getActiveUser().getEmail().split('@')[0]);
  studentSheet.getRange(3, 2).setValue(new Date());
  studentSheet.getRange(3, 2).setNumberFormat('yyyy.MM.dd');
  studentSheet.getRange(4, 2).setValue(new Date());
  studentSheet.getRange(4, 2).setNumberFormat('HH.mm.ss');

  // Report success.
  const message = 'Dáta boli úspešne pridané.\\n'
  + 'Čakajte prosím, kým sa nové dáta načítajú.';
  Browser.msgBox('Operácia uspela', message, Browser.Buttons.OK);
};
