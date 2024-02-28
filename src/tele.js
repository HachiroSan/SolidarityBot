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

let sheetData;

loadData().then((data) => {
    sheetData = data;

    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const username = msg.from.username;
        const messageText = msg.text;
    
        // Find the item in the cache
        const response = await findItem(sheetData, messageText);
        if (response.image_url != null) {
            bot.sendPhoto(msg.chat.id, response.image_url, {caption: response.text})
                .catch((error) => {
                    bot.sendMessage(msg.chat.id, response.text);
                });
        } else {
            bot.sendMessage(msg.chat.id, response.text);
        }

        // Log the message to the console
        const timestamp = new Date().toLocaleString();
        const logMessage = `[${timestamp}] Username: ${username}, Message: ${messageText}\n`;
        console.log(logMessage);

        fs.appendFile('chat.log', logMessage, (err) => {
            if (err) {
                console.error("Error writing to log file: ", err);
            }
        });
    });
});