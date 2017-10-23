function menuItemCheckDataConsistency_() {
  var hasErrorOccured = false;

  try {
    var importTable = Table.loadImport();
    var studentsTable = Table.loadStudents();
    var workshopsTable = Table.loadWorkshops();
    var speedDatesTable = Table.loadSpeedDates();
    var ratingsTable = Table.loadRatings();
    var gradesTable = Table.loadGrades();
    var algTable = Table.loadAlg();
  } catch (error) {
    Utility.Error.log(error);
    hasErrorOccured = true;
  }
  Utility.clearAll();

  if (!hasErrorOccured) {
    Browser.msgBox("Operácia uspela", "Konzistentnosť dát bola úspešne overená.", Browser.Buttons.OK);
  }
}

function menuItemImportNewStudentsNoOverwrite_() {
  Data.overwriteEnabled = false;
  menuItemImportNewStudents_();
}

function menuItemImportNewStudentsOverwrite_() {
  Data.overwriteEnabled = true;
  menuItemImportNewStudents_();
}

function menuItemImportNewStudents_() {
  var hasErrorOccured = false;

  try {
    // Load tables.
    var importTable = Table.loadImport();
    var studentsTable = Table.loadStudents();
    var workshopsTable = Table.loadWorkshops();
    var speedDatesTable = Table.loadSpeedDates();

    // Create alias to id map for workshops table and speed dates table.
    var workshopAliasToId = Import.createAliasToIdMap(workshopsTable);
    var speedDateAliasToId = Import.createAliasToIdMap(speedDatesTable);

    // Collect import data range values.
    var importDataRangeValues = Import.loadImportTableDataRangeValues(importTable);

    // Collect existing students data range values.
    var existingStudentsDataRangeValues = Import.loadStudentsTableDataRangeValues(studentsTable);

    // Initialize new students data range values.
    var newStudentsDataRangeValues = Import.initializeStudentsDataRangeValues(studentsTable);

    // Load workshop ids and speed date ids.
    var workshopIds = Utility.Object.keys(studentsTable.dataRanges.workshop);
    var speedDateIds = Utility.Object.keys(studentsTable.dataRanges.speedDate);

    // Create id to row map for students table.
    var studentsIdToRow = Import.createIdToRowMap(existingStudentsDataRangeValues);

    // Merge import data with existing students data.
    for (var i = 0; i < importTable.rowCount; ++i) {
      // Extract data from import row.
      var extractedStudentData = {
        base: Import.extractBaseDataFromImportRow(importDataRangeValues, i)
      };
      extractedStudentData.workshop = Import.extractWorkshopPreferencesFromImportRow(
        importTable, importDataRangeValues, i, workshopIds, workshopAliasToId);
      extractedStudentData.speedDate = Import.extractSpeedDatePreferencesFromImportRow(
        importTable, importDataRangeValues, i, speedDateIds, speedDateAliasToId);
      extractedStudentData.speedDateNote = Import.extractSpeedDateNotesFromImportRow(
        importDataRangeValues, i, speedDateIds);

      // Include data in new and existing student rows.
      var studentRow = studentsIdToRow[importDataRangeValues.base.Id[i][0]];
      if (studentRow === undefined) {
        Import.appendRowToNewStudentValues(newStudentsDataRangeValues, extractedStudentData);
      } else {
        Import.mergeRowWithExistitngStudentValues(
          existingStudentsDataRangeValues, studentRow, extractedStudentData);
      }
    }

    // Save existing students data range values to table.
    Import.saveExistingStudentsDataRangeValues(studentsTable, existingStudentsDataRangeValues);

    // Insert new students data range values to table.
    Import.addNewStudentsDataRangeValues(studentsTable, newStudentsDataRangeValues);

    // Remove last row in students if there were no existing rows and new rows were added.
    var newStudentCount = newStudentsDataRangeValues.base.Id.length;
    if ((studentsTable.rowCount === 0) && (newStudentCount > 0)) {
      studentsTable.sheet.deleteRow(studentsTable.headersRange.getLastRow() + newStudentCount + 1);
    }

    // Clear and set import sheet contents.
    Import.clearAndSetImportSheetContents(importTable);
  } catch (error) {
    Utility.Error.log(error);
    hasErrorOccured = true;
  }
  Utility.clearAll();

  if (!hasErrorOccured) {
    Browser.msgBox("Operácia uspela", "Dáta boli úspešne pridané.\\n"
                   + "Čakajte prosím, kým sa nové dáta načítajú.", Browser.Buttons.OK);
  }
}

function menuItemComputeStudentScores_() {
  var hasErrorOccured = false;

  try {
    // Load tables.
    var studentsTable = Table.loadStudents();
    var workshopsTable = Table.loadWorkshops();
    var speedDatesTable = Table.loadSpeedDates();
    var ratingsTable = Table.loadRatings();
    var gradesTable = Table.loadGrades();

    // Check if any student exists.
    if (studentsTable.rowCount === 0) {
      throw Utility.Error.create("Neboli nájdené žiadne študentské záznamy");
    }

    // Load student rating and grade values.
    var studentRatingDataRangeValues = studentsTable.dataRanges.other.Rating.getValues();
    var studentGradeDataRangeValues = studentsTable.dataRanges.other.Grade.getValues();

    // Load student skill values.
    var studentSkillDataRangeValues = Assign.loadDataRangeValues(studentsTable.dataRanges.skill);

    // Load student workshop score ranges.
    var studentWorkshopScoreDataRanges = Assign.loadDataRanges(studentsTable.dataRanges.workshop, "score");
    var studentWorkshopScoreDataRangeValues = Assign.loadDataRangeValues(studentWorkshopScoreDataRanges);

    // Load student speed date score ranges.
    var studentSpeedDateScoreDataRanges = Assign.loadDataRanges(studentsTable.dataRanges.speedDate, "score");
    var studentSpeedDateScoreDataRangeValues = Assign.loadDataRangeValues(studentSpeedDateScoreDataRanges);

    // Initialize workshop id to row map.
    var workshopIdToRow = Assign.createIdToRowMap(workshopsTable);

    // Initialize rating name to value map.
    var ratingNameToValue = Assign.createDataRangeValueMap(
      ratingsTable, ratingsTable.dataRanges.Name.getValues(), ratingsTable.dataRanges.Value.getValues());

    // Initialize grade name to id map.
    var gradeNameToId = Assign.createDataRangeValueMap(
      gradesTable, gradesTable.dataRanges.Name.getValues(), gradesTable.dataRanges.Id.getValues());

    // Load workshop grade weight values.
    var workshopGradeWeightDataRangeValues = Assign.loadDataRangeValues(workshopsTable.dataRanges.gradeWeight);

    // Load workshop skill weight values.
    var workshopSkillWeightDataRangeValues = Assign.loadDataRangeValues(workshopsTable.dataRanges.skillWeight);

    // Compute student scores.
    for (var studentRow = 0; studentRow < studentsTable.rowCount; ++studentRow) {
      // Load student rating value.
      var studentRatingValue = Assign.loadStudentRatingValue(
        studentRatingDataRangeValues[studentRow][0], ratingNameToValue, studentRow, studentsTable);

      // Load student grade id.
      var studentGradeId = Assign.loadStudentGradeId(
        studentGradeDataRangeValues[studentRow][0], gradeNameToId, studentRow, studentsTable);

      // Compute student score for each workshop.
      for (var workshopId in studentWorkshopScoreDataRanges) {
        var workshopRow = workshopIdToRow[workshopId];

        // Load workshop grade weight.
        var workshopGradeWeight = ((studentGradeId !== null) && (studentGradeId in workshopGradeWeightDataRangeValues)) ?
            workshopGradeWeightDataRangeValues[studentGradeId][workshopRow][0] : 0;

        // Compute workshop skill weight sum.
        var workshopSkillWeightSum = Assign.computeWorkshopSkillScoreSum(
          studentSkillDataRangeValues, workshopSkillWeightDataRangeValues, studentRow, workshopRow);

        // Compute workshop score.
        studentWorkshopScoreDataRangeValues[workshopId][studentRow][0] = studentRatingValue + workshopGradeWeight + workshopSkillWeightSum;
      }

      // Compute student score for each speed date.
      for (var speedDateId in studentSpeedDateScoreDataRanges) {
        studentSpeedDateScoreDataRangeValues[speedDateId][studentRow][0] = studentRatingValue;
      }
    }

    // Save student workshop and speed date score ranges.
    Assign.saveDataRangeValues(studentWorkshopScoreDataRanges, studentWorkshopScoreDataRangeValues);
    Assign.saveDataRangeValues(studentSpeedDateScoreDataRanges, studentSpeedDateScoreDataRangeValues);
  } catch (error) {
    Utility.Error.log(error);
    hasErrorOccured = true;
  }
  Utility.clearAll();

  if (!hasErrorOccured) {
    Browser.msgBox("Operácia uspela", "Študentom boli úspešne priradené ohodnotenia.\\n"
                   + "Čakajte prosím, kým sa nové dáta načítajú.", Browser.Buttons.OK);
  }
}

function menutItemAssignStudents_() {
  var hasErrorOccured = false;

  try {
    // Load tables.
    var studentsTable = Table.loadStudents();
    var workshopsTable = Table.loadWorkshops();
    var speedDatesTable = Table.loadSpeedDates();
    var algTable = Table.loadAlg();

    // Check if any student exists.
    if (studentsTable.rowCount === 0) {
      throw Utility.Error.create("Neboli nájdené žiadne študentské záznamy");
    }

    // Load student skill range values.
    var studentSkillDataRangeValues = Assign.loadDataRangeValues(studentsTable.dataRanges.skill);

    // Load student workshop stud, stake and score range values.
    var studentWorkshopStudDataRangeValues = Assign.loadDataRangeValues(
      Assign.loadDataRanges(studentsTable.dataRanges.workshop, "stud"));
    var studentWorkshopStakeDataRangeValues = Assign.loadDataRangeValues(
      Assign.loadDataRanges(studentsTable.dataRanges.workshop, "stake"));
    var studentWorkshopScoreDataRangeValues = Assign.loadDataRangeValues(
      Assign.loadDataRanges(studentsTable.dataRanges.workshop, "score"));

    // Load student speed date stud, stake and score range values.
    var studentSpeedDateStudDataRangeValues = Assign.loadDataRangeValues(
      Assign.loadDataRanges(studentsTable.dataRanges.speedDate, "stud"));
    var studentSpeedDateStakeDataRangeValues = Assign.loadDataRangeValues(
      Assign.loadDataRanges(studentsTable.dataRanges.speedDate, "stake"));
    var studentSpeedDateScoreDataRangeValues = Assign.loadDataRangeValues(
      Assign.loadDataRanges(studentsTable.dataRanges.speedDate, "score"));

    // Load student workshop auto ranges.
    var studentWorkshopAutoDataRanges = Assign.loadDataRanges(studentsTable.dataRanges.workshop, "auto");
    var studentWorkshopAutoDataRangeValues = Assign.loadDataRangeValues(studentWorkshopAutoDataRanges);

    // Load student speed date auto ranges.
    var studentSpeedDateAutoDataRanges = Assign.loadDataRanges(studentsTable.dataRanges.speedDate, "auto");
    var studentSpeedDateAutoDataRangeValues = Assign.loadDataRangeValues(studentSpeedDateAutoDataRanges);

    // Initialize workshop id to row map.
    var workshopIdToRow = Assign.createIdToRowMap(workshopsTable);

    // Initialize speed date id to row map.
    var speedDateIdToRow = Assign.createIdToRowMap(speedDatesTable);

    // Load workshop skill min values.
    var workshopSkillMinDataRangeValues = Assign.loadDataRangeValues(workshopsTable.dataRanges.skillMin);

    // Initialize params string to priority map.
    var paramsStringToPriority = Assign.createParamsStringToPriorityMap(algTable);

    // Load workshop capacity and speed date capacity values.
    var workshopCapacityDataRangeValues = workshopsTable.dataRanges.base.Capacity.getValues();
    var speedDateCapacityDataRangeValues = speedDatesTable.dataRanges.base.Capacity.getValues();

    // Create workshop candidate rows and reserve values.
    var workshopReserveDataRangeValues = {};
    var workshopCandidateStudentRows = {};

    // Initialize workshop time period to ids map and speed date ids.
    var workshopTimePeriodToIds = Assign.createWorkshopTimePeriodToIdsMap(workshopsTable);
    var speedDateIds = Utility.Object.keys(studentSpeedDateAutoDataRangeValues);

    for (var workshopId in studentWorkshopAutoDataRanges) {
      // Initialize workshop specific variables.
      var workshopRow = workshopIdToRow[workshopId];
      var workshopCapacityDataRangeValue = workshopCapacityDataRangeValues[workshopRow];

      // Compute workshop reserve values.
      var workshopReserveValue = workshopCapacityDataRangeValue[0] * Data.reserveToCapacityCoeficient;

      // Create workshop candidate rows.
      workshopCandidateStudentRows[workshopId] = Assign.processCandidateData(studentsTable, paramsStringToPriority, {
        stud: studentWorkshopStudDataRangeValues[workshopId],
        stake: studentWorkshopStakeDataRangeValues[workshopId],
        score: studentWorkshopScoreDataRangeValues[workshopId],
        auto: studentWorkshopAutoDataRangeValues[workshopId],
        capacity: workshopCapacityDataRangeValues
      }, workshopRow, studentSkillDataRangeValues, workshopSkillMinDataRangeValues);

      // Reevaluate workshop reserve values after candidate subtraction.
      if (workshopCapacityDataRangeValue[0] < 0) {
        workshopCapacityDataRangeValue[0] = 0;
        workshopReserveValue += workshopCapacityDataRangeValue[0];
      }
      workshopReserveDataRangeValues[workshopRow] = [ workshopReserveValue ];
    }

    // Create speed date candidate rows and reserve values.
    var speedDateReserveDataRangeValues = {};
    var speedDateCandidateStudentRows = {};

    for (var speedDateId in studentSpeedDateAutoDataRanges) {
      // Initialize speed date specific variables.
      var speedDateRow = speedDateIdToRow[speedDateId];
      var speedDateCapacityDataRangeValue = speedDateCapacityDataRangeValues[speedDateRow];

      // Compute workshop reserve values.
      var speedDateReserveValue = speedDateCapacityDataRangeValue[0] * Data.reserveToCapacityCoeficient;

      speedDateCandidateStudentRows[speedDateId] = Assign.processCandidateData(studentsTable, paramsStringToPriority, {
        stud: studentSpeedDateStudDataRangeValues[speedDateId],
        stake: studentSpeedDateStakeDataRangeValues[speedDateId],
        score: studentSpeedDateScoreDataRangeValues[speedDateId],
        auto: studentSpeedDateAutoDataRangeValues[speedDateId],
        capacity: speedDateCapacityDataRangeValue
      }, speedDateRow);

      // Reevaluate speed date reserve values after candidate subtraction.
      if (speedDateCapacityDataRangeValue[0] < 0) {
        speedDateCapacityDataRangeValue[0] = 0;
        speedDateReserveValue += speedDateCapacityDataRangeValue[0];
      }
      speedDateReserveDataRangeValues[speedDateRow] = [ speedDateReserveValue ];
    }

    for (var workshopTimePeriod in workshopTimePeriodToIds) {
      // Randomly shuffle workshop ids for the current time period.
      var timePeriodWorkshopIds = Utility.Array.shuffle(workshopTimePeriodToIds[workshopTimePeriod]);

      // Determine candidate student workshop assignements for fullfilling capacities.
      Assign.determineCandidateStudentAssignments(timePeriodWorkshopIds, workshopIdToRow,
                                                  workshopCapacityDataRangeValues, workshopCandidateStudentRows,
                                                  studentWorkshopAutoDataRangeValues, Data.preferenceValues.accepted);

      // Determine candidate student workshop assignements for fullfilling reserves.
      Assign.determineCandidateStudentAssignments(timePeriodWorkshopIds, workshopIdToRow,
                                                  workshopReserveDataRangeValues, workshopCandidateStudentRows,
                                                  studentWorkshopAutoDataRangeValues, Data.preferenceValues.reserved);
    }

    // Randomly shuffle speed date ids for the current time period.
    var timePeriodSpeedDateIds = Utility.Array.shuffle(speedDateIds);

    // Determine candidate student workshop assignements for fullfilling capacities.
    Assign.determineCandidateStudentAssignments(timePeriodSpeedDateIds, speedDateIdToRow,
                                                speedDateCapacityDataRangeValues, speedDateCandidateStudentRows,
                                                studentSpeedDateAutoDataRangeValues, Data.preferenceValues.accepted);

    // Determine candidate student workshop assignements for fullfilling reserves.
    Assign.determineCandidateStudentAssignments(timePeriodSpeedDateIds, speedDateIdToRow,
                                                speedDateReserveDataRangeValues, speedDateCandidateStudentRows,
                                                studentSpeedDateAutoDataRangeValues, Data.preferenceValues.reserved);

    // Save student workshop and speed date auto ranges.
    Assign.saveDataRangeValues(studentWorkshopAutoDataRanges, studentWorkshopAutoDataRangeValues);
    Assign.saveDataRangeValues(studentSpeedDateAutoDataRanges, studentSpeedDateAutoDataRangeValues);
  } catch (error) {
    Utility.Error.log(error);
    hasErrorOccured = true;
  }
  Utility.clearAll();

  if (!hasErrorOccured) {
    Browser.msgBox("Operácia uspela", "Študenti boli úspešne priradení do workshop-ov a na speed date-y.\\n"
                   + "Čakajte prosím, kým sa nové dáta načítajú.", Browser.Buttons.OK);
  }
}

function menutItemExportForApp_() {
  var hasErrorOccured = false;

  try {
    // Load tables.
    var workshopsTable = Table.loadWorkshops();
    var speedDatesTable = Table.loadSpeedDates();
    var eventsTable = Table.loadEvents();
    var studentsTable = Table.loadStudents();

    // Check if any student exists.
    if (studentsTable.rowCount === 0) {
      throw Utility.Error.create("Neboli nájdené žiadne študentské záznamy");
    }

    // Load workshop and speed date events.
    var workshopEvents = Export.getWorkshops(workshopsTable);
    var speedDateEvents = Export.getSpeedDates(speedDatesTable);

    // Collect all events.
    var events = Export.getEvents(eventsTable);
    for (var workshopKey in workshopEvents) {
      events[workshopKey] = workshopEvents[workshopKey];
    }
    for (var speedDateKey in speedDateEvents) {
      events[speedDateKey] = speedDateEvents[speedDateKey];
    }

    // Create export object.
    var exportObject = {
      "attendees": Export.getAttendees(studentsTable, workshopEvents, speedDateEvents),
      "events": events
    };
  } catch (error) {
    Utility.Error.log(error);
    hasErrorOccured = true;
  }
  Utility.clearAll();

  if (!hasErrorOccured) {
    var htmlString = '<p>Nasleduje výstup:</p>'
      + '<pre style="background: #ddd; padding: 5px;">' + JSON.stringify(exportObject, null, 2) + '</pre>';
    var htmlOutput = HtmlService.createHtmlOutput(htmlString)
      .setWidth(1000)
      .setHeight(600);

    SpreadsheetApp.getUi().showModalDialog(htmlOutput, "Operácia uspela");
  }
}

function onOpen()
{
  // Add menu items for custom functions.
  var spreadsheet = SpreadsheetApp.getActive();
  if (spreadsheet !== null) {
    spreadsheet.addMenu('Night of Chances - Automatizácia', [
      // Add check data consistency menu item.
      { name: 'Overiť konsistentnosť dát', functionName: 'menuItemCheckDataConsistency_' },
      // Add import new students menu item.
      { name: 'Importovať nových študentov (bez prepísania)', functionName: 'menuItemImportNewStudentsNoOverwrite_' },
      // Add import new students menu item.
      { name: 'Importovať nových študentov (s prepísaním)', functionName: 'menuItemImportNewStudentsOverwrite_' },
      // Add compute student scores menu item.
      { name: 'Spočítať ohodnotenia študentov', functionName: 'menuItemComputeStudentScores_' },
      // Add assign students menu item.
      { name: 'Priradiť študentov na workshop-y a speed date-y', functionName: 'menutItemAssignStudents_' },
      // Add export data menu item.
      { name: 'Exportovať študentov, workshop-y a speed date-y pre apku', functionName: 'menutItemExportForApp_' }
    ]);
  }
}
