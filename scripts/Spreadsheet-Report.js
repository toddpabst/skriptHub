function exportReportToSpreadsheet() {
  var spreadsheet = SpreadsheetApp.create('INSERT_REPORT_NAME_HERE');
  var report = AdWordsApp.report(
    'SELECT CampaignName, Clicks, Impressions, Cost ' +
    'FROM   CAMPAIGN_PERFORMANCE_REPORT ' +
    'WHERE  Impressions < 10 ' +
    'DURING LAST_30_DAYS');
  report.exportToSheet(spreadsheet.getActiveSheet());
}