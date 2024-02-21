const TelegramBot = require('node-telegram-bot-api');
const {loadData, findItem} = require('./index');

const BOT_TOKEN = '6463257783:AAE1favGh3wgs0RMQw_vSuLyOrBVjhYMLqE';

const bot = new TelegramBot(BOT_TOKEN, {polling: true});

sheetData = loadData();


bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from.username;
    const messageText = msg.text;

    // Find the item in the cache
    const response = findItem(sheetData, messageText);
    bot.sendMessage(msg.chat.id, response.text);

    // Log the message to the console
    const timestamp = new Date().toLocaleString();
    console.log(`${timestamp} - Username: ${username}, Message: ${messageText}`);
});