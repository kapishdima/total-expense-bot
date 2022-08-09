import { Telegraf } from 'telegraf';
import cron from 'cron';

import dotenv from 'dotenv';
import { getDatabasesInsideSharedPage, getDatabaseTitle } from './notion/databases.js';
import { getCalculationProperties, getCalculationPropertiesValue } from './notion/properties.js';

dotenv.config();

console.log(process.env.TELEGRAM_BOT_API);

const TELEGRAM_BOT_KEY = '5504969965:AAGAuaF2XZOIIBnUKqCWwlKva1l1ltne4ck';

const bot = new Telegraf(TELEGRAM_BOT_KEY);

const calculateSum = (values) => {
  return values
    .filter(Boolean)
    .map((value) => value.number)
    .reduce((prev, current) => prev + current, 0);
};

const getSumGroupedDatabase = async () => {
  const databases = await getDatabasesInsideSharedPage();
  const groupedSum = await Promise.all(
    databases.map(async (database) => {
      const properties = await getCalculationProperties(database.id);
      const values = await getCalculationPropertiesValue(properties);

      const title = getDatabaseTitle(database);
      const sum = calculateSum(values);

      return {
        [title]: sum,
      };
    }),
  );

  return groupedSum;
};

const getTotalAmountAndCalculateSum = async () => {
  try {
    const databases = await getDatabasesInsideSharedPage();
    const values = await Promise.all(
      databases.map(async (database) => {
        const properties = await getCalculationProperties(database.id);
        const values = await getCalculationPropertiesValue(properties);
        if (!values.length) {
          return null;
        }

        return values;
      }),
    );

    return calculateSum(values.flat());
  } catch (error) {
    console.error(error);
  }
};

const scheduleCalculatingExpenses = (ctx) => {
  const cronExpression = '0 0 21 * * *';
  const job = new cron.CronJob(cronExpression, async () => {
    const total = await getTotalAmountAndCalculateSum();
    ctx.reply(`Привет. Общая сумма расхода на сегодняший день: ${total}₴`);
  });
  job.start();
};

bot.start((ctx) => {
  ctx.reply('Привет. Тут можно получить общую сумму расходов. Для этого используй комманды!');
  scheduleCalculatingExpenses(ctx);
});

bot.command('total', async (ctx) => {
  ctx.reply('Сейчас схожу в Notion и получу список всех расходов. Подожди пару секунд...');
  const total = await getTotalAmountAndCalculateSum();
  ctx.reply(`Общая сумма расхода на данный момент: ${total}₴`);
});

bot.command('details', async (ctx) => {
  ctx.reply('Сейчас схожу в Notion и получу список всех расходов. Подожди пару секунд...');
  const groupedSum = await getSumGroupedDatabase();
  const replyText = groupedSum.reduce((prev, current) => {
    const title = Object.keys(current)[0];
    const sum: any = Object.values(current)[0];

    prev += `- ${title}: ${sum.toFixed(2)}₴\n`;

    return prev;
  }, '');

  ctx.reply(`Общая сумма расхода на данный момент: \n${replyText}`);
});

bot.launch();
