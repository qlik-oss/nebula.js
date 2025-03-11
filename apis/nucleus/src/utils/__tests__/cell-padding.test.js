import getPadding from '../cell-padding';

describe('cell padding', () => {
  let testFn;
  let titleStyles;

  beforeEach(() => {
    titleStyles = {
      main: {},
      subTitle: {},
      footer: {},
    };
    testFn = ({
      flagOn,
      disableCellPadding = false,
      cardTheme = false,
      isError = false,
      showTitles = false,
      title = false,
      subtitle = false,
      footer = false,
      visualization = 'barchart',
    }) => {
      const halo = {
        public: {
          galaxy: {
            flags: {
              isEnabled: () => flagOn,
            },
          },
          theme: {
            getStyle: () => (cardTheme ? true : undefined),
          },
        },
      };
      const layout = {
        showTitles,
        title: title ? 'yes' : '',
        subtitle: subtitle ? 'yes' : '',
        footnote: footer ? 'yes' : '',
        visualization,
      };
      const theme = {
        spacing: (n) => `theme.spacing(${n})`,
      };
      return getPadding({ disableCellPadding, halo, layout, isError, theme, titleStyles });
    };
  });

  test('should default to theme.spacing() without flag', () => {
    const { cellPadding, bodyPadding } = testFn({ flagOn: false });
    expect(cellPadding).toBe('theme.spacing(1)');
    expect(bodyPadding).toBeUndefined();
  });

  test('disableCellPadding true return undefined', () => {
    const { cellPadding, bodyPadding } = testFn({ disableCellPadding: true });
    expect(cellPadding).toBeUndefined();
    expect(bodyPadding).toBeUndefined();
  });

  test('not card theme return undefined', () => {
    const { cellPadding, bodyPadding } = testFn({ flagOn: true, cardTheme: false });
    expect(cellPadding).toBeUndefined();
    expect(bodyPadding).toBeUndefined();
  });

  test('card theme return bodyPadding', () => {
    const { cellPadding, bodyPadding } = testFn({ flagOn: true, cardTheme: true });
    expect(cellPadding).toBeUndefined();
    expect(bodyPadding).toBe('10px 10px 5px');
  });

  test('card theme with title, subtitel & footer should update titleStyles', () => {
    const { cellPadding, bodyPadding } = testFn({
      flagOn: true,
      cardTheme: true,
      showTitles: true,
      title: true,
      subtitle: true,
      footer: true,
    });
    expect(cellPadding).toBeUndefined();
    expect(bodyPadding).toBe('0 10px 0');
    expect(titleStyles.main.padding).toBe('10px 10px 0');
    expect(titleStyles.subTitle.padding).toBe('0 10px');
    expect(titleStyles.footer.padding).toBe('6px 10px');
    expect(titleStyles.footer.borderTop).toBe('1px solid #d9d9d9');
  });

  test('card theme with only subtitel', () => {
    const { cellPadding, bodyPadding } = testFn({
      flagOn: true,
      cardTheme: true,
      showTitles: true,
      subtitle: true,
    });
    expect(cellPadding).toBeUndefined();
    expect(bodyPadding).toBe('0 10px 5px');
    expect(titleStyles.main.padding).toBeUndefined();
    expect(titleStyles.subTitle.padding).toBe('10px 10px 0');
    expect(titleStyles.footer.padding).toBeUndefined();
    expect(titleStyles.footer.borderTop).toBeUndefined();
  });

  test('card theme with only footer', () => {
    const { cellPadding, bodyPadding } = testFn({
      flagOn: true,
      cardTheme: true,
      showTitles: true,
      footer: true,
    });
    expect(cellPadding).toBeUndefined();
    expect(bodyPadding).toBe('10px 10px 0');
    expect(titleStyles.main.padding).toBeUndefined();
    expect(titleStyles.subTitle.padding).toBeUndefined();
    expect(titleStyles.footer.padding).toBe('6px 10px');
    expect(titleStyles.footer.borderTop).toBe('1px solid #d9d9d9');
  });

  test('card theme with sn-filter-pane visualization type the do not include padding', () => {
    const { cellPadding, bodyPadding } = testFn({
      flagOn: true,
      cardTheme: true,
      visualization: 'sn-filter-pane',
    });
    expect(cellPadding).toBeUndefined();
    expect(bodyPadding).toBeUndefined();
  });

  test('card theme with action-button visualization do not include padding', () => {
    const { cellPadding, bodyPadding } = testFn({
      flagOn: true,
      cardTheme: true,
      visualization: 'action-button',
    });
    expect(cellPadding).toBeUndefined();
    expect(bodyPadding).toBeUndefined();
  });

  test('card theme with action-button visualization do include padding if showTitels is true', () => {
    const { cellPadding, bodyPadding } = testFn({
      flagOn: true,
      cardTheme: true,
      visualization: 'action-button',
      showTitles: true,
    });
    expect(cellPadding).toBeUndefined();
    expect(bodyPadding).toBe('10px 10px 5px');
  });

  test('card theme with sn-filter-pane visualization type the do include footer styling', () => {
    const { cellPadding, bodyPadding } = testFn({
      flagOn: true,
      cardTheme: true,
      visualization: 'sn-filter-pane',
      showTitles: true,
      footer: true,
    });
    expect(cellPadding).toBeUndefined();
    expect(bodyPadding).toBeUndefined();
    expect(titleStyles.footer.padding).toBe('6px 10px');
    expect(titleStyles.footer.borderTop).toBe('1px solid #d9d9d9');
  });

  test('not card theme with sn-filter-pane visualization', () => {
    const { cellPadding, bodyPadding } = testFn({
      flagOn: true,
      cardTheme: false,
      visualization: 'sn-filter-pane',
      showTitles: true,
      footer: true,
    });
    expect(cellPadding).toBeUndefined();
    expect(bodyPadding).toBeUndefined();
    expect(titleStyles.footer.padding).toBeUndefined();
    expect(titleStyles.footer.borderTop).toBeUndefined();
  });
});
