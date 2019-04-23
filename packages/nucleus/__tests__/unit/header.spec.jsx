import React from 'react';
import renderer from 'react-test-renderer';

import Header from '../../src/components/Header';

describe('<Header />', () => {
  it('should be empty when input is falsy', () => {
    expect(renderer.create(<Header />).toJSON()).to.equal(null);
    expect(renderer.create(<Header layout={{ showTitles: true }} />).toJSON()).to.equal(null);
  });

  it('should render a title', () => {
    const layout = { showTitles: true, title: 'foo' };
    const [{ default: MockedHeader }] = aw.mock([
      ['**/Text.jsx', () => ({ children, ...p }) => <span {...p}>{children}</span>],
    ], ['../../src/components/Header']);
    const tree = renderer.create(<MockedHeader layout={layout} />).toJSON();
    expect(tree).to.eql({
      type: 'div',
      props: {
        style: { background: 'transparent', padding: '0 8px' },
      },
      children: [{
        type: 'span',
        props: { block: true, nowrap: true, size: 'large' },
        children: ['foo'],
      }, {
        type: 'span',
        props: {
          faded: true,
          block: true,
          nowrap: true,
          size: 'small',
        },
        children: null,
      }],
    });
  });

  it('should render a subtitle', () => {
    const layout = { showTitles: true, subtitle: 'foo' };
    const [{ default: MockedHeader }] = aw.mock([
      ['**/Text.jsx', () => ({ children, ...p }) => <span {...p}>{children}</span>],
    ], ['../../src/components/Header']);
    const tree = renderer.create(<MockedHeader layout={layout} />).toJSON();
    expect(tree).to.eql({
      type: 'div',
      props: {
        style: { background: 'transparent', padding: '0 8px' },
      },
      children: [{
        type: 'span',
        props: { block: true, nowrap: true, size: 'large' },
        children: null,
      }, {
        type: 'span',
        props: {
          faded: true,
          block: true,
          nowrap: true,
          size: 'small',
        },
        children: ['foo'],
      }],
    });
  });
});
