const { Telegraf, session } = require('telegraf');
require('dotenv').config();
const { setupHandlers } = require('./handlers/botHandlers');

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(session());

setupHandlers(bot);

bot.launch().then(() => {
  console.log('Bot started');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));