var options = {
  isDebugMode: true,
  importTables: [{
    name: 'importRegTable',
    headerRangeName: 'Import_Reg_Headers',
    headerNamesMap: {
      'Order Date': 'OrderDate',
      'First Name': 'FirstName',
      'Last Name': 'LastName',
      'Email': 'Email',
      'Ticket Type': 'TicketType',
      'Barcode #': 'Barcode',
      'V prípade záujmu o workshopy či speedating odporúčame zadanie tel. čísla (tel. číslo slúži len pre účel efektívnejšej komunikácie ohľadne výberu workshopov či speeddatingu)': 'Number',
      'Akú školu navštevuješ?': 'School',
      'V akom si ročníku?': 'Grade',
    },
    mergeHeaderName: 'Barcode',
    beforeRemoveAndRenameMutator: function (importTable) {
      importTable.getRows().forEach(function (rowObject, row) {
        if (rowObject['Akú školu navštevuješ?'] === 'iné') {
          rowObject['Akú školu navštevuješ?'] = rowObject['Akú fakultu navštevuješ?'];
        }
      });
    },
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

        switch (rowObject.Grade) {
          case '1.':
            rowObject.Grade = '1 Bc';
            break;
          case '2.':
            rowObject.Grade = '2 Bc';
            break;
          case '3.':
            rowObject.Grade = '3+ Bc';
            break;
          case '4.':
            rowObject.Grade = '1 Ing';
            break;
          case '5.':
            rowObject.Grade = '2+ Ing';
            break;
          case 'čerstvý absolvent':
            rowObject.Grade = 'Abs';
            break;
          default:
            rowObject.Grade = '';
            break;
        }

        rowObject.Email = rowObject.Email.toLowerCase();

        importTable.setRow(row, rowObject);
      });
    },
  }, {
    name: 'importPrefTable',
    headerRangeName: 'Import_Pref_Headers',
    headerNamesMap: {
      'Email': 'Email',
      'Workshop Ids': 'WorkshopPreferences',
      'Speed date Ids': 'SpeedDatePreferences',
      'Aká je tvoja motivácia pre stretnutie so speed daterom?': 'SDMotivation',
      'Tvoje CV': 'CVLink',
      'Telefon': 'NumberScreen',
      'Speed dating': 'SpeedDateSumar',
      'CV summary': 'CVSumar',
      'Rating': 'Rating',
      'NLA': 'InviteToNLA',
      'Skola': 'SchoolScreen',
      'Rocnik': 'GradeScreen',
      'Anglictina': 'SK01',
      'Nemcina': 'SK02',
      'CAD': 'SK03',
      'CAM': 'SK04',
      'CATIA': 'SK05',
      'Delphi': 'SK06',
      'DSS  Solid': 'SK07',
      'PowerMill': 'SK08',
      'PowerShape': 'SK09',
      'MS Project': 'SK10',
      'Matlab': 'SK11',
      'EdgeCam / Partmodeler': 'SK12',
      'Simuling': 'SK13',
      'Automatizace': 'SK14',
      'C/C++': 'SK15',
      'Python': 'SK16',
      'Adams': 'SK17',
      'SAP': 'SK18',
      'PHP': 'SK19',
      'Technicke kresleni / tvorba / dokumentace': 'SK20',
      'PLC Siemens': 'SK21',
      'CNC Stroje': 'SK22',
      'Mat.Wolfram': 'SK23',
      'Autodesk Revit': 'SK24',
    },
    workshopPreferenceValues: {
      acceptAll: ['WS_YF', 'WS_FRE', 'WS_PO'],
      rejectAll: [],
      ignorable: [],
    },
    speedDatePreferenceValues: {
      acceptAll: ['SD_ANY'],
      rejectAll: [],
      ignorable: [],
    },
    multiValueDelimiter: ',',
    mergeHeaderName: 'Email',
    beforeMergeMutator: function (importTable) {
      importTable.getRows().forEach(function (rowObject, row) {
        rowObject.Email = rowObject.Email.toLowerCase();
        rowObject.SDMotivation = rowObject.SDMotivation.replace(/\n/g, ' ');
        rowObject.SpeedDateSumar = rowObject.SpeedDateSumar.replace(/\n/g, ' ');
        rowObject.CVSumar = rowObject.CVSumar.replace(/\n/g, ' ');

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
          case 'nezaraditelny':
            rowObject.Rating = '';
            break;
        }

        rowObject.InviteToNLA = (rowObject.InviteToNLA === 'ano')
          ? 1
          : 0;

        const numericSkills = [
          'SK01', 'SK02', 'SK03', 'SK04', 'SK05',
          'SK06', 'SK07', 'SK08', 'SK09', 'SK10',
          'SK11', 'SK12', 'SK13', 'SK14', 'SK15',
          'SK15', 'SK16', 'SK17', 'SK18', 'SK19',
          'SK20', 'SK21', 'SK22', 'SK23', 'SK24',
        ];
        numericSkills.forEach(function (skillName) {
          switch (rowObject[skillName]) {
            case 'expert':
              rowObject[skillName] = '3';
              break;
            case 'pokrocily':
              rowObject[skillName] = '2';
              break;
            case 'zacatecnik':
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
      'FirstName', 'LastName', 'Barcode', 'Email', 'OrderDate', 'TicketType',
      'CVLink', 'SDMotivation', 'CommentScreen', 'Number', 'NumberScreen',
      'Rating', 'CVSumar', 'SpeedDateSumar', 'School', 'SchoolScreen',
      'Grade', 'GradeScreen', 'InviteToNLA',
    ],
    assignHeaderNames: {
      stud: 'Štud',
      score: 'Skóre',
      final: 'Final',
      real: 'Real',
    },
    studAssignValues: {
      rejected: 0,
      available: 0.5,
      interested: 1,
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
  },
  workshopTable: {
    headerNames: [
      'Id', 'Name1', 'Name2', 'StartTime', 'EndTime', 'Buddy', 'Room', 'Type', 'CapacityMin', 'CapacityMax'
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
