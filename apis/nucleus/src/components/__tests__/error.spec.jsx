import React from 'react';
import { create, act } from 'react-test-renderer';

const [{ default: Error }] = aw.mock([], ['../Error']);

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
    const title = renderer.root.find((el) => {
      return el.props['data-tid'] === 'error-title';
    });
    expect(title.props.children).to.equal('Error');
    const message = renderer.root.find((el) => {
      return el.props['data-tid'] === 'error-message';
    });
    expect(message.props.children).to.equal('');
  });

  it('should render error', async () => {
    await render('foo', 'bar', [{ path: 'baz', error: { qErrorCode: 1337 } }]);
    const title = renderer.root.find((el) => {
      return el.props['data-tid'] === 'error-title';
    });
    expect(title.props.children).to.equal('foo');
    const message = renderer.root.find((el) => {
      return el.props['data-tid'] === 'error-message';
    });
    expect(message.props.children).to.equal('bar');
    const data = renderer.root.find((el) => {
      return el.props.children && Array.isArray(el.props.children) ? el.props.children[0] === 'baz' : false;
    });
    expect(data.props).to.deep.equal({ variant: 'subtitle2', align: 'center', children: ['baz', ' ', '-', ' ', 1337] });
  });
});
