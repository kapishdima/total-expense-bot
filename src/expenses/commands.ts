import { Context } from 'telegraf';
import {
  getSumGroupedDatabase,
  getTotalAmountAndCalculateSum,
  scheduleCalculatingExpenses,
} from './cacluation.js';

export const totalExpenses = async (ctx: Context) => {
  ctx.reply('Сейчас схожу в Notion и получу список всех расходов. Подожди пару секунд...');
  const total = await getTotalAmountAndCalculateSum();
  ctx.reply(`Общая сумма расхода на данный момент: ${total}₴`);
};

export const groupedExpenses = async (ctx: Context) => {
  ctx.reply('Сейчас схожу в Notion и получу список всех расходов. Подожди пару секунд...');
  const groupedSum = await getSumGroupedDatabase();
  const replyText = groupedSum.reduce((prev, current) => {
    const title = Object.keys(current)[0];
    const sum: any = Object.values(current)[0];

    prev += `- ${title}: ${sum.toFixed(2)}₴\n`;

    return prev;
  }, '');

  ctx.reply(`Общая сумма расхода на данный момент: \n${replyText}`);
};

export const scheduleExpenses = async (ctx: Context) => {
  ctx.reply('Привет. Тут можно получить общую сумму расходов. Для этого используй комманды!');
  scheduleCalculatingExpenses(ctx);
};
