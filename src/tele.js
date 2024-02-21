'use strict';

const TelegramBot = require('node-telegram-bot-api');
const {loadData, findItem} = require('./index');


const BOT_TOKEN = '6463257783:AAE1favGh3wgs0RMQw_vSuLyOrBVjhYMLqE';
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
        console.log(`${timestamp} - Username: ${username}, Message: ${messageText}`);
    });
});