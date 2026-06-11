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

function doGet(e) {
  const action = e && e.parameter ? e.parameter.action : "";
  const callback = e && e.parameter ? e.parameter.callback : "";
  let response;

  if (action === "results") {
    response = getResults_();
  } else if (action === "candidates") {
    response = getCandidates_();
  } else {
    response = { status: "ok", message: "Voting web app is deployed." };
  }

  if (callback) {
    return ContentService
      .createTextOutput(callback + "(" + JSON.stringify(response) + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(JSON.stringify(response))
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

function getResults_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheets = spreadsheet.getSheets();
  const results = [];

  sheets.forEach(function (sheet) {
    const lastRow = sheet.getLastRow();
    const lastColumn = sheet.getLastColumn();

    if (lastRow < 1 || lastColumn < 2) {
      return;
    }

    const values = sheet.getRange(1, 1, lastRow, lastColumn).getValues();
    const headers = values[0];

    if (headers[0] !== "Serial Number") {
      return;
    }

    if (!isActiveResultSheet_(sheet.getName())) {
      return;
    }

    const totalRowIndex = values.findIndex(function (row, index) {
      return index > 0 && row[0] === "Total";
    });
    const lastVoteRowIndex = totalRowIndex === -1 ? values.length - 1 : totalRowIndex - 1;
    const voteRows = Math.max(0, lastVoteRowIndex);
    const candidates = [];

    for (let columnIndex = 1; columnIndex < headers.length; columnIndex++) {
      const candidateName = headers[columnIndex];
      let total = 0;

      if (!candidateName) {
        continue;
      }

      if (totalRowIndex !== -1) {
        total = Number(values[totalRowIndex][columnIndex]) || 0;
      } else {
        for (let rowIndex = 1; rowIndex < values.length; rowIndex++) {
          total += Number(values[rowIndex][columnIndex]) || 0;
        }
      }

      candidates.push({
        name: candidateName,
        total: total
      });
    }

    candidates.sort(function (first, second) {
      return second.total - first.total;
    });

    results.push({
      postName: sheet.getName(),
      totalVotes: voteRows,
      candidates: candidates
    });
  });

  return {
    status: "ok",
    generatedAt: new Date().toISOString(),
    results: results
  };
}

function isActiveResultSheet_(sheetName) {
  if (sheetName === "Head Boy" || sheetName === "Head Girl") {
    return true;
  }

  return /^(Yellow House|Red House|Blue House|Green House) - /.test(sheetName);
}

function getCandidates_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName("Candidates");

  if (!sheet) {
    return {
      status: "error",
      message: "Candidates sheet not found.",
      posts: []
    };
  }

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return {
      status: "ok",
      generatedAt: new Date().toISOString(),
      posts: []
    };
  }

  const posts = [];

  for (let rowIndex = 1; rowIndex < values.length; rowIndex++) {
    const row = values[rowIndex];
    const postName = String(row[0] || "").trim();

    if (!postName) {
      continue;
    }

    const candidates = [];

    for (let columnIndex = 1; columnIndex < row.length; columnIndex += 2) {
      const candidateName = String(row[columnIndex] || "").trim();
      const candidateClass = String(row[columnIndex + 1] || "").trim();

      if (candidateName) {
        candidates.push({
          name: candidateName,
          className: candidateClass
        });
      }
    }

    posts.push({
      post: postName,
      candidates: candidates
    });
  }

  return {
    status: "ok",
    generatedAt: new Date().toISOString(),
    posts: posts
  };
}  