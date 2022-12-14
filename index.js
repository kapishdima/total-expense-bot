import axios from 'axios';
import { Telegraf } from 'telegraf';
import { Client } from '@notionhq/client';
import cron from 'cron';

const TELEGRAM_BOT_KEY = '5504969965:AAGAuaF2XZOIIBnUKqCWwlKva1l1ltne4ck';
const NOTION_API_KEY = 'secret_gIjz0NgAzKWQBVmsc7uytVKessAf73QrYGlRg4r1A3Y';
const NOTION_API_VERSION = '2022-06-28';

const calculationPropertyName = 'Amount';

const notionApiUrl = 'https://api.notion.com/v1/';
const notionApiClient = axios.create({
  baseURL: notionApiUrl,
  headers: {
    Authorization: `Bearer ${NOTION_API_KEY}`,
    'Notion-Version': NOTION_API_VERSION,
  },
});
const bot = new Telegraf(TELEGRAM_BOT_KEY);
const notion = new Client({
  auth: NOTION_API_KEY,
});

const getDatabaseTitle = (database) => {
  return database.title[0]?.plain_text || 'Unknown database';
};

const getPropertyValue = async (pageId, propertyId) => {
  const { data } = await notionApiClient.get(`pages/${pageId}/properties/${propertyId}`);
  return data;
};

const getDatabasesInsideSharedPage = async (action) => {
  const { data } = await notionApiClient.post('search', {
    filter: {
      value: 'database',
      property: 'object',
    },
  });

  return data.results;
};

const getPagesWithCalculationProperty = async (database) => {
  const pages = await notion.databases.query({
    database_id: database.id,
    filter: {
      property: calculationPropertyName,
      number: {
        is_not_empty: true,
      },
    },
  });

  return pages.results.flat();
};

const getCalculationProperties = async (database) => {
  const pages = await getPagesWithCalculationProperty(database);
  const properties = pages.map((page) => ({
    pageId: page.id,
    propertyId: page.properties[calculationPropertyName].id,
  }));

  return properties;
};

const calculateSum = (values) => {
  return values
    .filter(Boolean)
    .map((value) => value.number)
    .reduce((prev, current) => prev + current, 0);
};

const getCalculationPropertiesValue = async (properties) => {
  if (!properties.length) {
    return [];
  }

  const values = await Promise.all(
    properties.map(async (property) => {
      return await getPropertyValue(property.pageId, property.propertyId);
    }),
  );

  return values;
};

const getSumGroupedDatabase = async () => {
  const databases = await getDatabasesInsideSharedPage();
  const groupedSum = await Promise.all(
    databases.map(async (database) => {
      const properties = await getCalculationProperties(database);
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
        const properties = await getCalculationProperties(database);
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
    ctx.reply(`????????????. ?????????? ?????????? ?????????????? ???? ???????????????????? ????????: ${total}???`);
  });
  job.start();
};

bot.start((ctx) => {
  ctx.reply('????????????. ?????? ?????????? ???????????????? ?????????? ?????????? ????????????????. ?????? ?????????? ?????????????????? ????????????????!');
  scheduleCalculatingExpenses(ctx);
});

bot.command('total', async (ctx) => {
  ctx.reply('???????????? ?????????? ?? Notion ?? ???????????? ???????????? ???????? ????????????????. ?????????????? ???????? ????????????...');
  const total = await getTotalAmountAndCalculateSum();
  ctx.reply(`?????????? ?????????? ?????????????? ???? ???????????? ????????????: ${total}???`);
});

bot.command('details', async (ctx) => {
  ctx.reply('???????????? ?????????? ?? Notion ?? ???????????? ???????????? ???????? ????????????????. ?????????????? ???????? ????????????...');
  const groupedSum = await getSumGroupedDatabase();
  const replyText = groupedSum.reduce((prev, current) => {
    const title = Object.keys(current)[0];
    const sum = Object.values(current)[0];

    prev += `- ${title}: ${sum.toFixed(2)}???\n`;

    return prev;
  }, '');

  ctx.reply(`?????????? ?????????? ?????????????? ???? ???????????? ????????????: \n${replyText}`);
});

bot.launch();
