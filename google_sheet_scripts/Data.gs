var Data = {};

(function () {

  Data.isDebugMode = true; //TODO

  Data.sheetNames = {
    import: "Import",
    students: "Študenti",
    listOfValues: "List of Values",
    workshops: "Workshop-y",
    speedDates: "Speed date-y"
  };

  Data.tableHeaderNames = {
    import: {
      base: {
        Id: "Order #",
        FirstName: "First Name",
        LastName: "Last Name",
        Email: "Email",
        OrderType: "Order Type"
      },
      preference: {
        workshop: "Máš záujem prihlásiť sa na workshopy?",
        speedDate: "Máš záujem prihlásiť sa na speed dating - 10 minútový rozhovor s TOP manažérom?"
      },
      speedDateNote: {
        SD01: "Napíš nám svoju motiváciu k stretnutiu s Tomášom Volekom",
        SD02: "Napíš nám svoju motiváciu k stretnutiu s Marošom Cuchtom",
        SD03: "Napíš nám svoju motiváciu k stretnutiu s Michalom Štenclom",
        SD04: "Napíš nám svoju motiváciu k stretnutiu s Vladimírom Matoušom.",
        SD05: "Napíš nám svoju motiváciu k stretnutiu s Pavlom Lukom"
      }
    },
    students: {
      base: [
        "Id", "FirstName", "LastName", "Email", "OrderType"
      ],
      other: [
        "Rating", "Grade"
      ]
    },
    workshops: {
      base: [
        "Id", "TimePeriod", "Name1", "Name2", "Aliases", "Capacity"
      ]
    },
    speedDates: {
      base: [
        "Id", "Name1", "Name2", "Aliases", "Capacity"
      ]
    },
    ratings: {
      Name: "Názov",
      Value: "Hodnota"
    },
    grades: {
      Id: "ID",
      Name: "Názov"
    },
    alg: {
      Priority: "Priorita",
      MinSkill: "Spĺňa požiadavky",
      Stud: "Štud",
      Stake: "Firma/Osob"
    }
  };

  Data.workshopAlias = {
    no: "Nie, ďakujem.",
    any: "Áno, prihláste ma na workshopy kde najlepšie spĺňam kritéria."
  };

  Data.speedDateAlias = {
    no: "Nie ďakujem."
  };

  Data.preferenceValues = {
    rejected: 0,
    reserved: 0.5,
    accepted: 1,
    preAccepted: "P",
    preRejected: "Z"
  };

  Data.initialWorkshopsGradeRow = 2;
  Data.maxWorkshopsSkillId = 17;

  Data.reserveToCapacityCoeficient = 0.5;
})();
