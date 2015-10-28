function runReport() {
  // AdWords reports return data faster than campaign management methods
  //   and can be used to retrieve basic structural information on
  //   your Account, Campaigns, AdGroups, Ads, Keywords, etc. You can refer to
  //   https://developers.google.com/adwords/api/docs/guides/structure-reports
  //   for more details.

  // See https://developers.google.com/adwords/api/docs/appendix/reports
  //   for all the supported report types.
  // See https://developers.google.com/adwords/api/docs/guides/awql for
  //   details on how to use AWQL.
  // See https://developers.google.com/adwords/api/docs/guides/uireports
  //   for details on how to map an AdWords UI feature to the corresponding
  //   reporting API feature.
  var report = AdWordsApp.report(
      'SELECT CampaignName, Clicks, Impressions, Cost ' +
      'FROM   CAMPAIGN_PERFORMANCE_REPORT ' +
      'WHERE  Impressions < 10 ' +
      'DURING LAST_30_DAYS');

  var rows = report.rows();
  while (rows.hasNext()) {
    var row = rows.next();
    var campaignName = row['CampaignName'];
    var clicks = row['Clicks'];
    var impressions = row['Impressions'];
    var cost = row['Cost'];
    Logger.log(campaignName + ',' + clicks + ',' + impressions + ',' + cost);
  }
}