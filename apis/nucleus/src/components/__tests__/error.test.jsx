import React from 'react';
import { create, act } from 'react-test-renderer';
import WarningTriangle from '@nebula.js/ui/icons/warning-triangle-2';
import Tick from '@nebula.js/ui/icons/tick';
import * as nebulaUIThemeModule from '@nebula.js/ui/theme';
import * as useRectModule from '../../hooks/useRect';

import Error, { Descriptions, DescriptionRow } from '../Error';

jest.mock('@nebula.js/ui/theme', () => ({ ...jest.requireActual('@nebula.js/ui/theme') }));

describe('<Error />', () => {
  let renderer;
  let render;
  let mockRects;
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
    mockRects = (containerRect, baseContentRect, descriptionsMeasureRect) => {
      jest
        .spyOn(useRectModule, 'default')
        .mockImplementationOnce(() => [() => {}, containerRect])
        .mockImplementationOnce(() => [() => {}, baseContentRect])
        .mockImplementationOnce(() => [() => {}, descriptionsMeasureRect]);
    };
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
    mockRects({ width: 400, height: 400 }, { width: 100, height: 100 }, { width: 200, height: 100 });
    await render('foo', 'bar', [{ title: 'foo', descriptions: [] }]);
    const title = renderer.root.find((el) => el.props['data-tid'] === 'error-title');
    expect(title.props.children).toBe('foo');
    const msg = renderer.root.find((el) => el.props['data-tid'] === 'error-message');
    expect(msg.props.children).toBe('bar');
  });

  test('should render visible and measured descriptions when they fit', async () => {
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
    mockRects({ width: 400, height: 400 }, { width: 100, height: 100 }, { width: 200, height: 100 });
    await render('foo', 'bar', data);
    const lists = renderer.root.findAllByType(Descriptions);
    const rows = renderer.root.findAllByType(DescriptionRow);
    expect(lists).toHaveLength(2);
    expect(rows).toHaveLength(12);
    const w = renderer.root.findAllByType(WarningTriangle);
    const t = renderer.root.findAllByType(Tick);
    expect(w).toHaveLength(7);
    expect(t).toHaveLength(6);
  });

  test('should only render measured descriptions when a second column would overflow', async () => {
    const data = [
      {
        title: 'Dimensions',
        descriptions: [{ description: 'd-1', label: 'l-1' }],
      },
    ];

    mockRects({ width: 250, height: 150 }, { width: 100, height: 100 }, { width: 200, height: 100 });
    await render('foo', 'bar', data);

    const lists = renderer.root.findAllByType(Descriptions);
    const rows = renderer.root.findAllByType(DescriptionRow);
    expect(lists).toHaveLength(1);
    expect(rows).toHaveLength(1);
  });
});
