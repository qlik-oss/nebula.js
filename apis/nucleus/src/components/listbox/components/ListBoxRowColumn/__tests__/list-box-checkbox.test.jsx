import React from 'react';
import renderer from 'react-test-renderer';
import { Checkbox } from '@mui/material';
import { createTheme, ThemeProvider } from '@nebula.js/ui/theme';
import ListBoxCheckbox from '../components/ListBoxCheckbox';

const checkClassName = (cb) => {
  expect(cb.props.className.split(' ')[0]).toBe('ListBoxCheckbox-checkbox');
};

const PREFIX = 'ListBoxCheckbox';

const clsPre = (s) => `${PREFIX}-${s}`;

async function render(content) {
  let testRenderer;
  await renderer.act(async () => {
    testRenderer = renderer.create(content);
  });
  return testRenderer;
}

describe('<ListBoxCheckbox />', () => {
  const theme = createTheme('dark');
  const styles = {
    header: {},
    content: {},
    selections: {},
  };
  const getRenderSetup = (component) => <ThemeProvider theme={theme}>{component}</ThemeProvider>;

  test('should render an unchecked checkbox', async () => {
    const testRenderer = await render(getRenderSetup(<ListBoxCheckbox styles={styles} label="just check it" />));
    const cbs = testRenderer.root.findAllByType(Checkbox);
    expect(cbs).toHaveLength(1);
    const [cb] = cbs;
    checkClassName(cb);
    expect(cb.props.checked).toBe(undefined);

    expect(cb.props.icon.props.className).toEqual(clsPre('cbIcon'));
    expect(cb.props.checkedIcon.props.className).toEqual(clsPre('cbIconChecked'));
    expect(cb.props.edge).toBe('start');
    expect(cb.props.disableRipple).toBe(true);
    expect(cb.props.tabIndex).toBe(undefined);
  });

  test('should render a checked checkbox', async () => {
    const testRenderer = await render(
      getRenderSetup(<ListBoxCheckbox styles={styles} checked label="just check it" />)
    );
    const cbs = testRenderer.root.findAllByType(Checkbox);
    expect(cbs).toHaveLength(1);
    const [cb] = cbs;
    checkClassName(cb);
    expect(cb.props.checked).toBe(true);
  });

  test('should render checkbox filled with excluded gray', async () => {
    const testRenderer = await render(
      getRenderSetup(<ListBoxCheckbox styles={styles} excluded label="filled with gray" />)
    );
    const cb = testRenderer.root.findByType(Checkbox);
    checkClassName(cb);
    expect(cb.props.icon.props.children.props.className).toEqual(clsPre('cbIconExcluded'));
  });

  test('should not render checkbox filled with excluded gray when showGray is false', async () => {
    const testRenderer = await render(
      getRenderSetup(<ListBoxCheckbox styles={styles} excluded showGray={false} label="filled with gray" />)
    );
    const cb = testRenderer.root.findByType(Checkbox);
    checkClassName(cb);
    expect(cb.props.icon.props.children.props.className).toBe('');
  });
});
