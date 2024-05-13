const defaultLocaleInfo = {
  qDecimalSep: '.',
  qThousandSep: ',',
  qListSep: ',',
  qMoneyDecimalSep: '.',
  qMoneyThousandSep: ',',
  qCurrentYear: 2014,
  qMoneyFmt: '$#,##0.00;($#,##0.00)',
  qTimeFmt: 'h:mm:ss TT',
  qDateFmt: 'M/D/YYYY',
  qTimestampFmt: 'M/D/YYYY h:mm:ss[.fff] TT',
  qCalendarStrings: {
    qDayNames: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    qMonthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    qLongDayNames: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    qLongMonthNames: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
  },
  qFirstWeekDay: 6,
  qBrokenWeeks: true,
  qReferenceDay: 0,
  qFirstMonthOfYear: 1,
  qCollation: 'en-US',
};

function GetAppLayoutMock(appLocaleInfo) {
  return () => Promise.resolve({ id: 'app-layout', qLocaleInfo: appLocaleInfo || defaultLocaleInfo });
}

export default GetAppLayoutMock;
