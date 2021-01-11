import React from 'react';
import { create, act } from 'react-test-renderer';

import WarningTriangle from '@nebula.js/ui/icons/warning-triangle-2';
import Tick from '@nebula.js/ui/icons/tick';

const [{ default: Error, Descriptions, DescriptionRow }] = aw.mock(
  [
    [
      require.resolve('@nebula.js/ui/theme'),
      () => ({
        useTheme: () => ({
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
        }),
      }),
    ],
  ],
  ['../Error']
);

describe('<Error />', () => {
  let sandbox;
  let renderer;
  let render;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    render = async (title, message, data) => {
      await act(async () => {
        renderer = create(<Error title={title} message={message} data={data} />);
      });
    };
  });
  afterEach(() => {
    sandbox.restore();
    renderer.unmount();
  });
  it('should render default error', async () => {
    await render();
    const title = renderer.root.find((el) => el.props['data-tid'] === 'error-title');
    expect(title.props.children).to.equal('Error');
    const message = renderer.root.find((el) => el.props['data-tid'] === 'error-message');
    expect(message.props.children).to.equal('');
  });

  it('should render error', async () => {
    await render('foo', 'bar', [{ title: 'foo', descriptions: [] }]);
    const title = renderer.root.find((el) => el.props['data-tid'] === 'error-title');
    expect(title.props.children).to.equal('foo');
    const msg = renderer.root.find((el) => el.props['data-tid'] === 'error-message');
    expect(msg.props.children).to.equal('bar');
  });

  it('should render error with descriptions', async () => {
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
    expect(rows).to.have.length(6);
    const w = list.findAllByType(WarningTriangle);
    const t = list.findAllByType(Tick);
    expect(w).to.have.length(3);
    expect(t).to.have.length(3);
  });
});
