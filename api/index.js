require('dotenv').config();
const express = require("express");
const path = require("path");
const TelegramBot = require("node-telegram-bot-api");
const TOKEN = process.env.TELEGRAM_TOKEN;
const server = express();
const bot = new TelegramBot(TOKEN, {
    polling: true
});
const port = process.env.PORT || 5000;
const gameName = "clickerharvest";
const queries = {};
console.log("1");
server.use(express.static(path.join(__dirname, 'clickerharvest')));
bot.onText(/help/, (msg) => bot.sendMessage(msg.from.id, "Say /game if you want to play."));
bot.onText(/start|game/, (msg) => bot.sendGame(msg.from.id, gameName));
console.log("2");
bot.on("callback_query", function (query) {
    if (query.game_short_name !== gameName) {
        bot.answerCallbackQuery(query.id, "Sorry, '" + query.game_short_name + "' is not available.");
        console.log("3");
    } else {
        queries[query.id] = query;
        let gameurl = process.env.GAME_URL;
        /*bot.answerCallbackQuery({
            callback_query_id: query.id,
            url: gameurl
        });*/
        console.log("4");
        // Updated usage (recommended)
        bot.answerCallbackQuery(query.id, {
            url: gameurl
        });
    }
});
bot.on("inline_query", function (iq) {
    bot.answerInlineQuery(iq.id, [{
        type: "game",
        id: "0",
        game_short_name: gameName
    }]);
});
server.get("/highscore/:score", function (req, res, next) {
    if (!Object.hasOwnProperty.call(queries, req.query.id)) return next();
    let query = queries[req.query.id];
    let options;
    if (query.message) {
        options = {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id
        };
        console.log("4");
    } else {
        options = {
            inline_message_id: query.inline_message_id
        };
        console.log("5");
    }
    bot.setGameScore(query.from.id, parseInt(req.params.score), options,
        function (err, result) {});
});
server.listen(port);