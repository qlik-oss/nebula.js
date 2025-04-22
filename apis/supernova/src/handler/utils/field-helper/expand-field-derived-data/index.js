import getDataGeoField from '../get-data-geo-field';
import getDerivedFields from '../get-derived-fields';

const expandFieldsWithDerivedData = (list) => {
  const fieldList = [];
  list.forEach((field) => {
    fieldList.push(getDataGeoField(field));

    const derivedFields = getDerivedFields(field);
    fieldList.push(...derivedFields);
  });

  return fieldList;
};

export default expandFieldsWithDerivedData;
