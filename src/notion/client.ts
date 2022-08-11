import axios from 'axios';
import dotenv from 'dotenv';

import {
  DatabaseQueryRequest,
  DatabaseQueryResponse,
  DatabaseQueryResults,
  PagePropertiesResponse,
  SearchRequest,
  SearchResponse,
  SearchResults,
} from './types';

dotenv.config();

export const calculationPropName = 'Amount';

const client = axios.create({
  baseURL: process.env.NOTION_API_URL,
  headers: {
    Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
    'Notion-Version': process.env.NOTION_API_VERSION,
  },
});

export const notion = {
  search: async (options: SearchRequest): Promise<SearchResults> => {
    const { data } = await client.post<SearchResponse>('/search', options);

    return data.results;
  },
  database: {
    query: async (id: string, options: DatabaseQueryRequest): Promise<DatabaseQueryResults> => {
      const { data } = await client.post<DatabaseQueryResponse>(`/databases/${id}/query`, options);

      return data.results;
    },
  },
  pages: {
    props: async (pageId: string, propId: string): Promise<PagePropertiesResponse> => {
      const { data } = await client.get<PagePropertiesResponse>(
        `pages/${pageId}/properties/${propId}`,
      );

      return data;
    },
  },
};
