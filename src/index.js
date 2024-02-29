'use strict';

const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const fs = require('fs');
const Fuse = require('../lib/fuse');

const SPREADSHEET_ID = '1vucTAdf8cSq5FisJWuWxt4nXdjRTinPQZYd8ZQ8g1rE'

const google_authenticate = async function () {
  const account = JSON.parse(fs.readFileSync('../private.json'));

  const serviceAccountAuth = new JWT({
    email: account.client_email,
    key: account.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  return serviceAccountAuth;
}

// Environment variables
const SHEET_RANGE = process.env.SHEET_RANGE || 100;


/**
 * Fetches data from a Google Sheets document.
 * @param {GoogleSpreadsheet} doc - The GoogleSpreadsheet object representing the document.
 * @param {string} range - The range of cells to load.
 * @returns {Object} - An object containing the title, cellStats, and data.
 */
const fetchSheetData = async function (doc, range) {
  const sheet = doc.sheetsByIndex[0];

// Load the specified range of cells
  await sheet.loadCells(range);

  for (let row = 1; row < SHEET_RANGE; row++) {
    const data = {
      Name: sheet.getCell(row, 0).value,
      Category: sheet.getCell(row, 1).value,
      Reason: sheet.getCell(row, 2).value,
      Reference: sheet.getCell(row, 3).value,
      Image: sheet.getCell(row, 4).value,
    };

    dataArray.push(data);
  }

  return {
    title: sheet.title,
    cellStats: sheet.cellStats,
    data: dataArray,
  };
};

const findItem = async function (itemData, searchQuery) {
  const fuseOptions = {
    keys: ["Name"],
    threshold: 0.3,
  };

  const fuse = new Fuse(itemData, fuseOptions);
  const result = await fuse.search(searchQuery);

  if (result.length > 0) {
    const { Name, Category, Reason, Reference, Image } = result[0].item;
    return {
      text: `Name: ${Name}\nCategory: ${Category}\nReason: ${Reason}\nReference: ${Reference}`,
      image_url: Image,
    };
  }

  return {
    text:
      "We do not have official information or facts to indicate that this brand/company has any affiliation with Israel-linked companies or supports the Zionist occupation of Palestine.",
    image_url: null,
  };
};

function loadData() {
  return new Promise(async (resolve, reject) => {
    try {
      const serviceAccountAuth = await google_authenticate();
      const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
      await doc.loadInfo();
      console.log(`Loaded doc: ${doc.title}`);
      const sheetData = await fetchSheetData(doc, `A1:E${SHEET_RANGE}`);
      console.log(`Loaded sheet: ${sheetData.title}`);
      console.log(`Loaded cell: ${sheetData.cellStats.total} cells\n`);
      resolve(sheetData.data);
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { loadData, findItem };