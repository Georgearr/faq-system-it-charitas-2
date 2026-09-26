/**
 * Charitas IT Issue & FAQ System - Apps Script Web App Entry Point
 */

function doGet(_e) {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Charitas IT Issue & FAQ System')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}
