var Data = {};

(function () {

  Data.isDebugMode = true; //TODO

  Data.sheetNames = {
    import: "Import",
    students: "Študenti",
    listOfValues: "List of Values",
    workshops: "Workshop-y",
    speedDates: "Speed date-y",
    events: "Event-y"
  };

  Data.tableHeaderNames = {
    import: {
      base: {
        Id: "Order #",
        FirstName: "First Name",
        LastName: "Last Name",
        Email: "Email",
        OrderDate: "Order Date",
        OrderType: "Order Type",
        Barcode: "Barcode #",
        TicketType: "Ticket Type",
        School1: "Kde studuješ?",
        School2: "název školy a fakulty",
        Grade1: "Ročník studia"
      },
      preference: {
        workshop: "Máš zájem přihlásit se na workshopy?",
        speedDate: "Máš zájem přihlásit se na speed dating - 10 minutový rozhovor s TOP manažerem?"
      },
      speedDateNote: {
        SD01: "Napiš nám svou motivaci k setkání s Michalem Štenclem",
        SD02: "Napiš nám svou motivaci k setkání s Palem Lukov",
        SD03: "Napiš nám svou motivaci k setkání s Petrem Hofmanem",
        SD04: "Napiš nám svou motivaci k setkání s Vladimírem Matoušem"
      }
    },
    students: {
      base: [
        "Id", "FirstName", "LastName", "Email", "OrderDate", "OrderType", "Barcode", "TicketType", "School1", "School2", "Grade1"
      ],
      other: [
        "Number", "Rating", "Grade", "School3"
      ]
    },
    workshops: {
      base: [
        "Id", "TimePeriod", "Name1", "Name2", "Aliases", "StartTime", "EndTime", "Room", "Type", "MinCapacity", "Capacity"
      ]
    },
    speedDates: {
      base: [
        "Id", "Name1", "Name2", "Aliases", "StartTime", "EndTime", "Room", "Type", "Capacity"
      ]
    },
    events: {
      base: [
        "Id", "Name", "StartTime", "EndTime", "Room", "Type"
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
    no: "Ne, děkuji.",
    no1: "vybrat později",
    no2: "Ne děkuji.",
    any: "Ano, přihlaste mě na workshopy, kde nejlépe splňuji kritéria.",
    any1: "Přihlaste mě na workshopy, kde nejlépe splňuji kritéria."
  };

  Data.speedDateAlias = {
    no: "Ne děkuji.",
    no1: "Ne, děkuji."
  };

  Data.preferenceValues = {
    rejected: 0,
    reserved: 0.5,
    accepted: 1,
    preAccepted: "P",
    preRejected: "Z"
  };

  Data.initialWorkshopsGradeRow = 2;
  Data.maxWorkshopsSkillId = 18;
  Data.defaultSpeedDateMinCapacity = "2";

  Data.reserveToCapacityCoeficient = 0.5;

  Data.overwriteEnabled = true;
})();
