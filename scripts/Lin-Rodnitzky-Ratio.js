// Copyright 2015 - Optmyzr Inc.
// All rights reserved
// For an Enhanced Script version of this script which works at the MCC level and is easier to modify, visit www.optmyzr.com


function main() {
  
  var SETTINGS = new Object();
  
  // --- CHANGE THESE SETTINGS
  SETTINGS.dateRange = "LAST_MONTH";
  // --- DONT CHANGE ANYTHING AFTER THIS
  
  var currentSetting = new Object();
  currentSetting.reportType = "SEARCH_QUERY_PERFORMANCE_REPORT";
  currentSetting.metricsColumns = ['Impressions',
                                   'Clicks', 
                                   'ConvertedClicks', 
                                   'Cost',
                                   'KeywordTextMatchingQuery'
                                  ];
  currentSetting.whereConditions = ['WHERE',
                                    'ConvertedClicks', '>=', '0'];
  
  var columnsUsedArray = currentSetting.metricsColumns;
  var whereClause = currentSetting.whereConditions.join(" ");
  var columnsStr = currentSetting.metricsColumns.join(',');
  
  var reportDate = new Date();
  var dateForFilename = reportDate.yyyymmdd();
  var spreadsheetName = currentSetting.reportType + " (" + SETTINGS.dateRange + ") " + " created " + dateForFilename;
  var overwrite = 1;
  currentSetting.spreadsheetUrl = "NEW";
  currentSetting.spreadsheetTab = "";
  //var sheet = prepareSpreadsheet(spreadsheetName, currentSetting.spreadsheetUrl, currentSetting.spreadsheetTab, currentSetting.accountManagers, overwrite);
  
  // Pull the report with the options defined for all non-deleted campaigns
  var query = 'SELECT ' + columnsStr + ' ' +
    'FROM  ' + currentSetting.reportType + ' ' +
      whereClause + ' ' +
        'DURING ' + SETTINGS.dateRange;
  //Logger.log("query: " + query);
  var report = AdWordsApp.report(query);
  var rows = report.rows();
  var numRowsToWritePerCycle = 100;
  //writeReportToGoogleSheet(report, sheet, columnsUsedArray, overwrite, numRowsToWritePerCycle);
  
  
  
  SETTINGS.statsForConvertingQueries = new Object();
  SETTINGS.statsForAll = new Object();
  
  var numConvertingQueries = 0;
  SETTINGS.statsForAll.clicks = 0;
  SETTINGS.statsForAll.impressions = 0;
  SETTINGS.statsForAll.cost = 0;
  SETTINGS.statsForAll.convertedClicks = 0;
  
  SETTINGS.statsForConvertingQueries.clicks = 0;
  SETTINGS.statsForConvertingQueries.impressions = 0;
  SETTINGS.statsForConvertingQueries.cost = 0;
  SETTINGS.statsForConvertingQueries.convertedClicks = 0;
  
  
  while(rows.hasNext()) {
    var row = rows.next();
    var clicks = parseInt(row['Clicks']);
    //Logger.log("clicks: " + clicks);
    var convertedClicks = parseInt(row['ConvertedClicks']);
    var impressions = parseInt(row['Impressions']);
    var cost = parseFloat(row['Cost']);
    var keyword = row['KeywordTextMatchingQuery'];
    //Logger.log(keyword);
    
        
   
      
    if(!keyword.indexOf("\=") != -1) {
      if(convertedClicks > 0) {  
        SETTINGS.statsForConvertingQueries.clicks += clicks;
        SETTINGS.statsForConvertingQueries.impressions += impressions;
        SETTINGS.statsForConvertingQueries.cost += cost;
        SETTINGS.statsForConvertingQueries.convertedClicks += convertedClicks;
        numConvertingQueries++;
      } 
      SETTINGS.statsForAll.clicks += clicks;
      SETTINGS.statsForAll.impressions += impressions;
      SETTINGS.statsForAll.cost += cost;
      SETTINGS.statsForAll.convertedClicks += convertedClicks;  
    }
  }
  
  //Logger.log("numConvertingQueries: " + numConvertingQueries);
  //Logger.log("SETTINGS.statsForAll.clicks: " + SETTINGS.statsForAll.clicks);
  //Logger.log("SETTINGS.statsForConvertingQueries.clicks: " + SETTINGS.statsForConvertingQueries.clicks);
  
  var costPerConvertedClickForAll = SETTINGS.statsForAll.cost / SETTINGS.statsForAll.convertedClicks;
  var costPerConvertedClickForConvertingQueries = SETTINGS.statsForConvertingQueries.cost / SETTINGS.statsForConvertingQueries.convertedClicks;
  var lrRatio = costPerConvertedClickForAll / costPerConvertedClickForConvertingQueries;
  Logger.log("LR Ratio for Account '" + AdWordsApp.currentAccount().getName() + "': " + lrRatio.toFixed(2));
  //Logger.log("costPerConvertedClickForAll: " + costPerConvertedClickForAll);
  //Logger.log("costPerConvertedClickForConvertingQueries: " + costPerConvertedClickForConvertingQueries);
  
  
  
  
  
} 

// FUNCTION: writeReportToGoogleSheet
  function writeReportToGoogleSheet(report, sheet, columnsUsedArray, overwrite, numRowsToWritePerCycle) {
    var rowCounter = 0;
    var dataToWrite = new Array();
    var dataAdded = 0;
   
    // Write Header
    if(overwrite) {
      var toWrite = new Array();
      toWrite.push(columnsUsedArray);
      var range = sheet.getRange(1, 1, toWrite.length, toWrite[0].length);
      range.setValues(toWrite);
    }
    
    // Write Data
    var reportIterator = report.rows();
    while(reportIterator.hasNext()){
      var row = reportIterator.next();
      var rowArray = new Array();
      //Logger.log("row.length: " + row.length);
      for(var i = 0; i < columnsUsedArray.length; i++){
        var key = columnsUsedArray[i];
        var data = row[key];
        //Logger.log("data: " + data);
        rowArray.push(data);
      }
      dataToWrite.push(rowArray);
      rowCounter++;
      
      if(rowCounter % numRowsToWritePerCycle == 0 || !reportIterator.hasNext()) {
        dataAdded = 1;
        Logger.log("write to sheet");
        if(!overwrite || dataAdded) {
          var startRow = sheet.getLastRow();
          var startColumn = 0; //sheet.getLastColumn();
        } else {
          var startRow = 1; // accounts for 1 row of headers
          var startColumn = 0;
        }
        var maxRows = sheet.getMaxRows();
        var maxColumns = sheet.getMaxColumns();
        Logger.log("startRow: " + startRow + " startColumn: " + startColumn + " dataToWrite.length: " + dataToWrite.length + " dataToWrite[0].length: " + dataToWrite[0].length);
        var range = sheet.getRange(startRow+1, startColumn+1, dataToWrite.length, dataToWrite[0].length);
        range.setValues(dataToWrite);
        dataToWrite = new Array();
      }
      
    } 
  }

// FUNCTION: prepareSpreadsheet
  function prepareSpreadsheet(spreadsheetName, spreadsheetUrl, spreadsheetTabName, accountManagers, overwrite)
  {
    // Error Checks
    if(spreadsheetUrl.toLowerCase().indexOf("new") == -1 && !spreadsheetTabName) {
      Logger.log("When using an existing spreadsheet for a report, you must also specify the name of the tab that will get the new data. We're starting a new spreadsheet for this report.");
      spreadsheetUrl = "new";
    }
    
    // Create the new spreadsheet
    Logger.log("spreadsheetTabName: " + spreadsheetTabName);
    Logger.log("currentSetting.spreadsheetUrl: " + spreadsheetUrl);
    var newSpreadsheetCreated = 0;
    if(spreadsheetUrl.toLowerCase().indexOf("new") != -1)
    {
      var spreadsheet = SpreadsheetApp.create(spreadsheetName);
      var spreadsheetUrl = spreadsheet.getUrl();
     
      //get all sheets except first and delete them and insert new sheets every time to avoid name error
      var allSheets = spreadsheet.getSheets();
      for(var i=1,len=allSheets.length;i<len;i++){
        spreadsheet.deleteSheet(allSheets[i]);
      }
      
      newSpreadsheetCreated = 1;
    } 
    var spreadsheet = SpreadsheetApp.openByUrl(spreadsheetUrl);
    
    // Add Editors
    /*
    if(currentSetting.accountManagers && currentSetting.accountManagers!=""){
      currentSetting.accountManagersArray = currentSetting.accountManagers.replace(/\s/g, "").split(",");
      spreadsheet.addEditors(currentSetting.accountManagersArray);
    }
    */
    // Add and select the tab
    if(spreadsheetTabName) {
      if(newSpreadsheetCreated) {
        spreadsheet.insertSheet(spreadsheetTabName);
      } 
      var sheet = spreadsheet.getSheetByName(spreadsheetTabName);
    } else {
      var sheet = spreadsheet.getActiveSheet();
    }
    
    if(overwrite) {
      sheet.clear().clearFormats().clearNotes();
    }
    
    // return the selected sheet
    return(sheet);
  
  }

Date.prototype.yyyymmdd = function() {
  var yyyy = this.getFullYear().toString();
  var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
  var dd  = this.getDate().toString();
  return yyyy + (mm[1]?mm:"0"+mm[0]) + (dd[1]?dd:"0"+dd[0]); // padding
};                     