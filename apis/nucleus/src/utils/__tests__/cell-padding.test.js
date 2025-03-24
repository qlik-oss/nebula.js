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
      cardTheme = false,
      isError = false,
      showTitles = false,
      title = false,
      subtitle = false,
      footer = false,
      visualization = 'barchart',
    }) => {
      const senseTheme = {
        getStyle: () => (cardTheme ? true : undefined),
      };
      const layout = {
        showTitles,
        title: title ? 'yes' : '',
        subtitle: subtitle ? 'yes' : '',
        footnote: footer ? 'yes' : '',
        visualization,
      };
      return getPadding({ layout, isError, senseTheme, titleStyles });
    };
  });

  test('not card theme return undefined', () => {
    const bodyPadding = testFn({ cardTheme: false });
    expect(bodyPadding).toBeUndefined();
  });

  test('card theme return bodyPadding', () => {
    const bodyPadding = testFn({ cardTheme: true });
    expect(bodyPadding).toBe('10px 10px 5px');
  });

  test('card theme with title, subtitel & footer should update titleStyles', () => {
    const bodyPadding = testFn({
      cardTheme: true,
      showTitles: true,
      title: true,
      subtitle: true,
      footer: true,
    });
    expect(bodyPadding).toBe('0 10px 0');
    expect(titleStyles.main.padding).toBe('10px 10px 0');
    expect(titleStyles.subTitle.padding).toBe('0 10px');
    expect(titleStyles.footer.padding).toBe('6px 10px');
    expect(titleStyles.footer.borderTop).toBe('1px solid #d9d9d9');
  });

  test('card theme with only subtitel', () => {
    const bodyPadding = testFn({
      cardTheme: true,
      showTitles: true,
      subtitle: true,
    });
    expect(bodyPadding).toBe('0 10px 5px');
    expect(titleStyles.main.padding).toBeUndefined();
    expect(titleStyles.subTitle.padding).toBe('10px 10px 0');
    expect(titleStyles.footer.padding).toBeUndefined();
    expect(titleStyles.footer.borderTop).toBeUndefined();
  });

  test('card theme with only footer', () => {
    const bodyPadding = testFn({
      cardTheme: true,
      showTitles: true,
      footer: true,
    });
    expect(bodyPadding).toBe('10px 10px 0');
    expect(titleStyles.main.padding).toBeUndefined();
    expect(titleStyles.subTitle.padding).toBeUndefined();
    expect(titleStyles.footer.padding).toBe('6px 10px');
    expect(titleStyles.footer.borderTop).toBe('1px solid #d9d9d9');
  });

  test('card theme with sn-filter-pane visualization type the do not include padding', () => {
    const bodyPadding = testFn({
      cardTheme: true,
      visualization: 'sn-filter-pane',
    });
    expect(bodyPadding).toBeUndefined();
  });

  test('card theme with action-button visualization do not include padding', () => {
    const bodyPadding = testFn({
      cardTheme: true,
      visualization: 'action-button',
    });
    expect(bodyPadding).toBeUndefined();
  });

  test('card theme with action-button visualization do include padding if showTitels is true', () => {
    const bodyPadding = testFn({
      cardTheme: true,
      visualization: 'action-button',
      showTitles: true,
    });
    expect(bodyPadding).toBe('10px 10px 5px');
  });

  test('card theme with sn-filter-pane visualization type the do include footer styling', () => {
    const bodyPadding = testFn({
      cardTheme: true,
      visualization: 'sn-filter-pane',
      showTitles: true,
      footer: true,
    });
    expect(bodyPadding).toBeUndefined();
    expect(titleStyles.footer.padding).toBe('6px 10px');
    expect(titleStyles.footer.borderTop).toBe('1px solid #d9d9d9');
  });

  test('not card theme with sn-filter-pane visualization', () => {
    const bodyPadding = testFn({
      cardTheme: false,
      visualization: 'sn-filter-pane',
      showTitles: true,
      footer: true,
    });
    expect(bodyPadding).toBeUndefined();
    expect(titleStyles.footer.padding).toBeUndefined();
    expect(titleStyles.footer.borderTop).toBeUndefined();
  });
});
