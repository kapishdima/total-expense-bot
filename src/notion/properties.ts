import { calculationPropName, notion } from './client.js';
import { getPagesWithCalculationProperty } from './pages.js';
import { Element, ProperyValue } from './types.js';

type PropertyMap = {
  pageId: string;
  propertyId: string;
};

export const getPropertyValue = async (
  pageId: string,
  propertyId: string,
): Promise<ProperyValue> => {
  const props = await notion.pages.props(pageId, propertyId);
  return props;
};

export const getCalculationPropertiesValue = async (properties: Array<PropertyMap>) => {
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

export const getCalculationProperties = async (databaseId: string) => {
  const pages = await getPagesWithCalculationProperty(databaseId);
  const properties = pages.map<PropertyMap>((page: Element) => ({
    pageId: page.id,
    propertyId: page.properties[calculationPropName].id,
  }));

  return properties;
};
