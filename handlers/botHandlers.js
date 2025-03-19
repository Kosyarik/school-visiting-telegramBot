const classesConfig = require('../config/classes.json');
const GoogleSheetsService = require('../services/googleSheets.js');
const { Markup } = require('telegraf');

const sheetsService = new GoogleSheetsService();

const setupHandlers = (bot) => {
  const showClassMenu = (ctx) => {
    const classes = classesConfig.classes;
    const buttons = [];
    const columns = 3;

    for (let i = 0; i < classes.length; i += columns) {
      const row = classes.slice(i, i + columns).map(cls =>
        Markup.button.callback(cls, `class_${cls}`)
      );
      buttons.push(row);
    }

    ctx.reply('Виберіть клас:', Markup.inlineKeyboard(buttons));
  };

  bot.start((ctx) => {
    showClassMenu(ctx);
  });

  classesConfig.classes.forEach(cls => {
    bot.action(`class_${cls}`, (ctx) => {
      ctx.session = { class: cls };
      ctx.reply('Оберіть:', Markup.inlineKeyboard([
        [Markup.button.callback('Цілий клас', `type_whole_${cls}`)],
        [Markup.button.callback('Група', `type_group_${cls}`)],
        [Markup.button.callback('⬅️ Назад', 'back_to_classes')]
      ]));
    });
  });

  bot.action('back_to_classes', (ctx) => {
    ctx.session = {};
    showClassMenu(ctx);
  });

  bot.action(/type_(whole|group)_(.+)/, (ctx) => {
    const type = ctx.match[1];
    const className = ctx.match[2];
    ctx.session = { class: className, type: type === 'whole' ? 'whole' : 'group' };
    ctx.reply('Введіть кількість учнів:', Markup.inlineKeyboard([
      [Markup.button.callback('⬅️ Назад', `class_${className}`)]
    ]));
  });

  bot.on('text', async (ctx) => {
    if (!ctx.session?.class || !ctx.session?.type) {
      return ctx.reply('Спочатку виберіть клас і тип!');
    }

    const count = parseInt(ctx.message.text);
    if (isNaN(count) || count < 0) {
      return ctx.reply('Будь ласка, введіть коректне число!', Markup.inlineKeyboard([
        [Markup.button.callback('⬅️ Назад', `class_${ctx.session.class}`)]
      ]));
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      await sheetsService.updateSheet(
        ctx.session.class,
        today,
        count,
        ctx.session.type === 'group'
      );
      ctx.reply('Дані успішно записані!', Markup.inlineKeyboard([
        [Markup.button.callback('⬅️ Назад', 'back_to_classes')]
      ]));
    } catch (error) {
      ctx.reply('Помилка при записі даних: ' + error.message, Markup.inlineKeyboard([
        [Markup.button.callback('⬅️ Назад', `class_${ctx.session.class}`)]
      ]));
    }

    ctx.session = {};
  });
};

module.exports = { setupHandlers };