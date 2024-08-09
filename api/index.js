require('dotenv').config();
const path = require("path");
const TelegramBot = require("node-telegram-bot-api");

const TOKEN = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(TOKEN, {
    polling: true
});

bot.setWebHook(`https://clicker-harvest-noko.vercel.app/api/bot`);

const gameName = "clickerharvest";
const queries = {};

bot.onText(/help/, (msg) => bot.sendMessage(msg.from.id, "Say /game if you want to play."));
bot.onText(/start|game/, (msg) => bot.sendGame(msg.from.id, gameName));

bot.on("callback_query", function (query) {
    if (query.game_short_name !== gameName) {
        bot.answerCallbackQuery(query.id, "Sorry, '" + query.game_short_name + "' is not available.")
            .catch((error) => {
                console.error("Error responding to callback query:", error);
            });
    } else {
        queries[query.id] = query;
        let gameurl = process.env.GAME_URL;

        bot.answerCallbackQuery(query.id, {
            url: gameurl
        }).catch((error) => {
            console.error("Error responding to callback query:", error);
            // Handle specific errors here if needed
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

// Export the handler function for Vercel
module.exports = (req, res) => {
    const score = req.query.score;
    const id = req.query.id;

    if (!queries.hasOwnProperty(id)) {
        return res.status(404).send('Query ID not found');
    }

    let query = queries[id];
    let options;
    if (query.message) {
        options = {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id
        };
    } else {
        options = {
            inline_message_id: query.inline_message_id
        };
    }

    bot.setGameScore(query.from.id, parseInt(score), options, function (err, result) {
        if (err) {
            console.error("Error setting game score:", err);
            return res.status(500).send("Failed to set score");
        }
        res.status(200).send("Score set successfully");
        delete queries[id];
    });
};
