// Copyright 2015 - Optmyzr Inc.
// All rights reserved
// For an Enhanced Script version of this script which works at the MCC level and is easier to modify, visit www.optmyzr.com


function main() {
  
  var SETTINGS = new Object();
  
  // --- CHANGE THESE SETTINGS
  SETTINGS.dateRange = "LAST_MONTH";
  // what are the min and max number of conversions you need to be able to make reasonable bid decisions with
  // an acceptable frequency - for reference, Google targets 15 conversions per month per campaign
  SETTINGS.minConversionsBeforeSplitting = 50;
  SETTINGS.maxConversionsBeforeCombining = 5;
  // --- DONT CHANGE ANYTHING AFTER THIS
  
  var currentSetting = new Object();
  currentSetting.reportType = "PRODUCT_PARTITION_REPORT";
  currentSetting.metricsColumns = ['Impressions',
                                   'Clicks', 
                                   'ConvertedClicks', 
                                   'Cost', 
                                   'PartitionType',
                                   'ProductGroup'
                                  ];
  currentSetting.whereConditions = ['WHERE',
                                    'Impressions', '>', '0'];
  
  var columnsUsedArray = currentSetting.metricsColumns;
  var whereClause = currentSetting.whereConditions.join(" ");
  
  
  var columnsStr = currentSetting.metricsColumns.join(',');
  
  // Pull the report with the options defined for all non-deleted campaigns
  var query = 'SELECT ' + columnsStr + ' ' +
    'FROM  ' + currentSetting.reportType + ' ' +
      whereClause + ' ' +
        'DURING ' + SETTINGS.dateRange;
  //Logger.log("query: " + query);
  var report = AdWordsApp.report(query);
  var rows = report.rows();
  
  
  SETTINGS.statsForOther = new Object();
  SETTINGS.statsForDefinedGroups = new Object();
  SETTINGS.statsForOther.productGroups = new Array();
  
  SETTINGS.statsForOther.clicks = 0;
  SETTINGS.statsForOther.impressions = 0;
  SETTINGS.statsForOther.cost = 0;
  SETTINGS.statsForOther.convertedClicks = 0;
  SETTINGS.statsForOther.numProductGroups = 0;
  
  SETTINGS.statsForDefinedGroups.clicks = 0;
  SETTINGS.statsForDefinedGroups.impressions = 0;
  SETTINGS.statsForDefinedGroups.cost = 0;
  SETTINGS.statsForDefinedGroups.convertedClicks = 0;
  SETTINGS.statsForDefinedGroups.numProductGroups = 0;
  
  SETTINGS.productGroupsToSplit = new Array();
  SETTINGS.productGroupsToCombine = new Array();
  
  /*
  var productGroupSelector = AdWordsApp
     .productGroups()
     .withCondition("Impressions > 0")
     .forDateRange(SETTINGS.dateRange)
     .orderBy("ConvertedClicks DESC");

  var productGroupIterator = productGroupSelector.get();
  */
  while(rows.hasNext()) {
    var row = rows.next();
    var clicks = parseInt(row['Clicks']);
    //Logger.log("clicks: " + clicks);
    var convertedClicks = parseInt(row['ConvertedClicks']);
    var impressions = parseInt(row['Impressions']);
    var cost = parseFloat(row['Cost']);
    var partitionType = row['PartitionType'];
    var productGroupText = row['ProductGroup'];
    //Logger.log("productGroupText: " + productGroupText);
    
    if(partitionType == "Unit") {
      var hasChildren = 0;
      if(productGroupText.indexOf("= *") != -1) {
        var isOtherCase = 1;
        //Logger.log("is other case");
      } else {
        var isOtherCase = 0;
        //Logger.log("NOT is other case");
      }
    } else {
      var hasChildren = 1;
    }
    
    
    if(!hasChildren) {
      var productGroupParts = productGroupText.split("/");
      var lastKey = productGroupParts.length - 1;
      var namePart = productGroupParts[lastKey];
      var nameOnlyParts = namePart.split('"');
      var productGroupName = "everything else";
      try {
        var productGroupName = nameOnlyParts[1].replace('"','');
      } catch(err) {
      }
      //Logger.log("productGroupName: " + productGroupName);
      
      if(convertedClicks > SETTINGS.minConversionsBeforeSplitting) {
        var pgObject = new Object();
        pgObject.name = productGroupText;
        pgObject.convertedClicks = convertedClicks;
        SETTINGS.productGroupsToSplit.push(pgObject);
        //}
      } else if (convertedClicks < SETTINGS.maxConversionsBeforeCombining) {
        var pgObject = new Object();
        pgObject.name = productGroupText;
        pgObject.convertedClicks = convertedClicks;
        SETTINGS.productGroupsToCombine.push(pgObject);
      }
    
    
      if(isOtherCase) {  
        SETTINGS.statsForOther.clicks += clicks;
        SETTINGS.statsForOther.impressions += impressions;
        SETTINGS.statsForOther.cost += cost;
        SETTINGS.statsForOther.convertedClicks += convertedClicks;
        SETTINGS.statsForOther.numProductGroups++;
      } else {
        SETTINGS.statsForDefinedGroups.clicks += clicks;
        SETTINGS.statsForDefinedGroups.impressions += impressions;
        SETTINGS.statsForDefinedGroups.cost += cost;
        SETTINGS.statsForDefinedGroups.convertedClicks += convertedClicks;
        SETTINGS.statsForDefinedGroups.numProductGroups++;
      }
    }
  }
  
  var totalClicks = SETTINGS.statsForDefinedGroups.clicks + SETTINGS.statsForOther.clicks;
  var vssClicks =  SETTINGS.statsForDefinedGroups.clicks / totalClicks;
  var totalImpressions = SETTINGS.statsForDefinedGroups.impressions + SETTINGS.statsForOther.impressions;
  var vssImpressions = SETTINGS.statsForDefinedGroups.impressions / totalImpressions;
  var totalCost = SETTINGS.statsForDefinedGroups.cost + SETTINGS.statsForOther.cost;
  var percentCostFromEverythingElse = (100 * SETTINGS.statsForOther.cost / SETTINGS.statsForDefinedGroups.cost).toFixed(0);
  var vssCost = SETTINGS.statsForDefinedGroups.cost / totalCost;
  var totalConvertedClicks = SETTINGS.statsForDefinedGroups.convertedClicks + SETTINGS.statsForOther.convertedClicks;
  var vssConvertedClicks = SETTINGS.statsForDefinedGroups.convertedClicks / totalConvertedClicks;
  
  var definedCostPerConvertedClick = SETTINGS.statsForDefinedGroups.cost / SETTINGS.statsForDefinedGroups.convertedClicks;
  var otherCostPerConvertedClick = SETTINGS.statsForOther.cost / SETTINGS.statsForOther.convertedClicks;
  var totalCostPerConvertedClick = totalCost / totalConvertedClicks;
  var vssCostPerConvertedClick = otherCostPerConvertedClick / definedCostPerConvertedClick;
  
  var numProductGroupsToSplit = SETTINGS.productGroupsToSplit.length;
  var numProductGroupsToCombine = SETTINGS.productGroupsToCombine.length;
  var numLeafProductGroups = SETTINGS.statsForOther.numProductGroups + SETTINGS.statsForDefinedGroups.numProductGroups;
  var percentGroupsToSplit = (100 * numProductGroupsToSplit / numLeafProductGroups).toFixed(0);
  var percentGroupsToCombine = (100 * numProductGroupsToCombine / numLeafProductGroups).toFixed(0);
  
  Logger.log("Vallaeys Shopping Efficiency (VSE) Report");
  Logger.log("Account: " + AdWordsApp.currentAccount().getName());
  Logger.log("This data is for all product groups with at least 1 impression during " + SETTINGS.dateRange);
  Logger.log("");
  /*
  Logger.log("CLICKS:")
  Logger.log("From Defined Product Groups: " + SETTINGS.statsForDefinedGroups.clicks);
  Logger.log("From 'everything else': " + SETTINGS.statsForOther.clicks);
  //Logger.log("Total: " + totalClicks);
  Logger.log("Ratio: " + (100*vssClicks).toFixed(2) + "%");
  Logger.log("");
  Logger.log("IMPRESSIONS:")
  Logger.log("From Defined Product Groups: " + SETTINGS.statsForDefinedGroups.impressions);
  Logger.log("From 'everything else': " + SETTINGS.statsForOther.impressions);
  */
  //Logger.log("Total: " + totalImpressions);
  Logger.log("Structure Efficiency: " + (100*vssImpressions).toFixed(0) + "%");
  Logger.log("  (this is the percentage of impressions coming from defined product groups)");
  /*
  Logger.log("");
  Logger.log("COST:")
  Logger.log("From Defined Product Groups: " + SETTINGS.statsForDefinedGroups.cost.toFixed(2));
  Logger.log("From 'everything else': " + SETTINGS.statsForOther.cost.toFixed(2));
  //Logger.log("Total: " + totalCost.toFixed(2));
  Logger.log("VSS Ratio: " + (100*vssCost).toFixed(2) + "%");
  Logger.log("");
  Logger.log("CONVERTED CLICKS:")
  Logger.log("From Defined Product Groups: " + SETTINGS.statsForDefinedGroups.convertedClicks);
  Logger.log("From 'everything else': " + SETTINGS.statsForOther.convertedClicks);
  //Logger.log("Total: " + totalConvertedClicks);
  Logger.log("VSS Ratio: " + (100*vssConvertedClicks).toFixed(2) + "%");
  Logger.log("");
  Logger.log("COST PER CONVERTED CLICKS:")
  Logger.log("From Defined Product Groups: " + definedCostPerConvertedClick.toFixed(2));
  Logger.log("From 'everything else': " + otherCostPerConvertedClick.toFixed(2));
  */
  //Logger.log("Total: " + totalCostPerConvertedClick.toFixed(2));
  Logger.log("Bid Efficiency: " + (100*vssCostPerConvertedClick).toFixed(0) + "%");
  Logger.log("  (cost per converted click for 'everything else' / cost per converted click for defined product groups)");
  Logger.log("  (Based on " + percentCostFromEverythingElse + "% of your cost coming from 'everything else')");
  Logger.log("");
  
  Logger.log("Number of 'other' product groups: " + SETTINGS.statsForOther.numProductGroups);
  Logger.log("Number of defined product groups: " + SETTINGS.statsForDefinedGroups.numProductGroups);
  Logger.log("");
  Logger.log("OPTMYZR Suggestions");
  Logger.log("Number of product groups that may benefit from a split: " + numProductGroupsToSplit + " (" + percentGroupsToSplit + "% of total)");
  Logger.log("  because they have more than " + SETTINGS.minConversionsBeforeSplitting + " conversions for the selected date range");
  Logger.log("Number of product groups that should be combined: " + numProductGroupsToCombine + " (" + percentGroupsToCombine + "% of total)");
  Logger.log("  because they have fewer than " + SETTINGS.maxConversionsBeforeCombining + " conversions for the selected date range");
  Logger.log("");
  Logger.log("Product Groups To Consider Splitting Further");
  for(var i = 0; i < SETTINGS.productGroupsToSplit.length; i++) {
    var pgObject = SETTINGS.productGroupsToSplit[i];
    var name = pgObject.name;
    var convertedClicks = pgObject.convertedClicks;
    Logger.log(name + ": " + convertedClicks);
    if(i > 100) break;
  }
  
  Logger.log("");
  Logger.log("Product Groups To Consider Rolling Up To A Higher Level");
  for(var i = 0; i < SETTINGS.productGroupsToCombine.length; i++) {
    var pgObject = SETTINGS.productGroupsToCombine[i];
    var name = pgObject.name;
    var convertedClicks = pgObject.convertedClicks;
    Logger.log(name + ": " + convertedClicks);
    if(i > 100) break;
  }
  
  
}                     