/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import renderer from 'react-test-renderer';
import { Radio } from '@mui/material';
import { createTheme, ThemeProvider } from '@nebula.js/ui/theme';
import ListBoxRadioButton from '../components/ListBoxRadioButton';

const PREFIX = 'ListBoxRadioButton';

async function render(content) {
  let testRenderer;
  await renderer.act(async () => {
    testRenderer = renderer.create(content);
  });
  return testRenderer;
}

describe('<ListBoxRadioButton />', () => {
  const theme = createTheme('dark');
  const getRenderSetup = (component) => <ThemeProvider theme={theme}>{component}</ThemeProvider>;

  let onChange;
  let label;
  let styles;

  beforeEach(() => {
    onChange = jest.fn();
    label = 'Check it out';
    styles = {
      content: {
        color: '#content-color',
      },
      selections: {
        selected: '#selected',
      },
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('should render an unchecked radio button', async () => {
    const testRenderer = await render(
      getRenderSetup(
        <ListBoxRadioButton onChange={onChange} label={label} dataN={2} styles={styles} value={label} name={label} />
      )
    );
    const radios = testRenderer.root.findAllByType(Radio);
    expect(radios).toHaveLength(1);
    const [radio] = radios;
    expect(radio.props.className.split(' ')[0]).toBe(`${PREFIX}-radioButton`);
    expect(radio.props.checked).not.toBe(true);
  });

  test('should render a checked dense radio button', async () => {
    const testRenderer = await render(
      getRenderSetup(
        <ListBoxRadioButton
          onChange={onChange}
          label={label}
          dataN={2}
          styles={styles}
          value={label}
          name={label}
          checked
          dense
        />
      )
    );
    const [radio] = testRenderer.root.findAllByType(Radio);
    expect(radio.props.className.split(' ')[0]).toBe(`${PREFIX}-radioButton`);
    expect(radio.props.checked).toBe(true);
  });
});
