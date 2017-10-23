function menuItemImportNewStudents_() {
  try {
    runImportAction();
  } catch (err) {
    $.Error.log(err);
  }
}

function menutItemExportForApp_() {
  try {
    runExportAction();
  } catch (err) {
    $.Error.log(err);
  }
}

function onOpen() {
  // Add menu items for custom functions.
  var spreadsheet = SpreadsheetApp.getActive();
  if (spreadsheet !== null) {
    spreadsheet.addMenu('Night of Chances - Automatizácia', [
      // Add import new students menu item.
      { name: 'Importovať nových študentov', functionName: 'menuItemImportNewStudents_' },
      /*
      // Add assign students menu item.
      { name: 'Priradiť študentov na workshop-y a speed date-y', functionName: 'menutItemAssignStudents_' },
      */
      // Add export data menu item.
      { name: 'Exportovať dáta pre registračnú apku', functionName: 'menutItemExportForApp_' },
    ]);
  }
}
