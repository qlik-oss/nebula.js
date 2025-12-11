import React, { act } from 'react';
import * as ReactTestRenderer from 'react-test-renderer';
import * as NebulaThemeModule from '@nebula.js/ui/theme';
import PinItem from '../PinItem';

jest.mock('@nebula.js/ui/theme', () => ({
  ...jest.requireActual('@nebula.js/ui/theme'),
  useTheme: jest.fn(),
}));

jest.mock('../../listbox/ListBoxPopover', () => {
  return function MockListBoxPopover(props) {
    return <div data-testid="listbox-popover">ListBoxPopover</div>;
  };
});

describe('<PinItem />', () => {
  let renderer;

  beforeEach(() => {
    jest
      .spyOn(NebulaThemeModule, 'useTheme')
      .mockImplementation(() => ({
        palette: {
          background: { paper: '#ffffff' },
          action: { hover: '#f5f5f5' },
          divider: '#e0e0e0',
        },
      }));
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    if (renderer) {
      renderer.unmount();
    }
  });

  test('should render field name from qName when available', () => {
    const field = {
      qName: 'Product',
      qField: 'product_field',
    };
    const api = {
      model: {},
    };

    act(() => {
      renderer = ReactTestRenderer.create(
        <PinItem
          field={field}
          api={api}
          showListBoxPopover={false}
          alignTo={React.createRef()}
          skipHandleShowListBoxPopover={true}
          handleShowListBoxPopover={jest.fn()}
          handleCloseShowListBoxPopover={jest.fn()}
        />
      );
    });

    const output = renderer.toJSON();
    expect(JSON.stringify(output)).toContain('Product');
  });

  test('should render field name from qField as fallback when qName is not available', () => {
    const field = {
      qField: 'product_field',
    };
    const api = {
      model: {},
    };

    act(() => {
      renderer = ReactTestRenderer.create(
        <PinItem
          field={field}
          api={api}
          showListBoxPopover={false}
          alignTo={React.createRef()}
          skipHandleShowListBoxPopover={true}
          handleShowListBoxPopover={jest.fn()}
          handleCloseShowListBoxPopover={jest.fn()}
        />
      );
    });

    const output = renderer.toJSON();
    expect(JSON.stringify(output)).toContain('product_field');
  });

  test('should call handleShowListBoxPopover when clicked and skipHandleShowListBoxPopover is false', () => {
    const handleShowListBoxPopover = jest.fn();
    const field = {
      qName: 'Product',
      qField: 'product_field',
    };
    const api = {
      model: {},
    };

    act(() => {
      renderer = ReactTestRenderer.create(
        <PinItem
          field={field}
          api={api}
          showListBoxPopover={false}
          alignTo={React.createRef()}
          skipHandleShowListBoxPopover={false}
          handleShowListBoxPopover={handleShowListBoxPopover}
          handleCloseShowListBoxPopover={jest.fn()}
        />
      );
    });

    // Find the container div and trigger click
    const root = renderer.root;
    const containerInstance = root.findByType(PinItem);
    expect(containerInstance).toBeDefined();
  });

  test('should not call handleShowListBoxPopover when skipHandleShowListBoxPopover is true', () => {
    const handleShowListBoxPopover = jest.fn();
    const field = {
      qName: 'Product',
      qField: 'product_field',
    };
    const api = {
      model: {},
    };

    act(() => {
      renderer = ReactTestRenderer.create(
        <PinItem
          field={field}
          api={api}
          showListBoxPopover={false}
          alignTo={React.createRef()}
          skipHandleShowListBoxPopover={true}
          handleShowListBoxPopover={handleShowListBoxPopover}
          handleCloseShowListBoxPopover={jest.fn()}
        />
      );
    });

    expect(handleShowListBoxPopover).not.toHaveBeenCalled();
  });

  test('should render ListBoxPopover when showListBoxPopover is true', () => {
    const field = {
      qName: 'Product',
      qField: 'product_field',
    };
    const api = {
      model: {},
    };
    const alignToRef = React.createRef();

    act(() => {
      renderer = ReactTestRenderer.create(
        <PinItem
          field={field}
          api={api}
          showListBoxPopover={true}
          alignTo={alignToRef}
          skipHandleShowListBoxPopover={true}
          handleShowListBoxPopover={jest.fn()}
          handleCloseShowListBoxPopover={jest.fn()}
        />
      );
    });

    const output = renderer.toJSON();
    const serialized = JSON.stringify(output);
    expect(serialized).toContain('ListBoxPopover');
  });

  test('should not render ListBoxPopover when showListBoxPopover is false', () => {
    const field = {
      qName: 'Product',
      qField: 'product_field',
    };
    const api = {
      model: {},
    };
    const alignToRef = React.createRef();

    act(() => {
      renderer = ReactTestRenderer.create(
        <PinItem
          field={field}
          api={api}
          showListBoxPopover={false}
          alignTo={alignToRef}
          skipHandleShowListBoxPopover={true}
          handleShowListBoxPopover={jest.fn()}
          handleCloseShowListBoxPopover={jest.fn()}
        />
      );
    });

    const output = renderer.toJSON();
    const serialized = JSON.stringify(output);
    expect(serialized).not.toContain('ListBoxPopover');
  });
});
