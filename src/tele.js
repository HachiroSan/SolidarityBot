'use strict';

const TelegramBot = require('node-telegram-bot-api');
const {loadData, findItem} = require('./index');
const fs = require('fs');

// Environment variables
const BOT_TOKEN = process.env.BOT_TOKEN || undefined;

if (BOT_TOKEN === undefined) {
    console.error("BOT_TOKEN is not defined");
    process.exit(1);
}
const bot = new TelegramBot(BOT_TOKEN, {polling: true});

/**
 * Run the bot functionality to respond to messages from users.
 *
 * @param {Array} sheetData - Array of items to search through.
 */
const runBot = async (sheetData) => {
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from.username;
    const messageText = msg.text;

    const response = await findItem(sheetData, messageText);

    if (response.image_url) {
      try {
        await bot.sendPhoto(chatId, response.image_url, { caption: response.text });
      } catch (error) {
        await bot.sendMessage(chatId, response.text);
      }
    } else {
      await bot.sendMessage(chatId, response.text);
    }

    const timestamp = new Date().toLocaleString();
    const logMessage = `[${timestamp}] Username: ${username}, Message: ${messageText}\n`;
    console.log(logMessage);

    fs.appendFile('chat.log', logMessage, (err) => {
      if (err) {
        console.error("Error writing to log file: ", err);
      }
    });
  });
}

(async () => {
  const sheetData = await loadData();
  runBot(sheetData);
})();