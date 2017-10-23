function testExport() {
  runExportAction();
}

var runExportAction = (function () {
  return function () {
    // Initialize constants.
    const autoAssignHeaderName = options.studentTable.assignHeaderNames.auto;
    const autoAssignValues = options.studentTable.autoAssignValues;

    // Load data tables.
    const workshopsTable = new Table('Workshop_Headers');
    const speedDatesTable = new Table('SpeedDate_Headers');
    const eventsTable = new Table('Event_Headers');

    // Define callback for creating
    function createEvent(rowObject) {
      const event = {
        start_time: $.Date.toTimestamp(rowObject.StartTime),
        end_time: $.Date.toTimestamp(rowObject.EndTime),
        min_capacity: rowObject.CapacityMin,
        max_capacity: rowObject.CapacityMax,
        name: rowObject.Name,
        room: rowObject.Room,
        preselected_attendees_count: 0,
        type : rowObject.Type,
      };
      event.standin_attendees = {};
      event.attendees = {};

      return event;
    }

    // Initialize events object.
    const events = {};

    // Load workshop events.
    workshopsTable.getRows().forEach(function (rowObject) {
      events[rowObject.Id] = createEvent($.Object.merge(rowObject, {
        Name: rowObject.Name1 + ' ' + rowObject.Name2,
      }));
    });

    // Load speed date events.
    speedDatesTable.getRows().forEach(function (rowObject) {
      events[rowObject.Id] = createEvent($.Object.merge(rowObject, {
        Name: rowObject.Name1 + ' ' + rowObject.Name2,
      }));
    });

    // Load other events.
    eventsTable.getRows().forEach(function (rowObject) {
      events[rowObject.Id] = createEvent(rowObject);
    });

    // Create student table with excluded unecassary student headers.
    const studentsTable = new Table('Student_Headers', {
      includeOnlyFromHeaders: [
        'Barcode', 'OrderDate', 'Email', 'FirstName', 'LastName',
        'Number', 'School', 'Grade', 'TicketType', 'InviteToNLA'
      ].concat(Object.keys(events).map(function (eventId) {
        return eventId + autoAssignHeaderName;
      })),
    });

    // Check if any student exists.
    if (studentsTable.countRows() === 0) {
      throw $.Error.create('Neboli nájdené žiadne študentské záznamy', true);
    }

    // Load attendees.
    const attendees = {};
    var unknownStudentCounter = 0;
    studentsTable.getRows().forEach(function (rowObject) {
      // Preprocess records.
      var id = rowObject.Barcode;
      if (!id) {
        ++unknownStudentCounter;
        id = 'Stud' + unknownStudentCounter.toString();
      }

      // Create attendee object.
      const attendee = {
        checked_in: '',
        email: rowObject.Email,
        name: rowObject.FirstName + ' ' + rowObject.LastName,
        phone: rowObject.Number.toString(),
        school: rowObject.School,
        school_year: rowObject.Grade,
        ticket_type: rowObject.TicketType,
        notes : [(rowObject.InviteToNLA === 1) ? 'OBALKA NLA NABOR' : ''],
      };
      attendee.events = {};
      attendee.standin_events = {};

      // Set event cross referecing.
      Object.keys(events).forEach(function (eventId) {
        switch (rowObject[eventId + autoAssignHeaderName]) {
          case autoAssignValues.preAccepted:
            attendee.events[eventId] = '';
            events[eventId].attendees[id] = '';
            ++events[eventId].preselected_attendees_count;
            break;
          case autoAssignValues.reserved:
            attendee.standin_events[eventId] = '';
            events[eventId].standin_attendees[id] = '';
            break;
        }
      });

      attendees[id] = attendee;
    });

    // Create export object.
    const jsonOutput = JSON.stringify({
      attendees: attendees,
      events: events,
    }, null, 2).replace(/[\u007f-\uffff]/g, function (c) {
      return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4);
    });

    // Display output.
    var htmlString = '<p>Nasleduje výstup:</p>'
    + '<textarea style="display: block; resize: none; height: 460px; width: 940px; margin: 0 auto;'
    + ' background: #FFFFE0; padding: 5px;" readonly="readonly">' + jsonOutput + '</textarea>';
    var htmlOutput = HtmlService.createHtmlOutput(htmlString)
    .setWidth(1000).setHeight(600);

    SpreadsheetApp.getUi().showModalDialog(htmlOutput, "Operácia uspela");
  };
}());
