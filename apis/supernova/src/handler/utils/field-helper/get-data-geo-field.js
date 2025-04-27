import { isDateField, isGeoField } from './field-utils';

const getDataGeoField = (field) => {
  const item = field;
  item.isDateField = isDateField(item);
  item.isGeoField = isGeoField(item);
  return item;
};

export default getDataGeoField;
