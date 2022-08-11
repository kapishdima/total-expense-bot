import { notion } from './client.js';
import { Element, SearchResults } from './types';

export const getDatabaseTitle = (database: Element): string => {
  return database.title[0]?.plain_text || 'Unknown database';
};

export const getDatabasesInsideSharedPage = async (): Promise<SearchResults> => {
  const databases = await notion.search({
    filter: {
      value: 'database',
      property: 'object',
    },
  });

  return databases;
};
