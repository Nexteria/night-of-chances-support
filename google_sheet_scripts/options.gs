var options = {
  isDebugMode: true,
  importTables: [{
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
      'Tel. Cislo': 'Number',
      'Akú školu navštevuješ?': 'SchoolImport1',
      'Doplň akú': 'SchoolImport2',
      'V akom si ročníku?': 'GradeOrig',
      'a': 'School',
      'b': 'Grade',
    },
    workshopPreferenceValues: {
      acceptAll: ['Áno, vyberte ma na workshopy, na ktoré najlepšie spĺňam kritériá. (odporúčaná možnosť - najvyššia šanca účasti na workshope)'],
      rejectAll: ['Nie, nemám záujem o účasť na workshopoch.'],
      ignorable: ['Áno, chcem si dodatočne vybrať workshopy (dotazník na výber workshopov ti zašleme dodatočne)', 'Áno, mám záujem o účasť na workshopoch (dotazník na výber workshopov ti zašleme dodatočne - po spustení prihlasovania)'],
    },
    speedDatePreferenceValues: {
      acceptAll: [],
      rejectAll: ['Nie, nemám záujem'],
      ignorable: ['Áno (dotazník na výber workshopov a speedatingu ti zašleme dodatočne)'],
    },
    multiValueDelimiter: ' | ',
    mergeHeaderName: 'OrderId',
    beforeMergeMutator: function (importTable) {
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
        switch (rowObject.GradeOrig) {
          case 1:
          case '1':
            rowObject.Grade = '1 Bc';
            break;
          case 2:
          case '2':
            rowObject.Grade = '2 Bc';
            break;
          case 3:
          case '3':
            rowObject.Grade = '3+ Bc';
            break;
          case 4:
          case '4':
            rowObject.Grade = '1 Ing';
            break;
          case 5:
          case '5':
            rowObject.Grade = '2+ Ing';
            break;
          case 'čerstvý absolvent':
            rowObject.Grade = 'Abs';
            break;
          default:
            rowObject.Grade = '';
            break;
        }

        // TODO: Fix

        rowObject.School = !(rowObject.SchoolImport1)
          ? rowObject.SchoolImport2
          : rowObject.SchoolImport1;

        rowObject.Email = rowObject.Email.toLowerCase();

        importTable.setRow(row, rowObject);
      });
    },
  }, {
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
      'Submission ID': 'SubmissionID',
    },
    workshopPreferenceValues: {
      acceptAll: ['WS_ANY'],
      rejectAll: [],
      ignorable: ['WS_TB'],
    },
    speedDatePreferenceValues: {
      acceptAll: [],
      rejectAll: [],
      ignorable: [],
    },
    multiValueDelimiter: ',',
    mergeHeaderName: 'Email',
    beforeMergeMutator: function (importTable) {
      importTable.getRows().forEach(function (rowObject, row) {
        rowObject.Email = rowObject.Email.toLowerCase();
        rowObject.SDMotivation = rowObject.SDMotivation.replace(/\n/g, ' ');
        rowObject.Comment = rowObject.Comment.replace(/\n/g, ' ');
        importTable.setRow(row, rowObject);
      });
    },
  }, {
    name: 'importScreenTable',
    headerRangeName: 'Import_Screen_Headers',
    headerNamesMap: {
      'Email': 'Email',
      'CV SUMAR': 'CVSumar',
      'Rating': 'Rating',
      'Ročník': 'GradeScreen',
      'IT odbory': 'SK01',
      'Telekomunikácie': 'SK02',
      'Matfyz': 'SK03',
      'Biznis IT managment': 'SK04',
      'NJ': 'SK05',
      'AJ': 'SK06',
      'Android': 'SK07',
      'iOS': 'SK08',
      'Linux': 'SK09',
      'TCP/IP': 'SK10',
      'Python': 'SK11',
      'Perl/PHP': 'SK12',
      'JS/JavaScript': 'SK13',
      'C#': 'SK14',
      'C/C++': 'SK15',
      'Java': 'SK16',
      'Cisco': 'SK17',
      'SQL': 'SK18',
      'HTML/CSS': 'SK19',
      'SWIFT': 'SK20',
      'Docker': 'SK21',
      'Agile': 'SK22',
      'JIRA': 'SK23',
      'Big Data': 'SK24',
      'Umela inteligenicia': 'SK25',
      'Oracle': 'SK26',
      'Testing': 'SK27',
      'Databaze': 'SK28',
      'Git/GIT Hub': 'SK29',
      'Poznamka': 'CommentScreen',
    },
    mergeHeaderName: 'Email',
    beforeMergeMutator: function (importTable) {
      importTable.getRows().forEach(function (rowObject, row) {
        rowObject.Rating = rowObject.Rating.trim();
        switch (rowObject.Rating) {
          case 'B-/C':
            rowObject.Rating = 'C+';
            break;
          case 'C/D':
            rowObject.Rating = 'C-';
            break;
          case 'A+/nezareditelny':
            rowObject.Rating = 'A+';
            break;
          case 'A+/nezaraditelny':
            rowObject.Rating = 'A+';
            break;
          case 'A/nezaraditelny':
            rowObject.Rating = 'A';
            break;
          case 'B/nezaraditelny':
            rowObject.Rating = 'B';
            break;
          case 'C/nezaraditelny':
            rowObject.Rating = 'C';
            break;
          case 'D/nezaraditelny':
            rowObject.Rating = 'D';
            break;
        }

        const booleanSkills = ['SK01', 'SK02', 'SK03', 'SK04'];
        booleanSkills.forEach(function (skillName) {
          rowObject[skillName] = (rowObject[skillName] === 'ano') ? '1' : '';
        });

        const numericSkills = [
          'SK05', 'SK06', 'SK07', 'SK08', 'SK09',
          'SK10', 'SK11', 'SK12', 'SK13', 'SK14',
          'SK15', 'SK16', 'SK17', 'SK18', 'SK19',
          'SK20', 'SK21', 'SK22', 'SK23', 'SK24',
          'SK25', 'SK26', 'SK27', 'SK28', 'SK29'
        ];
        numericSkills.forEach(function (skillName) {
          switch (rowObject[skillName]) {
            case 'expert':
              rowObject[skillName] = '3';
              break;
            case 'pokrociky':
              rowObject[skillName] = '2';
              break;
            case 'pokrocily':
              rowObject[skillName] = '2';
              break;
            case 'pokrocily (5)':
              rowObject[skillName] = '2';
              break;
            case 'pokrocily (server)':
              rowObject[skillName] = '2';
              break;
            case 'scrum-zacatecnik':
              rowObject[skillName] = '1';
              break;
            case 'zacatecik':
              rowObject[skillName] = '1';
              break;
            case 'zacatecnik':
              rowObject[skillName] = '1';
              break;
            case 'zacatenik':
              rowObject[skillName] = '1';
              break;
          }
        });

        importTable.setRow(row, rowObject);
      });
    },
  }],
  aliasTable: {
    headerNames: ['Id', 'Name'],
  },
  studentTable: {
    headerNames: [
      'FirstName', 'LastName', 'OrderId', 'Barcode', 'Email', 'OrderDate', 'TicketType', 'OrderType',
      'SubmissionDate', 'CVLink', 'CVSumar', 'SDMotivation', 'CommentScreen', 'Comment', 'IPAddress',
      'Number', 'Rating', 'SchoolImport1', 'SchoolImport1', 'School', 'GradeOrig', 'GradeScreen', 'Grade'
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
    finalAssignValues: {
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
