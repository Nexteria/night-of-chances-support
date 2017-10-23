var Import = {};

(function () {
  Import.createAliasToIdMap = function (table) {
    var map = {};

    var idsDataRangeValues = table.dataRanges.base.Id.getValues();
    var aliasesDataRangeValues = table.dataRanges.base.Aliases.getValues();

    for (var i = 0; i < table.rowCount; ++i) {
      var id = idsDataRangeValues[i][0];
      var aliases = aliasesDataRangeValues[i][0].split("|");

      for (var j = 0; j < aliases.length; ++j) {
        map[aliases[j]] = id;
      }
    }

    return map;
  };

  Import.loadImportTableDataRangeValues = function (importTable) {
    if (importTable.rowCount === 0) {
      throw Utility.Error.create("Neboli najdené žiadne dáta na importovanie.");
    }

    var dataRangeValues = {
      base: {},
      preference: {},
      speedDateNote: {}
    };

    for (var baseKey in importTable.dataRanges.base) {
      dataRangeValues.base[baseKey] = importTable.dataRanges.base[baseKey].getValues();
    }
    for (var preferenceKey in importTable.dataRanges.preference) {
      dataRangeValues.preference[preferenceKey] = importTable.dataRanges.preference[preferenceKey].getValues();
    }
    for (var speedDateNoteKey in importTable.dataRanges.speedDateNote) {
      dataRangeValues.speedDateNote[speedDateNoteKey] = importTable.dataRanges.speedDateNote[speedDateNoteKey].getValues();
    }

    return dataRangeValues;
  };

  Import.loadStudentsTableDataRangeValues = function (studentsTable) {
    var dataRangeValues = Import.initializeStudentsDataRangeValues(studentsTable);

    if (studentsTable.rowCount > 0) {
      for (var baseKey in studentsTable.dataRanges.base) {
        dataRangeValues.base[baseKey] = studentsTable.dataRanges.base[baseKey].getValues();
      }

      for (var workshopKey in studentsTable.dataRanges.workshop) {
        dataRangeValues.workshop[workshopKey] = studentsTable.dataRanges.workshop[workshopKey].stud.getValues();
      }

      for (var speedDateKey in studentsTable.dataRanges.speedDate) {
        var speedDateDataRanges = studentsTable.dataRanges.speedDate[speedDateKey].stud;

        dataRangeValues.speedDate[speedDateKey] = speedDateDataRanges.getValues();
        dataRangeValues.speedDateNote[speedDateKey] = speedDateDataRanges.getNotes();
      }
    }

    return dataRangeValues;
  };

  Import.initializeStudentsDataRangeValues = function (studentsTable) {
    var dataRangeValues = {
      base: {},
      workshop: {},
      speedDate: {},
      speedDateNote: {}
    };

    for (var baseKey in studentsTable.dataRanges.base) {
      dataRangeValues.base[baseKey] = [];
    }

    for (var workshopKey in studentsTable.dataRanges.workshop) {
      dataRangeValues.workshop[workshopKey] = [];
    }

    for (var speedDateKey in studentsTable.dataRanges.speedDate) {
      dataRangeValues.speedDate[speedDateKey] = [];
      dataRangeValues.speedDateNote[speedDateKey] = [];
    }

    return dataRangeValues;
  };

  Import.createIdToRowMap = function (dataRangeValues) {
    var map = {};
    var idDataRangeValues = dataRangeValues.base.Id;

    for (var i = 0; i < idDataRangeValues.length; ++i) {
      map[idDataRangeValues[i][0]] = i;
    }

    return map;
  };

  Import.extractBaseDataFromImportRow = function (importDataRangeValues, row) {
    var extractedBaseData = {};
    var importBaseDataRangeValues = importDataRangeValues.base;


    for (var baseKey in importBaseDataRangeValues) {
      extractedBaseData[baseKey] = importBaseDataRangeValues[baseKey][row][0];
    }

    return extractedBaseData;
  };

  Import.extractWorkshopPreferencesFromImportRow = function (importTable, importDataRangeValues, row, workshopIds, workshopAliasToId) {
    // Initialize extracted workshop data.
    var extractedWorkshopPreferencesData = {};
    for (var iWorkshop = 0; iWorkshop < workshopIds.length; ++iWorkshop) {
      extractedWorkshopPreferencesData[workshopIds[iWorkshop]] = "";
    }

    // Parse workshop preference aliases.
    var workshopPreferenceAliases = importDataRangeValues.preference.workshop[row][0].split(" | ");
    for (var i = 0; i < workshopPreferenceAliases.length; ++i) {
      var currentAlias = workshopPreferenceAliases[i];

      if ((currentAlias.length > 0) && (currentAlias !== Data.workshopAlias.no2) && (currentAlias !== Data.workshopAlias.no1) && (currentAlias !== Data.workshopAlias.no)) {
        if ((currentAlias === Data.workshopAlias.any) || (currentAlias === Data.workshopAlias.any1)) {
          // If the any workshop alias value is encountered.

          // Set all unset preferences to the reserved constant.
          for (var j = 0; j < workshopIds.length; ++j) {
            var workshopId = workshopIds[j];
            if (extractedWorkshopPreferencesData[workshopId] === "") {
              extractedWorkshopPreferencesData[workshopId] = Data.preferenceValues.reserved;
            }
          }
        } else if (currentAlias in workshopAliasToId) {
          // If the current alias is found within the alias to id map.

          // Set the workshop id's preference to the accepted constant.
          extractedWorkshopPreferencesData[workshopAliasToId[currentAlias]] = Data.preferenceValues.accepted;
        } else {
          // If the current alias is unknown.

          throw Utility.Error.create(
            "V importovaných dátach bola v workshop-ových preferenciách nánájdená neznáma hodnota: \\n"
            + currentAlias + "\\n"
            + "v riadku '" + (row + importTable.headersRange.getLastRow() + 1).toString() + "'");
        }
      }
    }

    return extractedWorkshopPreferencesData;
  };

  Import.extractSpeedDatePreferencesFromImportRow = function (importTable, importDataRangeValues, row, speedDateIds, speedDateAliasToId) {
    // Initialize extracted speed date data.
    var extractedSpeedDatePreferencesData = {};
    for (var iSpeedDate = 0; iSpeedDate < speedDateIds.length; ++iSpeedDate) {
      extractedSpeedDatePreferencesData[speedDateIds[iSpeedDate]] = "";
    }

    // Parse speed date preference aliases.
    var speedDatePreferenceAliases = importDataRangeValues.preference.speedDate[row][0].split(" | ");
    for (var i = 0; i < speedDatePreferenceAliases.length; ++i) {
      var currentAlias = speedDatePreferenceAliases[i];

      if ((currentAlias.length > 0) && (currentAlias !== Data.speedDateAlias.no) && (currentAlias !== Data.speedDateAlias.no1)) {
        if (currentAlias in speedDateAliasToId) {
          // If the current alias is found within the alias to id map.

          // Set the speed date id's preference to the accepted constant.
          extractedSpeedDatePreferencesData[speedDateAliasToId[currentAlias]] = Data.preferenceValues.accepted;
        } else {
          // If the current alias is unknown.

          throw Utility.Error.create(
            "V importovaných dátach bola v speed date-ových preferenciách nánájdená neznáma hodnota: \\n"
            + currentAlias + "\\n"
            + "v riadku '" + (row + importTable.headersRange.getLastRow() + 1).toString() + "'");
        }
      }
    }

    return extractedSpeedDatePreferencesData;
  };

  Import.extractSpeedDateNotesFromImportRow = function (importDataRangeValues, row, speedDateIds) {
    var extractedSpeedDateNotesData = {};

    for (var iSpeedDate = 0; iSpeedDate < speedDateIds.length; ++iSpeedDate) {
      var speedDateId = speedDateIds[iSpeedDate];
      extractedSpeedDateNotesData[speedDateId] = importDataRangeValues.speedDateNote[speedDateId][row][0];
    }

    return extractedSpeedDateNotesData;
  };

  Import.appendRowToNewStudentValues = function (dataRangeValues, extractedData) {
    for (var baseKey in dataRangeValues.base) {
      dataRangeValues.base[baseKey].push([ extractedData.base[baseKey] ]);
    }
    for (var workshopKey in dataRangeValues.workshop) {
      dataRangeValues.workshop[workshopKey].push([ extractedData.workshop[workshopKey] ]);
    }
    for (var speedDateKey in dataRangeValues.speedDate) {
      dataRangeValues.speedDate[speedDateKey].push([ extractedData.speedDate[speedDateKey] ]);
    }
    for (var speedDateNoteKey in dataRangeValues.speedDateNote) {
      dataRangeValues.speedDateNote[speedDateNoteKey].push([ extractedData.speedDateNote[speedDateNoteKey] ]);
    }
  };

  Import.mergeRowWithExistitngStudentValues = function (dataRangeValues, row, extractedData) {
    for (var baseKey in dataRangeValues.base) {
      if ((extractedData.base[baseKey] !== '')
          && (Data.overwriteEnabled || (dataRangeValues.base[baseKey][row][0] === '')))
      {
        dataRangeValues.base[baseKey][row][0] = extractedData.base[baseKey];
      }
    }
    for (var workshopKey in dataRangeValues.workshop) {
      var workshopPreferenceDataRangeValues = dataRangeValues.workshop[workshopKey];
      if ((extractedData.workshop[workshopKey] !== '')
          && Data.overwriteEnabled || (workshopPreferenceDataRangeValues[row][0] === ''))
      {
        workshopPreferenceDataRangeValues[row][0] = extractedData.workshop[workshopKey];
      }
    }
    for (var speedDateKey in dataRangeValues.speedDate) {
      var speedDatePreferenceDataRangeValues = dataRangeValues.speedDate[speedDateKey];
      if ((extractedData.speedDate[speedDateKey] !== '')
          && Data.overwriteEnabled || (speedDatePreferenceDataRangeValues[row][0] === ''))
      {
        speedDatePreferenceDataRangeValues[row][0] = extractedData.speedDate[speedDateKey];
      }
    }
    for (var speedDateNoteKey in dataRangeValues.speedDateNote) {
      var speedDateNoteDataRangeNotes = dataRangeValues.speedDateNote[speedDateNoteKey];
      if ((extractedData.speedDateNote[speedDateNoteKey] !== '')
          && Data.overwriteEnabled || (speedDateNoteDataRangeNotes[row][0] === ''))
      {
        speedDateNoteDataRangeNotes[row][0] = extractedData.speedDateNote[speedDateNoteKey];
      }
    }
  };

  Import.saveExistingStudentsDataRangeValues = function (studentsTable, dataRangeValues) {
    // Determine existing student count.
    var existingStudentCount = dataRangeValues.base.Id.length;

    // Exit if no existing rows need to be modified.
    if (existingStudentCount === 0) {
      return;
    }

    // Fill new data ranges.
    var studentDataRanges = studentsTable.dataRanges;

    // Set base data range values.
    for (var baseKey in studentDataRanges.base) {
      studentDataRanges.base[baseKey].setValues(dataRangeValues.base[baseKey]);
    }

    // Set workshop data range values.
    for (var workshopKey in studentDataRanges.workshop) {
      studentDataRanges.workshop[workshopKey].stud.setValues(dataRangeValues.workshop[workshopKey]);
    }

    // Set speed date data range values and notes.
    for (var speedDateKey in studentDataRanges.speedDate) {
      var speedDateDataRange = studentDataRanges.speedDate[speedDateKey].stud;

      speedDateDataRange.setValues(dataRangeValues.speedDate[speedDateKey]);
      speedDateDataRange.setNotes(dataRangeValues.speedDateNote[speedDateKey]);
    }
  };

  Import.addNewStudentsDataRangeValues = function (studentsTable, dataRangeValues) {
    // Determine new student count.
    var newStudentCount = dataRangeValues.base.Id.length;

    // Exit if there are no new students that need to be added.
    if (newStudentCount === 0) {
      return;
    }

    // Insert new rows to the students sheet below the header ranges.
    studentsTable.sheet.insertRowsBefore(studentsTable.headersRange.getLastRow() + 1, newStudentCount);

    // Fill new data ranges.
    var studentsSheet = studentsTable.sheet;
    var studentHeaderRanges = studentsTable.headerRanges;

    // Set base data range values.
    for (var baseKey in studentHeaderRanges.base) {
      var baseHeaderRange = studentHeaderRanges.base[baseKey];

      studentsSheet.getRange(baseHeaderRange.getLastRow() + 1, baseHeaderRange.getColumn(),
        newStudentCount, 1).setValues(dataRangeValues.base[baseKey]);
    }

    // Set workshop data range values.
    for (var workshopKey in studentHeaderRanges.workshop) {
      var workshopHeaderRange = studentHeaderRanges.workshop[workshopKey].stud;

      studentsSheet.getRange(workshopHeaderRange.getLastRow() + 1, workshopHeaderRange.getColumn(),
        newStudentCount, 1).setValues(dataRangeValues.workshop[workshopKey]);
    }

    // Set speed date data range values and notes.
    for (var speedDateKey in studentHeaderRanges.speedDate) {
      var speedDateHeaderRange = studentHeaderRanges.speedDate[speedDateKey].stud;
      var speedDateDataRange = studentsSheet.getRange((speedDateHeaderRange.getLastRow() + 1), speedDateHeaderRange.getColumn(),
        newStudentCount, 1);

      speedDateDataRange.setValues(dataRangeValues.speedDate[speedDateKey]);
      speedDateDataRange.setNotes(dataRangeValues.speedDateNote[speedDateKey]);
    }
  };

  Import.clearAndSetImportSheetContents = function (importTable) {
    var sheet = importTable.sheet;
    var headersRange = importTable.headersRange;

    // Remove extra columns.
    var firstExtraColumn = headersRange.getLastColumn() + 1;
    var extraColumnCount = sheet.getLastColumn() - firstExtraColumn + 1;
    if (extraColumnCount > 0) {
      sheet.deleteColumns(firstExtraColumn, extraColumnCount);
    }

    // Remove extra rows.
    var firstExtraRow = headersRange.getLastRow() + 2;
    var extraRowCount = sheet.getLastRow() - firstExtraRow + 1;
    if (extraRowCount > 0) {
      sheet.deleteRows(firstExtraRow, extraRowCount);
    }

    // Clear first row.
    headersRange.offset(1, 0).clear();

    // Fill importing user data.
    sheet.getRange(1, 2).setValue(Session.getActiveUser().getEmail().split("@")[0]);
    sheet.getRange(1, 4).setValue(new Date());
    sheet.getRange(1, 4).setNumberFormat("hh:mm:ss dd.MM.yyyy");
  };
})();
