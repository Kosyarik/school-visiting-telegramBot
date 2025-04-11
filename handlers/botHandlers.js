const classesConfig = require('../config/classes.json');
const GoogleSheetsService = require('../services/googleSheets.js');
const { Markup } = require('telegraf');

const sheetsService = new GoogleSheetsService();

const setupHandlers = (bot) => {
  const getClassMenu = () => {
    const classes = classesConfig.classes;
    const buttons = [];
    const columns = 3;

    for (let i = 0; i < classes.length; i += columns) {
      const row = classes.slice(i, i + columns);
      buttons.push(row);
    }
    return Markup.keyboard(buttons).resize();
  };

  bot.start((ctx) => {
    ctx.reply('Ласкаво просимо! Виберіть клас нижче:', getClassMenu());
  });

  bot.command('getid', (ctx) => {
    ctx.reply(`Ваш chatId: ${ctx.chat.id}`);
  });

  classesConfig.classes.forEach(cls => {
    bot.hears(cls, (ctx) => {
      ctx.session = { chatId: ctx.chat.id, class: cls };
      ctx.reply('Оберіть:', Markup.keyboard([
        ['Цілий клас', 'Група'],
        ['⬅️ Назад']
      ]).resize());
    });
  });

  bot.hears('⬅️ Назад', (ctx) => {
    ctx.session = { chatId: ctx.chat.id };
    ctx.reply('Виберіть клас:', getClassMenu());
  });

  bot.hears(['Цілий клас', 'Група'], (ctx) => {
    if (!ctx.session?.class) return;
    
    ctx.session.type = ctx.message.text === 'Цілий клас' ? 'whole' : 'group';
    ctx.reply('Введіть кількість учнів:', Markup.keyboard([
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['0', '⬅️ Назад']
    ]).resize());
  });

  bot.on('text', async (ctx) => {
    if (ctx.chat.id !== ctx.session?.chatId) return;

    if (!ctx.session?.class || !ctx.session?.type) {
      return ctx.reply('Спочатку виберіть клас і тип!', getClassMenu());
    }

    if (ctx.message.text === '⬅️ Назад') {
      ctx.session = { chatId: ctx.chat.id, class: ctx.session.class };
      return ctx.reply('Оберіть:', Markup.keyboard([
        ['Цілий клас', 'Група'],
        ['⬅️ Назад']
      ]).resize());
    }
    
    const count = parseInt(ctx.message.text);
    if (isNaN(count) || count < 0 || count > process.env.MAX_ABSENT_STUDENT) {
      return ctx.reply('Будь ласка, введіть коректне число!');
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      await sheetsService.updateSheet(
        ctx.session.class,
        today,
        count,
        ctx.session.type === 'group'
      );
      ctx.reply('🔥🔥🔥 Дані успішно записані! 🔥🔥🔥', getClassMenu());

      const allFilled  = await sheetsService.areAllClassesFilled(today);
      const kuratorIds = classesConfig.kurators[ctx.session.class];

      if (kuratorIds && Array.isArray(kuratorIds)) {
        for (const kuratorId of kuratorIds) {
        await ctx.telegram.sendMessage(
          kuratorId,
          `📢Оновлення для класу ${ctx.session.class} на ${today}\n 📢` +
          `Кількість відсутніх: ${count}, Тип: ${ctx.session.type === 'group' ? 'Група' : 'Цілий клас'}`
        );
      }
      } else {
        console.log(`Куратор для класу ${className} не знайдений`);
      }

      if(allFilled) {
        const sum  = await sheetsService.sumAllClasses(today);
        const adminChatIds = classesConfig.adminChatIds;
        for (const adminChatId of adminChatIds) {
        await ctx.telegram.sendMessage(
          adminChatId,
          `📢 Усі класи за ${today} заповнені!\n` +
          `Загальна кількість відсутніх учнів: ${sum}`
        );
      }
      }
    } catch (error) {
      ctx.reply('Помилка при записі даних: ' + error.message);
    }

    ctx.session = { chatId: ctx.chat.id };
  });
};

module.exports = { setupHandlers };
