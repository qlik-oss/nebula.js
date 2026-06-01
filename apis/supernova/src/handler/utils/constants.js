export const TOTAL_MAX = {
  DIMENSIONS: 1000, // Maximum number of active dimensions + disabled dimensions
  MEASURES: 1000, // Maximum number of active measures + disabled measures
};

export const AUTOCALENDAR_NAME = '.autoCalendar';

export const INITIAL_SORT_CRITERIAS = [
  {
    qSortByLoadOrder: 1,
    qSortByNumeric: 1,
    qSortByAscii: 1,
  },
];

export const uid = () => {
  const idGen = [
    [10, 31],
    [0, 31],
    [0, 31],
    [0, 31],
    [0, 31],
    [0, 31],
  ];
  const toChar = ([min, max]) => min + ((Math.random() * (max - min)) | 0).toString(32);
  return idGen.map(toChar).join('');
};
