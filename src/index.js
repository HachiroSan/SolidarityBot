const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const fs = require('fs');
const Fuse = require('../lib/fuse');
const { strict } = require('assert');

const SPREADSHEET_ID = '1vucTAdf8cSq5FisJWuWxt4nXdjRTinPQZYd8ZQ8g1rE'

const authenticate = async function() {
  const account = JSON.parse(fs.readFileSync('ssh-vpn.json'));

  const serviceAccountAuth = new JWT({
    email: account.client_email,
    key: account.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  return serviceAccountAuth;
}

const fetchSheetData = async function(doc, range) {
  const sheet = doc.sheetsByIndex[0];

  await sheet.loadCells(range);

  let dataArray = [];

  for (let row = 1; row < 150; row++) {
    data = {
      "Name": sheet.getCell(row, 0).value,
      "Category": sheet.getCell(row, 1).value,
      "Reason": sheet.getCell(row, 2).value,
      "Reference": sheet.getCell(row, 3).value,
      "Image": sheet.getCell(row, 4).value
    };

    dataArray.push(data);
  }

  return {
    title: sheet.title,
    cellStats: sheet.cellStats,
    data: dataArray
  }
}

function findItem(itemData, searchQuery) {

  // Initialize Fuse instance with itemData and search keys
  const fuse = new Fuse(itemData, { keys: ["Name"], threshold: 0.4 });

  // Search for the searchQuery
  const result = fuse.search(searchQuery);

  // If there's a match, return the matched item's details
  if (result.length > 0) {
    const matchedItem = result[0].item;
    return {
      text: `Name: ${matchedItem.Name}\nCategory: ${matchedItem.Category}\nReason: ${matchedItem.Reason}\nReference: ${matchedItem.Reference}`,
      image_url: matchedItem.Image
    };
  }

  // If no match found, return a default message
  return {
    text: "We do not have official information or facts to indicate that this brand/company has any affiliation with Israel-linked companies or supports the Zionist occupation of Palestine.",
    image_url: null
  };
}

const main = async function() {
  const serviceAccountAuth = await authenticate();
  const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
  await doc.loadInfo(); // loads document properties and worksheets
  console.log("Loaded doc: " + doc.title);
  
  const sheetData = await fetchSheetData(doc, 'A1:E150');

  console.log("Loaded sheet: " + sheetData.title);
  console.log("Loaded cell: " + sheetData.cellStats.total);

  // const TestData = sheetData.data.find(item => item.Name === "Aptamil");

  // console.log(TestData)

  const test = findItem(sheetData.data, "amajon");
  console.log(test.text);
}

main();