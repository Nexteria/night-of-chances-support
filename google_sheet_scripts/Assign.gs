var Assign = {};

(function () {
  Assign.createIdToRowMap = function (table) {
    var map = {};
    var idsDataRangeValues = table.dataRanges.base.Id.getValues();
    for (var i = 0; i < table.rowCount; ++i) {
      map[idsDataRangeValues[i][0]] = i;
    }
    return map;
  };

  Assign.createDataRangeValueMap = function (table, keyDataRangeValues, valueDataRangeValues) {
    var map = {};
    for (var i = 0; i < table.rowCount; ++i) {
      map[keyDataRangeValues[i][0]] = valueDataRangeValues[i][0];
    }
    return map;
  };

  Assign.loadDataRanges = function (dataRanges, subKey) {
    var scoreDataRanges = {};
    for (var id in dataRanges) {
      scoreDataRanges[id] = dataRanges[id][subKey];
    }
    return scoreDataRanges;
  };

  Assign.loadDataRangeValues = function (dataRanges) {
    var dataRangeValues = {};
    for (var id in dataRanges) {
      dataRangeValues[id] = dataRanges[id].getValues();
    }
    return dataRangeValues;
  };

  Assign.saveDataRangeValues = function (dataRanges, dataRangeValues) {
    for (var id in dataRanges) {
      dataRanges[id].setValues(dataRangeValues[id]);
    }
  };

  Assign.loadStudentRatingValue = function (studentRatingName, ratingNameToValue, studentRow, studentsTable) {
    if (studentRatingName === "") {
      return 0.0;
    }
    if (!(studentRatingName in ratingNameToValue)) {
      var errorMessage = "Hodnota ratingu '" + studentRatingName + "' v riadku '"
      + (studentRow + studentsTable.headersRange.getLastRow() + 1)
      + "' v študentských záznamoch nezodpovedá žiadnej známej hodnote."
      throw Utility.Error.create(errorMessage);
    }
    return ratingNameToValue[studentRatingName];
  };

  Assign.loadStudentGradeId = function (studentGradeName, gradeNameToId, studentRow, studentsTable) {
    if (studentGradeName === "") {
      return null;
    }
    if (!(studentGradeName in gradeNameToId)) {
      var errorMessage = "Hodnota ročníka '" + studentGradeName + "' v riadku '"
      + (studentRow + studentsTable.headersRange.getLastRow() + 1)
      + "' v študentských záznamoch nezodpovedá žiadnej známej hodnote."
      throw Utility.Error.create(errorMessage);
    }
    return gradeNameToId[studentGradeName];
  };

  Assign.computeWorkshopSkillScoreSum = function (
    studentSkillDataRangeValues, workshopSkillWeightDataRangeValues, studentRow, workshopRow) {
    var sum = 0;
    for (var skillId in studentSkillDataRangeValues) {
      var studentSkillLevel = studentSkillDataRangeValues[skillId][studentRow][0];
      var workshopSkillWeight = workshopSkillWeightDataRangeValues[skillId][workshopRow][0];

      sum += studentSkillLevel * workshopSkillWeight;
    }
    return sum;
  };

  Assign.createWorkshopTimePeriodToIdsMap = function (workshopTable) {
    var map = {};

    var timePeriodDataRangeValues = workshopTable.dataRanges.base.TimePeriod.getValues();
    var idDataRangeValues = workshopTable.dataRanges.base.Id.getValues();

    for (var i = 0; i < workshopTable.rowCount; ++i) {
      var timePeriodValue = timePeriodDataRangeValues[i][0];
      if (!(timePeriodValue in map)) {
        map[timePeriodValue] = [];
      }
      map[timePeriodValue].push(idDataRangeValues[i][0]);
    }

    return map;
  };

  Assign.generateParamsString = function (minSkill, studPreference, stakePreference) {
    return [
      minSkill, studPreference, stakePreference
    ].join("|");
  };

  Assign.createParamsStringToPriorityMap = function (algTable) {
    var map = {};

    var prioritDataRangeValues = algTable.dataRanges.Priority.getValues();
    var minSkillDataRangeValues = algTable.dataRanges.MinSkill.getValues();
    var studDataRangeValues = algTable.dataRanges.Stud.getValues();
    var stakeDataRangeValues = algTable.dataRanges.Stake.getValues();

    for (var i = 0; i < algTable.rowCount; ++i) {
      var paramsString = Assign.generateParamsString(
        minSkillDataRangeValues[i][0], studDataRangeValues[i][0], stakeDataRangeValues[i][0]);
      var priority = prioritDataRangeValues[i][0];

      map[paramsString] = (priority === Data.preferenceValues.preRejected) ? null : priority;
    }

    return map;
  };

  function _compareCandidateData(a, b) {
    if ((a.priority < b.priority) || ((a.priority === b.priority) && (a.score < b.score))) {
      return 1;
    } else if ((a.priority > b.priority) || ((a.priority === b.priority) && (a.score > b.score))) {
      return -1;
    }
    return 0;
  }

  Assign.processCandidateData = function (studentsTable, paramsStringToPriority, dataRangeValues, row,
                                          studentSkillDataRangeValues, skillMinDataRangeValues) {
    var currentCandidateStudentData = [];
    var capacityDataRangeValue = dataRangeValues.capacity;

    for (var studentRow = 0; studentRow < studentsTable.rowCount; ++studentRow) {
      var autoDataRangeValue = dataRangeValues.auto[studentRow];
      if (autoDataRangeValue[0] === Data.preferenceValues.preRejected) {
        continue;
      }
      if (autoDataRangeValue[0] === Data.preferenceValues.preAccepted) {
        --capacityDataRangeValue[0];
        continue;
      }

      var isMinSkillSatisfied = true;
      if ((studentSkillDataRangeValues !== undefined) && (skillMinDataRangeValues !== undefined)) {
        for (var skillId in studentSkillDataRangeValues) {
          var studentSkillLevel = studentSkillDataRangeValues[skillId][studentRow][0];
          var skillMin = skillMinDataRangeValues[skillId][row][0];

          if (studentSkillLevel < skillMin) {
            isMinSkillSatisfied = false;
            break;
          }
        }
      }

      var paramsString = Assign.generateParamsString(
        isMinSkillSatisfied ? 1 : 0, dataRangeValues.stud[studentRow][0], dataRangeValues.stake[studentRow][0]);
      if (!(paramsString in paramsStringToPriority)) {
        throw Utility.Error.create("Neznáma hodnota bola nájdená v preferenciach v riadku '" + studentRow + "'\\n"
                                   + "Je možné že k chybe došlo aj pri vypĺňaní nastavení algoritmu.");
      }
      var priority = paramsStringToPriority[paramsString];
      if (priority === null) {
        autoDataRangeValue[0] = Data.preferenceValues.rejected;
        continue;
      } else {
        autoDataRangeValue[0] = "";
      }

      currentCandidateStudentData.push({
        priority: priority,
        score: dataRangeValues.score[studentRow][0],
        row: studentRow
      });
    }

    currentCandidateStudentData.sort(_compareCandidateData);

    var currentCandidateStudentRows = [];
    for (var i = 0; i < currentCandidateStudentData.length; ++i) {
      currentCandidateStudentRows.push(currentCandidateStudentData[i].row);
    }
    return currentCandidateStudentRows;
  };

  Assign.determineCandidateStudentAssignments = function (ids, idToRow, capacityDataRangeValues,
                                                          candidateStudentRows, autoDataRangeValues, value) {
    var areAllCapacitiesFilled = false;
    while (!areAllCapacitiesFilled) {
      areAllCapacitiesFilled = true;

      for (var i = 0; i < ids.length; ++i) {
        var id = ids[i];
        var row = idToRow[id];

        var currentCandidateStudentRows = candidateStudentRows[id];
        var capacityDataRangeValue = capacityDataRangeValues[row];

        if ((currentCandidateStudentRows.length === 0) || (capacityDataRangeValue[0] <= 0)) {
          continue;
        }
        areAllCapacitiesFilled = false;

        var candidateStudentRow = currentCandidateStudentRows[0];

        var isPreAcceptedCandidate = false;
        for (var j = 0; j < ids.length; ++j) {
          var otherId = ids[j];
          var otherCandidateStudentRows = candidateStudentRows[otherId];
          var candidateStudentRowIndex = otherCandidateStudentRows.indexOf(candidateStudentRow);

          if (candidateStudentRowIndex !== -1) {
            otherCandidateStudentRows.splice(candidateStudentRowIndex, 1);
          }

          if (autoDataRangeValues[otherId][candidateStudentRow][0] === Data.preferenceValues.preAccepted) {
            isPreAcceptedCandidate = true;
          }
        }

        if (!isPreAcceptedCandidate) {
          autoDataRangeValues[id][candidateStudentRow][0] = value;
          --capacityDataRangeValue[0];
        }
      }
    }
  };
})();
