import { calculationPropName, notion } from './client.js';

export const getPagesWithCalculationProperty = async (databaseId: string) => {
  const pages = await notion.database.query(databaseId, {
    filter: {
      property: calculationPropName,
      number: {
        is_not_empty: true,
      },
    },
  });

  return pages.flat();
};
