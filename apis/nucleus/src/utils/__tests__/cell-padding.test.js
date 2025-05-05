import getPadding from '../cell-padding';
import * as generateFiltersInfo from '../generateFiltersInfo';

describe('cell padding', () => {
  let testFn;
  let titleStyles;

  beforeEach(() => {
    jest.spyOn(generateFiltersInfo, 'generateFiltersString').mockReturnValue('filters string');
    titleStyles = {
      main: {},
      subTitle: {},
      footer: {},
    };
    testFn = ({
      isCardTheme = true,
      isError = false,
      showTitles = false,
      title = false,
      subtitle = false,
      footer = false,
      visualization = 'barchart',
      footerFilter = false,
    }) => {
      const layout = {
        showTitles,
        title: title ? 'yes' : '',
        subtitle: subtitle ? 'yes' : '',
        footnote: footer ? 'yes' : '',
        filters: footerFilter ? [{}] : [],
        qHyperCube: { qMeasureInfo: [{}] },
        visualization,
      };
      return getPadding({ layout, isError, isCardTheme, titleStyles });
    };
  });

  test('not card theme return undefined', () => {
    const bodyPadding = testFn({ isCardTheme: false });
    expect(bodyPadding).toBeUndefined();
  });

  test('card theme return bodyPadding', () => {
    const bodyPadding = testFn({ isCardTheme: true });
    expect(bodyPadding).toBe('10px 10px 5px');
  });

  test('card theme with title, subtitel & footer should update titleStyles', () => {
    const bodyPadding = testFn({
      isCardTheme: true,
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

  test('card theme with only subtitle', () => {
    const bodyPadding = testFn({
      isCardTheme: true,
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
      isCardTheme: true,
      showTitles: true,
      footer: true,
    });
    expect(bodyPadding).toBe('10px 10px 0');
    expect(titleStyles.main.padding).toBeUndefined();
    expect(titleStyles.subTitle.padding).toBeUndefined();
    expect(titleStyles.footer.padding).toBe('6px 10px');
    expect(titleStyles.footer.borderTop).toBe('1px solid #d9d9d9');
  });

  test('card theme with only filters info in footer', () => {
    const bodyPadding = testFn({
      isCardTheme: true,
      showTitles: true,
      footer: false,
      footerFilter: true,
    });
    expect(bodyPadding).toBe('10px 10px 0');
    expect(titleStyles.main.padding).toBeUndefined();
    expect(titleStyles.subTitle.padding).toBeUndefined();
    expect(titleStyles.footer.padding).toBe('6px 10px');
    expect(titleStyles.footer.borderTop).toBe('1px solid #d9d9d9');
  });

  test('card theme with sn-filter-pane visualization type the do not include padding', () => {
    const bodyPadding = testFn({
      isCardTheme: true,
      visualization: 'sn-filter-pane',
    });
    expect(bodyPadding).toBeUndefined();
  });

  test('card theme with action-button visualization do not include padding', () => {
    const bodyPadding = testFn({
      isCardTheme: true,
      visualization: 'action-button',
    });
    expect(bodyPadding).toBeUndefined();
  });

  test('card theme with action-button visualization do include padding if showTitels is true', () => {
    const bodyPadding = testFn({
      isCardTheme: true,
      visualization: 'action-button',
      showTitles: true,
    });
    expect(bodyPadding).toBe('10px 10px 5px');
  });

  test('card theme with sn-filter-pane visualization type the do include footer styling', () => {
    const bodyPadding = testFn({
      isCardTheme: true,
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
      isCardTheme: false,
      visualization: 'sn-filter-pane',
      showTitles: true,
      footer: true,
    });
    expect(bodyPadding).toBeUndefined();
    expect(titleStyles.footer.padding).toBeUndefined();
    expect(titleStyles.footer.borderTop).toBeUndefined();
  });
});
