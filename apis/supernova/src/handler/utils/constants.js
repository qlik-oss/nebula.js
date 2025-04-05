export const TOTAL_MAX = {
  DIMENSIONS: 1000, // Maximum number of active dimensions + disabled dimensions
  MEASURES: 1000, // Maximum number of active measures + disabled measures
};

export const AUTOCALENDAR_NAME = '.autoCalendar';

export const notSupportedError = new Error('Not supported in this object, need to implement in subclass.');

export const INITIAL_SORT_CRITERIAS = [
  {
    qSortByLoadOrder: 1,
    qSortByNumeric: 1,
    qSortByAscii: 1,
  },
];
