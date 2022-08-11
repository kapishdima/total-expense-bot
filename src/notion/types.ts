export type Link = {
  type: 'url';
  url: string;
};

export type Annotations = {
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  underline: boolean;
  code: boolean;
  color: string;
};

export type RichText = {
  type: 'text' | 'mention' | 'equation';
  text: {
    content: string;
    link: Link | null;
  };
  annotations: Annotations;
  plain_text: string;
  href: string;
};

export type ProperyValue = {
  object: string;
  type: string;
  id: string;
  [key: string]: any;
};

export type Propery = {
  [key: string]: {
    id: string;
    name: string;
    type: string;
  };
};

export type SearchRequest = {
  filter: SearchFilters;
};

export type SearchFilters = {
  value: string;
  property: string;
};

export type Element = {
  object: 'database' | 'page';
  id: string;
  title: Array<RichText>;
  description: Array<RichText>;
  is_inline: boolean;
  properties: Propery;
  parent: {
    type: string;
    page_id: string;
  };
  url: string;
  archived: boolean;
};

export type SearchResults = Array<Element>;

export type SearchResponse = {
  object: string;
  results: SearchResults;
};

export type DatabaseQueryRequest = {
  filter: {
    property: string;
    [key: string]: any;
  };
};

export type DatabaseQueryResponse = SearchResponse;
export type DatabaseQueryResults = SearchResults;

export type PagePropertiesResponse = ProperyValue;
