import cron from 'cron';

import { getDatabasesInsideSharedPage, getDatabaseTitle } from '../notion/databases.js';
import { getCalculationProperties, getCalculationPropertiesValue } from '../notion/properties.js';
import { ProperyValue } from '../notion/types.js';

export const calculateSum = (values: Array<ProperyValue>) => {
  return values
    .filter(Boolean)
    .map((value) => value.number)
    .reduce((prev, current) => prev + current, 0);
};

export const getSumGroupedDatabase = async () => {
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

export const getTotalAmountAndCalculateSum = async () => {
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

export const scheduleCalculatingExpenses = (ctx) => {
  const cronExpression = '0 0 21 * * *';
  const job = new cron.CronJob(cronExpression, async () => {
    const total = await getTotalAmountAndCalculateSum();
    ctx.reply(`Привет. Общая сумма расхода на сегодняший день: ${total}₴`);
  });
  job.start();
};
