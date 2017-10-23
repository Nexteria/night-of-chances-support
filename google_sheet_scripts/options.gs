var options = {
  isDebugMode: true,
  importTables: [
    {
      name: 'importPrefTable',
      headerRangeName: 'Import_Pref_Headers',
      headerNamesMap: {
        'Submission Date': 'SubmissionDate',
        'Email': 'Email',
        'Na ktoré workshopy sa chceš prihlásit?': 'WorkshopPreferences',
        'Máš záujem o speed dating?': 'SpeedDatePreferences',
        'Motivačný text k speed datingu': 'SDMotivation',
        'Tvoje CV': 'CVLink',
        'Priestor na tvoj komentár': 'Comment',
        'IP': 'IPAddress',
      },
      workshopPreferenceValues: {
        acceptAll: ['zaraďte ma na workshopy, kde najlepšie spĺňam kritériá'],
        rejectAll: [],
        ignorable: [' ESET - workshop', 'ESET - workshop'],
      },
      speedDatePreferenceValues: {
        acceptAll: [],
        rejectAll: [],
        ignorable: [],
      },
      multiValueDelimiter: '\n',
      mergeHeaderName: 'Email',
      beforeMergeMutator: function (importTable) {
        importTable.getRows().forEach(function (rowObject, row) {
          rowObject.Email = rowObject.Email.toLowerCase();
          rowObject.SDMotivation = rowObject.Comment.replace(/\n/g, ' ');
          rowObject.Comment = rowObject.Comment.replace(/\n/g, ' ');
          importTable.setRow(row, rowObject);
        });
      },
    }, {
      name: 'importRegTable',
      headerRangeName: 'Import_Reg_Headers',
      headerNamesMap: {
        'Order #': 'OrderId',
        'Order Date': 'OrderDate',
        'First Name': 'FirstName',
        'Last Name': 'LastName',
        'Email': 'Email',
        'Ticket Type': 'TicketType',
        'Barcode #': 'Barcode',
        'Order Type': 'OrderType',
        'Máš záujem o workshopy? (pre preradenie je nutné zaslať CV)': 'WorkshopPreferences',
        'Máš záujem o speed dating? (pre priradenie je nutné zaslať CV)': 'SpeedDatePreferences',
        'Akú školu navštevuješ?': 'SchoolImport1',
        'Doplň akú': 'SchoolImport2',
        'V akom si ročníku?': 'Grade',
      },
      workshopPreferenceValues: {
        acceptAll: [],
        rejectAll: ['nie'],
        ignorable: ['Áno'],
      },
      speedDatePreferenceValues: {
        acceptAll: [],
        rejectAll: ['nie'],
        ignorable: ['Áno'],
      },
      multiValueDelimiter: ' | ',
      mergeHeaderName: 'OrderId',
      beforeMergeMutator: function (importTable) {
        importTable.addHeader('School');

        importTable.getRows().forEach(function (rowObject, row) {
          const dateTimeArr = rowObject.OrderDate.split(' ').map(function (dateTimePart) {
            return dateTimePart.split('.').map(function (value) {
              return parseInt(value, 10);
            });
          });
          rowObject.OrderDate = new Date(
            dateTimeArr[0][2], dateTimeArr[0][1] - 1, dateTimeArr[0][0],
            dateTimeArr[1][0], dateTimeArr[1][1], dateTimeArr[1][2], 0);

          if (rowObject.TicketType === 'Stanky') {
            rowObject.Grade = '';
          }
          switch (rowObject.Grade) {
            case '1. Bc':
              rowObject.Grade = '1 Bc';
              break;
            case '2. Bc':
              rowObject.Grade = '2 Bc';
              break;
            case '3. Bc':
              rowObject.Grade = '3+ Bc';
              break;
            case '3. Bc | ِAbsolvent':
              rowObject.Grade = '3+ Bc';
              break;
            case '4. Mgr / Ing':
              rowObject.Grade = '1 Ing';
              break;
            case '5. Mgr / Ing':
              rowObject.Grade = '2+ Ing';
              break;
            case 'Absolvent':
              rowObject.Grade = 'Abs';
              break;
            default:
              rowObject.Grade = '';
              break;
          }

          // TODO: Fix

          rowObject.School = (rowObject.SchoolImport1 === 'Iné')
          ? rowObject.SchoolImport2 : rowObject.SchoolImport1;

          rowObject.Email = rowObject.Email.toLowerCase();

          importTable.setRow(row, rowObject);
        });
      },
    },
  ],
  aliasTable: {
    headerNames: ['Id', 'Name'],
  },
  studentTable: {
    headerNames: [
      'FirstName', 'LastName', 'OrderId', 'Barcode', 'Email', 'OrderDate', 'TicketType', 'OrderType',
      'SubmissionDate', 'CVLink', 'SDMotivation', 'Comment', 'IPAddress', 'Number', 'Rating',
      'School', 'Grade'
    ],
    assignHeaderNames: {
      stud: 'Štud',
      client: 'Klient',
      score: 'Skóre',
      auto: 'Auto',
      final: 'Final',
      real: 'Real',
    },
    studAssignValues: {
      rejected: 0,
      available: 0.5,
      interested: 1,
      agnostic: '',
    },
    autoAssignValues: {
      rejected: 0,
      reserved: 0.5,
      accepted: 1,
      preAccepted: 'P',
      preRejected: 'Z',
      agnostic: '',
    },
    autoReservedAssignmentCapacityCoeficient: 0.5,
  },
  workshopTable: {
    headerNames: [
      'Id', 'Name1', 'Name2', 'StartTime', 'EndTime', 'Room', 'Type', 'CapacityMin', 'CapacityMax'
    ],
  },
  speedDateTable: {
    headerNames: [
      'Id', 'Name1', 'Name2', 'StartTime', 'EndTime', 'Room', 'Type', 'CapacityMin', 'CapacityMax'
    ],
  },
  eventTable: {
    headerNames: [
      'Id', 'Name', 'StartTime', 'EndTime', 'Room', 'Type', 'CapacityMin', 'CapacityMax'
    ],
  },
  skillTable: {
    headerNames: ['Id', 'Name1', 'Name2'],
  },
  automationTable: {
    headerNames: ['Priority', 'SkillReqs', 'StudPrefs', 'ClientPrefs'],
  },
  ratingTable: {
    headerNames: ['Name', 'Value'],
  },
  gradeTable: {
    headerNames: ['Name', 'Id'],
  },
};
