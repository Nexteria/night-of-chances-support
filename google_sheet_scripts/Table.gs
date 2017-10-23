var Table = {};

(function() {
  // Cache Section.

  var _cache;

  Table.clear = function () {
    _cache = {};
  };

  Table.clear();

  // Helper function SubSection.

  function _getDataRanges(headerRanges, tableRowCount) {
    var dataRanges = {};

    for (var name in headerRanges) {
      var headerRange = headerRanges[name];
      var sheet = headerRange.getSheet();

      if (tableRowCount === 0) {
        dataRanges[name] = null;
      } else {
        dataRanges[name] = sheet.getRange(
          headerRange.getRow() + 1, headerRange.getColumn(), tableRowCount, headerRange.getNumColumns());
      }
    }

    return dataRanges;
  }

  function _getTableRowCount(tableHeaderRange) {
    var sheet = tableHeaderRange.getSheet();
    var firstRow = tableHeaderRange.getRow() + 1;
    var lastRow = sheet.getMaxRows();

    if (firstRow > lastRow) {
      throw Utility.Error.create("Tabulka má chybne označené riadky v hárku '" + sheet.getName() + "'");
    }

    var values = sheet.getRange(firstRow, tableHeaderRange.getColumn(),
                                lastRow - firstRow + 1, tableHeaderRange.getNumColumns()).getValues();

    for (var tableRowCount = 0; tableRowCount < values.length; ++tableRowCount) {
      var areAllEmpty = true;

      for (var i = 0; i < values[tableRowCount].length; ++i) {
        if (values[tableRowCount][i] !== "") {
          areAllEmpty = false;
          break;
        }
      }

      if (areAllEmpty) {
        break;
      }
    }

    return tableRowCount;
  }

  function _getHeaderRanges(tableHeadersRange, headerNames) {
    var tableHeadersValues = tableHeadersRange.getValues()[0];

    var headerRanges = {};
    var unavailableHeaderInSheetNames = [];

    function _findHeaderInRange(headerName, headerNameInSheet) {
      if (headerNameInSheet === undefined) {
        headerNameInSheet = headerName;
      }

      var isHeaderFound = false;

      for (var i = 0; i < tableHeadersValues.length; ++i) {
        if (tableHeadersValues[i] === headerNameInSheet) {
          headerRanges[headerName] = tableHeadersRange.getCell(1, i + 1);
          isHeaderFound = true;
          break;
        }
      }

      if (!isHeaderFound) {
        unavailableHeaderInSheetNames.push(headerNameInSheet);
      }
    }

    if (headerNames instanceof Array) {
      for (var i = 0; i < headerNames.length; ++i) {
        _findHeaderInRange(headerNames[i]);
      }
    } else {
      for (var headerName in headerNames) {
        _findHeaderInRange(headerName, headerNames[headerName]);
      }
    }

    if (unavailableHeaderInSheetNames.length > 0) {
      var errorMessage = "Nebolo možné nájsť nasledujúce stĺpce"
      + " v hárku '" + tableHeadersRange.getSheet().getName() + "':\\n"
      + unavailableHeaderInSheetNames.join(", ");
    }

    return headerRanges;
  }

  // Loader function SubSection.

  Table.loadImport = function () {
    var name = "import";
    var headersRangeName = "Import_Headers";

    if (!(name in _cache)) {
      // Initialize table headers range and header names.
      var tableHeadersRange = Utility.Spreadsheet.getRangeByName(headersRangeName);
      var tableHeaderNames = Data.tableHeaderNames[name];

      // Load base header ranges.
      var baseHeaderRanges = _getHeaderRanges(tableHeadersRange, tableHeaderNames.base);

      // Load interest header ranges.
      var preferenceHeaderRanges = _getHeaderRanges(tableHeadersRange, tableHeaderNames.preference);

      // Verify the availablity of all speed date note headers.
      var speedDatesTable = Table.loadSpeedDates();
      var speedDateIdDataRangeValues = speedDatesTable.dataRanges.base.Id.getValues();

      for (var i = 0; i < speedDatesTable.rowCount; ++i) {
        var currentSpeedDateId = speedDateIdDataRangeValues[i][0];
        var hasCurrentSpeedDateNoteOccured = false;

        for (var noteTableHeaderName in tableHeaderNames.speedDateNote) {
          if (noteTableHeaderName === currentSpeedDateId) {
            hasCurrentSpeedDateNoteOccured = true;
            break;
          }
        }

        if (!hasCurrentSpeedDateNoteOccured) {
          throw Utility.Error.create("V importovaných dátach chýba motivačný text k speed date-u s Id '" + currentSpeedDateId + "'.");
        }
      }

      // Load speed date note header ranges.
      var speedDateNoteHeaderRanges = _getHeaderRanges(tableHeadersRange, tableHeaderNames.speedDateNote);

      // Load table row count.
      var tableRowCount = _getTableRowCount(baseHeaderRanges.Id);

      // Set function cache to function result.
      _cache[name] = {
        headerRanges: {
          base: baseHeaderRanges,
          preference: preferenceHeaderRanges,
          speedDateNote: speedDateNoteHeaderRanges,
        },
        dataRanges: {
          base: _getDataRanges(baseHeaderRanges, tableRowCount),
          preference: _getDataRanges(preferenceHeaderRanges, tableRowCount),
          speedDateNote: _getDataRanges(speedDateNoteHeaderRanges, tableRowCount)
        },
        sheet: Utility.Spreadsheet.getSheetByName(name),
        headersRange: tableHeadersRange,
        rowCount: tableRowCount
      };
    }

    return _cache[name];
  };

  Table.loadStudents = function () {
    var name = "students";
    var headersRangeName = "Student_Headers";

    if (!(name in _cache)) {
      // Initialize table headers range and header names.
      var tableHeadersRange = Utility.Spreadsheet.getRangeByName(headersRangeName);
      var tableHeaderNames = Data.tableHeaderNames[name];

      // Load base and other header ranges.
      var baseHeaderRanges = _getHeaderRanges(tableHeadersRange, tableHeaderNames.base);
      var otherHeaderRanges = _getHeaderRanges(tableHeadersRange, tableHeaderNames.other);

      // Load table row count.
      var tableRowCount = _getTableRowCount(baseHeaderRanges.Id);

      // Initialize workshops table and speed dates table.
      var workshopsTable = Table.loadWorkshops();
      var speedDatesTable = Table.loadSpeedDates();

      // Load skill header ranges.
      var skillHeaderRanges = _getHeaderRanges(tableHeadersRange, Utility.Object.keys(workshopsTable.dataRanges.skillMin));

      // Load all existing workshop ids.
      var workshopIdsDataRangeValues = workshopsTable.dataRanges.base.Id.getValues();
      var workshopIds = [];

      for (var iWorkshop = 0; iWorkshop < workshopsTable.rowCount; ++iWorkshop) {
        workshopIds.push(workshopIdsDataRangeValues[iWorkshop][0]);
      }

      // Load all data ranges for each workshop id.
      var mainWorkshopHeaderRanges = _getHeaderRanges(tableHeadersRange, workshopIds);
      var workshopHeaderRanges = {};
      var workshopDataRanges = {};

      for (var workshopIdKey in mainWorkshopHeaderRanges) {
        var currentMainWorkshopHeaderRange = mainWorkshopHeaderRanges[workshopIdKey];

        var currentWorkshopHeaderRanges = {
          stud: currentMainWorkshopHeaderRange,
          stake: currentMainWorkshopHeaderRange.offset(0, 1),
          score: currentMainWorkshopHeaderRange.offset(0, 2),
          auto: currentMainWorkshopHeaderRange.offset(0, 3),
          final: currentMainWorkshopHeaderRange.offset(0, 4),
        };

        workshopHeaderRanges[workshopIdKey] = currentWorkshopHeaderRanges;
        workshopDataRanges[workshopIdKey] = _getDataRanges(currentWorkshopHeaderRanges, tableRowCount);
      }

      // Load all existing speed date ids.
      var speedDateIdsDataRangeValues = speedDatesTable.dataRanges.base.Id.getValues();
      var speedDateIds = [];

      for (var iSpeedDate = 0; iSpeedDate < speedDatesTable.rowCount; ++iSpeedDate) {
        speedDateIds.push(speedDateIdsDataRangeValues[iSpeedDate][0]);
      }

      // Load all data ranges for each speed date id.
      var mainSpeedDateHeaderRanges = _getHeaderRanges(tableHeadersRange, speedDateIds);
      var speedDateHeaderRanges = {};
      var speedDateDataRanges = {};

      for (var speedDateIdKey in mainSpeedDateHeaderRanges) {
        var currentMainSpeedDateHeaderRange = mainSpeedDateHeaderRanges[speedDateIdKey];

        var currentSpeedDateHeaderRanges = {
          stud: currentMainSpeedDateHeaderRange,
          stake: currentMainSpeedDateHeaderRange.offset(0, 1),
          score: currentMainSpeedDateHeaderRange.offset(0, 2),
          auto: currentMainSpeedDateHeaderRange.offset(0, 3),
          final: currentMainSpeedDateHeaderRange.offset(0, 4),
        };

        speedDateHeaderRanges[speedDateIdKey] = currentSpeedDateHeaderRanges;
        speedDateDataRanges[speedDateIdKey] = _getDataRanges(currentSpeedDateHeaderRanges, tableRowCount);
      }

      // Cache result.
      _cache[name] = {
        headerRanges: {
          base: baseHeaderRanges,
          other: otherHeaderRanges,
          skill: skillHeaderRanges,
          workshop: workshopHeaderRanges,
          speedDate: speedDateHeaderRanges
        },
        dataRanges: {
          base: _getDataRanges(baseHeaderRanges, tableRowCount),
          other: _getDataRanges(otherHeaderRanges, tableRowCount),
          skill: _getDataRanges(skillHeaderRanges, tableRowCount),
          workshop: workshopDataRanges,
          speedDate: speedDateDataRanges
        },
        sheet: Utility.Spreadsheet.getSheetByName(name),
        headersRange: tableHeadersRange,
        rowCount: tableRowCount
      };
    }

    return _cache[name];
  };

  Table.loadWorkshops = function () {
    var name = "workshops";
    var headersRangeName = "WS_Headers";

    if (!(name in _cache)) {
      // Initialize table headers range and header names.
      var tableHeadersRange = Utility.Spreadsheet.getRangeByName(headersRangeName);
      var tableHeaderNames = Data.tableHeaderNames[name];

      // Load base header ranges.
      var baseHeaderRanges = _getHeaderRanges(tableHeadersRange, tableHeaderNames.base);

      // Load all existing grade weight header ranges.
      var gradesTable = Table.loadGrades();
      var gradesIdDataRangeValues = gradesTable.dataRanges.Id.getValues();

      var gradeWeightHeaderRanges = {};
      for (var iGradesRow = Data.initialWorkshopsGradeRow; iGradesRow < gradesTable.rowCount; ++iGradesRow) {
        var gradeId = gradesIdDataRangeValues[iGradesRow][0];
        gradeWeightHeaderRanges[gradeId] = _getHeaderRanges(tableHeadersRange, [ gradeId ])[gradeId];
      }

      // Load all existing skill min and skill weight header ranges.
      var skillMinHeaderRanges = {};
      var skillWeightHeaderRanges = {};
      for (var iSkillId = 1; iSkillId <= Data.maxWorkshopsSkillId; ++iSkillId) {
        var skillId = "SK" + Utility.Number.pad(iSkillId, 2);
        var skillMinHeaderRange = _getHeaderRanges(tableHeadersRange, [ skillId ])[skillId];

        skillMinHeaderRanges[skillId] = skillMinHeaderRange;
        skillWeightHeaderRanges[skillId] = skillMinHeaderRange.offset(0, 1);
      }

      // Load table row count.
      var tableRowCount = _getTableRowCount(baseHeaderRanges.Id);

      // Cache result.
      _cache[name] = {
        headerRanges: {
          base: baseHeaderRanges,
          gradeWeight: gradeWeightHeaderRanges,
          skillMin: skillMinHeaderRanges,
          skillWeight: skillWeightHeaderRanges,
        },
        dataRanges: {
          base: _getDataRanges(baseHeaderRanges, tableRowCount),
          gradeWeight: _getDataRanges(gradeWeightHeaderRanges, tableRowCount),
          skillMin: _getDataRanges(skillMinHeaderRanges, tableRowCount),
          skillWeight: _getDataRanges(skillWeightHeaderRanges, tableRowCount)
        },
        sheet: Utility.Spreadsheet.getSheetByName(name),
        headersRange: tableHeadersRange,
        rowCount: tableRowCount
      };
    }

    return _cache[name];
  };

  Table.loadSpeedDates = function () {
    var name = "speedDates";
    var headersRangeName = "SD_Headers";

    if (!(name in _cache)) {
      // Initialize table headers range and header names.
      var tableHeadersRange = Utility.Spreadsheet.getRangeByName(headersRangeName);
      var tableHeaderNames = Data.tableHeaderNames[name];

      // Load base header ranges.
      var baseHeaderRanges = _getHeaderRanges(tableHeadersRange, tableHeaderNames.base);

      // Load table row count.
      var tableRowCount = _getTableRowCount(baseHeaderRanges.Id);

      // Cache result.
      _cache[name] = {
        headerRanges: {
          base: baseHeaderRanges
        },
        dataRanges: {
          base: _getDataRanges(baseHeaderRanges, tableRowCount)
        },
        sheet: Utility.Spreadsheet.getSheetByName(name),
        headersRange: tableHeadersRange,
        rowCount: tableRowCount
      };
    }

    return _cache[name];
  };

  Table.loadEvents = function () {
    var name = "events";
    var headersRangeName = "EV_Headers";

    if (!(name in _cache)) {
      // Initialize table headers range and header names.
      var tableHeadersRange = Utility.Spreadsheet.getRangeByName(headersRangeName);
      var tableHeaderNames = Data.tableHeaderNames[name];

      // Load base header ranges.
      var baseHeaderRanges = _getHeaderRanges(tableHeadersRange, tableHeaderNames.base);

      // Load table row count.
      var tableRowCount = _getTableRowCount(baseHeaderRanges.Id);

      // Cache result.
      _cache[name] = {
        headerRanges: {
          base: baseHeaderRanges
        },
        dataRanges: {
          base: _getDataRanges(baseHeaderRanges, tableRowCount)
        },
        sheet: Utility.Spreadsheet.getSheetByName(name),
        headersRange: tableHeadersRange,
        rowCount: tableRowCount
      };
    }

    return _cache[name];
  };

  Table.loadRatings = function () {
    var name = "ratings";
    var headersRangeName = "Rating_Headers";

    if (!(name in _cache)) {
      // Initialize table headers range and header names.
      var tableHeadersRange = Utility.Spreadsheet.getRangeByName(headersRangeName);

      // Load header ranges.
      var headerRanges = _getHeaderRanges(tableHeadersRange, Data.tableHeaderNames[name]);

      // Load table row count.
      var tableRowCount = _getTableRowCount(headerRanges.Name);

      // Cache result.
      _cache[name] = {
        headerRanges: headerRanges,
        dataRanges: _getDataRanges(headerRanges, tableRowCount),
        headersRange: tableHeadersRange,
        rowCount: tableRowCount
      };
    }

    return _cache[name];
  };

  Table.loadGrades = function () {
    var name = "grades";
    var headersRangeName = "Grade_Headers";

    if (!(name in _cache)) {
      // Initialize table headers range and header names.
      var tableHeadersRange = Utility.Spreadsheet.getRangeByName(headersRangeName);

      // Load header ranges.
      var headerRanges = _getHeaderRanges(tableHeadersRange, Data.tableHeaderNames[name]);

      // Load table row count.
      var tableRowCount = _getTableRowCount(headerRanges.Id);

      // Cache result.
      _cache[name] = {
        headerRanges: headerRanges,
        dataRanges: _getDataRanges(headerRanges, tableRowCount),
        headersRange: tableHeadersRange,
        rowCount: tableRowCount
      };
    }

    return _cache[name];
  };

  Table.loadAlg = function () {
    var name = "alg";
    var headersRangeName = "Alg_Headers";

    if (!(name in _cache)) {
      // Initialize table headers range and header names.
      var tableHeadersRange = Utility.Spreadsheet.getRangeByName(headersRangeName);

      // Load header ranges.
      var headerRanges = _getHeaderRanges(tableHeadersRange, Data.tableHeaderNames[name]);

      // Load table row count.
      var tableRowCount = _getTableRowCount(headerRanges.Priority);

      // Cache result.
      _cache[name] = {
        headerRanges: headerRanges,
        dataRanges: _getDataRanges(headerRanges, tableRowCount),
        headersRange: tableHeadersRange,
        rowCount: tableRowCount
      };
    }

    return _cache[name];
  };
})();
