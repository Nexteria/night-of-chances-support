var Export = {};

(function () {
  function dateTimeToTimestamp(dateTimeValue) {
    if (dateTimeValue) {
      var parts = dateTimeValue.split(" ");
      var dateArr = parts[0].split(".").map(function (value) {
        return parseInt(value, 10);
      });
      var timeArr = parts[1].split(".").map(function (value) {
        return parseInt(value, 10);
      });

      return Math.round(new Date(dateArr[2], dateArr[1] - 1, dateArr[0],
                                 timeArr[0], timeArr[1], timeArr[2], 0).getTime() / 1000).toString();
    }

    return Math.round(new Date().getTime() / 1000).toString();
  }

  Export.getWorkshops = function (table) {
    var baseDataRanges = table.dataRanges.base;
    var baseDataRangeValues = {};
    Object.keys(baseDataRanges).forEach(function(key) {
      baseDataRangeValues[key] = table.dataRanges.base[key].getValues();
    });

    var result = {};

    for (var i = 0; i < table.rowCount; ++i) {
      result[baseDataRangeValues.Id[i][0]] = {
        start_time: dateTimeToTimestamp(baseDataRangeValues.StartTime[i][0]),
        end_time: dateTimeToTimestamp(baseDataRangeValues.EndTime[i][0]),
        min_capacity: baseDataRangeValues.MinCapacity[i][0],
        max_capacity: baseDataRangeValues.Capacity[i][0],
        name: baseDataRangeValues.Name1[i][0] + " " + baseDataRangeValues.Name2[i][0],
        room: baseDataRangeValues.Room[i][0],
        attendees: {},
        preselected_attendees_count: 0,
        standin_attendees: {},
        type : baseDataRangeValues.Type[i][0]
      };
    }

    return result;
  };

  Export.getSpeedDates = function (table) {
    var baseDataRanges = table.dataRanges.base;
    var baseDataRangeValues = {};
    Object.keys(baseDataRanges).forEach(function(key) {
      baseDataRangeValues[key] = table.dataRanges.base[key].getValues();
    });

    var result = {};

    for (var i = 0; i < table.rowCount; ++i) {
      result[baseDataRangeValues.Id[i][0]] = {
        start_time: dateTimeToTimestamp(baseDataRangeValues.StartTime[i][0]),
        end_time: dateTimeToTimestamp(baseDataRangeValues.EndTime[i][0]),
        min_capacity: Data.defaultSpeedDateMinCapacity,
        max_capacity: baseDataRangeValues.Capacity[i][0],
        name: baseDataRangeValues.Name1[i][0] + " " + baseDataRangeValues.Name2[i][0],
        room: baseDataRangeValues.Room[i][0],
        attendees: {},
        preselected_attendees_count: 0,
        standin_attendees: {},
        type : baseDataRangeValues.Type[i][0]
      };
    }

    return result;
  };

  Export.getEvents = function (table) {
    var baseDataRanges = table.dataRanges.base;
    var baseDataRangeValues = {};
    Object.keys(baseDataRanges).forEach(function(key) {
      baseDataRangeValues[key] = table.dataRanges.base[key].getValues();
    });

    var result = {};

    for (var i = 0; i < table.rowCount; ++i) {
      result[baseDataRangeValues.Id[i][0]] = {
        start_time: dateTimeToTimestamp(baseDataRangeValues.StartTime[i][0]),
        end_time: dateTimeToTimestamp(baseDataRangeValues.EndTime[i][0]),
        min_capacity: "",
        max_capacity: "",
        name: baseDataRangeValues.Name[i][0],
        room: baseDataRangeValues.Room[i][0],
        attendees: {},
        preselected_attendees_count: 0,
        standin_attendees: {},
        type : baseDataRangeValues.Type[i][0]
      };
    }

    return result;
  };

  Export.getAttendees = function (table, workshopEvents, speedDateEvents) {
    var baseDataRanges = table.dataRanges.base;
    var baseDataRangeValues = {};
    Object.keys(baseDataRanges).forEach(function(key) {
      baseDataRangeValues[key] = baseDataRanges[key].getValues();
    });
    var otherDataRanges = table.dataRanges.other;
    var otherDataRangeValues = {};
    Object.keys(otherDataRanges).forEach(function(key) {
      otherDataRangeValues[key] = otherDataRanges[key].getValues();
    });
    var workshopDataRanges = table.dataRanges.workshop;
    var workshopDataRangeValues = {};
    Object.keys(workshopDataRanges).forEach(function(key) {
      workshopDataRangeValues[key] = workshopDataRanges[key].auto.getValues();
    });
    var speedDateDataRanges = table.dataRanges.speedDate;
    var speedDateDataRangeValues = {};
    Object.keys(speedDateDataRanges).forEach(function(key) {
      speedDateDataRangeValues[key] = speedDateDataRanges[key].auto.getValues();
    });

    var result = {};

    for (var i = 0; i < table.rowCount; ++i) {
      var item = {
        checked_in: dateTimeToTimestamp(baseDataRangeValues.OrderDate[i][0]),
        email: baseDataRangeValues.Email[i][0],
        name: baseDataRangeValues.FirstName[i][0] + " " + baseDataRangeValues.LastName[i][0],
        phone: otherDataRangeValues.Number[i][0].toString(),
        school: baseDataRangeValues.School1[i][0] + "; " + baseDataRangeValues.School2[i][0] + "; " + otherDataRangeValues.School3[i][0],
        school_year: baseDataRangeValues.Grade1[i][0] + "; " + otherDataRangeValues.Grade[i][0],
        ticket_type: baseDataRangeValues.TicketType[i][0],
        events: {},
        standin_events: {},
        notes : [ "   " ]
      };
      var studentId = baseDataRangeValues.Barcode[i][0];
      result[studentId] = item;

      for (var workshopKey in workshopDataRangeValues) {
        var workshopFinalValue = workshopDataRangeValues[workshopKey][i][0];
        if ((workshopFinalValue === Data.preferenceValues.preAccepted) || (workshopFinalValue === Data.preferenceValues.accepted)) {
          item.events[workshopKey] = "";
          workshopEvents[workshopKey].attendees[studentId] = "";
          ++workshopEvents[workshopKey].preselected_attendees_count;
        } else if (workshopFinalValue === Data.preferenceValues.reserved) {
          item.standin_events[workshopKey] = "";
          workshopEvents[workshopKey].standin_attendees[studentId] = "";
        }
      }
      for (var speedDateKey in speedDateDataRangeValues) {
        var speedDateFinalValue = speedDateDataRangeValues[speedDateKey][i][0];
        if ((speedDateFinalValue === Data.preferenceValues.preAccepted) || (speedDateFinalValue === Data.preferenceValues.accepted)) {
          item.events[speedDateKey] = "";
          speedDateEvents[speedDateKey].attendees[studentId] = "";
          ++speedDateEvents[speedDateKey].preselected_attendees_count;
        } else if (speedDateFinalValue === Data.preferenceValues.reserved) {
          item.standin_events[speedDateKey] = "";
          speedDateEvents[speedDateKey].standin_attendees[studentId] = "";
        }
      }
    }

    return result;
  };
})();
