const SPREADSHEET_ID = "15QXRA_XCp0lsKDmdRbXvRkdjDMp8DLeT5xehdrSdwaE";

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const payload = parsePayload_(e);
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const posts = payload.posts || {};

    Object.keys(posts).forEach(function (postName) {
      const vote = posts[postName];
      const candidates = vote.candidateNames || [];
      const selectedCandidate = vote.selectedCandidate;
      const sheet = getOrCreatePostSheet_(spreadsheet, postName, candidates);
      removeTotalRow_(sheet);
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const serialNumber = Math.max(1, sheet.getLastRow());
      const newRow = headers.map(function (header, index) {
        if (index === 0) {
          return serialNumber;
        }
        return header === selectedCandidate ? 1 : "";
      });

      sheet.appendRow(newRow);
      writeTotalRow_(sheet);
    });

    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", message: "Voting web app is deployed." }))
    .setMimeType(ContentService.MimeType.JSON);
}

function parsePayload_(e) {
  if (e && e.parameter && e.parameter.payload) {
    return JSON.parse(e.parameter.payload);
  }

  if (e && e.postData && e.postData.contents) {
    return JSON.parse(e.postData.contents);
  }

  throw new Error("No vote payload received.");
}

function getOrCreatePostSheet_(spreadsheet, postName, candidates) {
  const safeSheetName = postName.substring(0, 99);
  let sheet = spreadsheet.getSheetByName(safeSheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(safeSheetName);
  }

  const requiredHeaders = ["Serial Number"].concat(candidates);

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, requiredHeaders.length).setValues([requiredHeaders]);
    sheet.setFrozenRows(1);
    return sheet;
  }

  const currentHeaders = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0];
  const missingHeaders = requiredHeaders.filter(function (header) {
    return currentHeaders.indexOf(header) === -1;
  });

  if (missingHeaders.length > 0) {
    sheet.getRange(1, currentHeaders.length + 1, 1, missingHeaders.length).setValues([missingHeaders]);
  }

  return sheet;
}

function removeTotalRow_(sheet) {
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return;
  }

  const firstCellValue = sheet.getRange(lastRow, 1).getValue();

  if (firstCellValue === "Total") {
    sheet.deleteRow(lastRow);
  }
}

function writeTotalRow_(sheet) {
  const lastVoteRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();

  if (lastVoteRow < 2 || lastColumn < 2) {
    return;
  }

  const totalRowNumber = lastVoteRow + 1;
  const totalRow = new Array(lastColumn).fill("");
  totalRow[0] = "Total";

  for (let columnNumber = 2; columnNumber <= lastColumn; columnNumber++) {
    const columnLetter = getColumnLetter_(columnNumber);
    totalRow[columnNumber - 1] = "=SUM(" + columnLetter + "2:" + columnLetter + lastVoteRow + ")";
  }

  sheet.getRange(totalRowNumber, 1, 1, lastColumn).setValues([totalRow]);
  sheet.getRange(totalRowNumber, 1, 1, lastColumn).setFontWeight("bold");
  sheet.getRange(totalRowNumber, 1, 1, lastColumn).setBackground("#fff2cc");
}

function getColumnLetter_(columnNumber) {
  let letter = "";
  let currentNumber = columnNumber;

  while (currentNumber > 0) {
    const remainder = (currentNumber - 1) % 26;
    letter = String.fromCharCode(65 + remainder) + letter;
    currentNumber = Math.floor((currentNumber - 1) / 26);
  }

  return letter;
}