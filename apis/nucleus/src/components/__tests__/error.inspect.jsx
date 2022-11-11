import React from 'react';
import { create, act } from 'react-test-renderer';
import WarningTriangle from '@nebula.js/ui/icons/warning-triangle-2';
import Tick from '@nebula.js/ui/icons/tick';
import * as nebulaUIThemeModule from '@nebula.js/ui/theme';

import Error, { Descriptions, DescriptionRow } from '../Error';

jest.mock('@nebula.js/ui/theme', () => ({ ...jest.requireActual('@nebula.js/ui/theme') }));

describe('<Error />', () => {
  let renderer;
  let render;
  beforeEach(() => {
    // for getter functions of a module, we need to mock and jest.requireActual them as well to pass the getter step
    jest.spyOn(nebulaUIThemeModule, 'useTheme').mockImplementation(() => ({
      spacing: () => 0,
      palette: {
        success: {
          main: 'success',
        },
        warning: {
          maing: 'warning',
        },
        error: {
          main: 'error',
        },
      },
    }));
    render = async (title, message, data) => {
      await act(async () => {
        renderer = create(<Error title={title} message={message} data={data} />);
      });
    };
  });
  afterEach(() => {
    renderer.unmount();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });
  test('should render default error', async () => {
    await render();
    const title = renderer.root.find((el) => el.props['data-tid'] === 'error-title');
    expect(title.props.children).toBe('Error');
    const message = renderer.root.find((el) => el.props['data-tid'] === 'error-message');
    expect(message.props.children).toBe('');
  });

  test('should render error', async () => {
    await render('foo', 'bar', [{ title: 'foo', descriptions: [] }]);
    const title = renderer.root.find((el) => el.props['data-tid'] === 'error-title');
    expect(title.props.children).toBe('foo');
    const msg = renderer.root.find((el) => el.props['data-tid'] === 'error-message');
    expect(msg.props.children).toBe('bar');
  });

  test('should render error with descriptions', async () => {
    const d = [1, 2, 3, 4, 5, 6].map((n) => ({
      description: `d-${n}`,
      label: `l-${n}`,
      missing: n % 3 === 0,
      error: n % 5 === 0,
    }));
    const dims = {
      title: 'Dimensions',
      descriptions: d.slice(0, 3),
    };
    const meas = {
      title: 'Measures',
      descriptions: d.slice(3),
    };
    const data = [dims, meas];
    await render('foo', 'bar', data);
    const list = renderer.root.findByType(Descriptions);
    const rows = list.findAllByType(DescriptionRow);
    expect(rows.length).toBe(6);
    const w = list.findAllByType(WarningTriangle);
    const t = list.findAllByType(Tick);
    expect(w.length).toBe(3);
    expect(t.length).toBe(3);
  });
});
