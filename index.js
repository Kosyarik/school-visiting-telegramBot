const { Telegraf, session } = require('telegraf');
require('dotenv').config();
const { setupHandlers } = require('./handlers/botHandlers');
const express = require('express'); 

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(session());

setupHandlers(bot);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bot.webhookCallback('/telegram-webhook')); 

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  const webhookUrl = `https://${process.env.RENDER_EXTERNAL_HOSTNAME}/telegram-webhook`;
  bot.telegram.setWebhook(webhookUrl)
    .then(() => console.log(`Webhook set to ${webhookUrl}`));
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));