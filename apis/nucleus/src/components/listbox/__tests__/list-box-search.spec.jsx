/* eslint-disable react/jsx-no-constructed-context-values */
import React from 'react';
import renderer from 'react-test-renderer';
import { OutlinedInput } from '@mui/material';

const InstanceContext = React.createContext();
const [{ default: ListBoxSearch }] = aw.mock(
  [[require.resolve('../../../contexts/InstanceContext'), () => InstanceContext]],
  ['../ListBoxSearch']
);

const keyboard = { enabled: false, active: true };

describe('<ListBoxSearch />', () => {
  beforeEach(() => {
    keyboard.enabled = false;
    keyboard.active = true;
  });

  it('should have default props', () => {
    const model = {
      searchListObjectFor: sinon.spy(),
      acceptListObjectSearch: sinon.spy(),
      abortListObjectSearch: sinon.spy(),
    };
    const testRenderer = renderer.create(
      <InstanceContext.Provider value={{ translator: { get: () => 'Search' } }}>
        <ListBoxSearch model={model} keyboard={keyboard} />
      </InstanceContext.Provider>
    );
    const testInstance = testRenderer.root;
    const types = testInstance.findAllByType(OutlinedInput);
    expect(types).to.have.length(1);
    expect(types[0].props.fullWidth).to.equal(true);
    expect(types[0].props.autoFocus).to.equal(undefined);
    expect(types[0].props.placeholder).to.equal('Search');
    expect(types[0].props.value).to.equal('');
    expect(types[0].props.onChange).to.be.a('function');
    expect(types[0].props.onKeyDown).to.be.a('function');
    expect(types[0].props.inputProps.tabIndex).to.equal(0);
  });
  it('should have css class `search`', () => {
    const model = {
      searchListObjectFor: sinon.spy(),
      acceptListObjectSearch: sinon.spy(),
      abortListObjectSearch: sinon.spy(),
    };

    keyboard.enabled = true;
    keyboard.active = false;

    const testRenderer = renderer.create(
      <InstanceContext.Provider value={{ translator: { get: () => 'Search' } }}>
        <ListBoxSearch model={model} keyboard={keyboard} />
      </InstanceContext.Provider>
    );
    const testInstance = testRenderer.root;
    const [input] = testInstance.findAllByType(OutlinedInput);
    const { className, inputProps } = input.props;
    expect(inputProps.tabIndex).to.equal(-1);
    expect(className).to.be.a('string');
    expect(className.split(' ')).to.include('search');
  });
  it('should update `OutlinedInput` and search `onChange`', () => {
    const model = {
      searchListObjectFor: sinon.spy(),
      acceptListObjectSearch: sinon.spy(),
      abortListObjectSearch: sinon.spy(),
    };
    const testRenderer = renderer.create(
      <InstanceContext.Provider value={{ translator: { get: () => 'Search' } }}>
        <ListBoxSearch model={model} keyboard={keyboard} />
      </InstanceContext.Provider>
    );
    const testInstance = testRenderer.root;
    let type = testInstance.findByType(OutlinedInput);
    type.props.onChange({ target: { value: 'foo' } });
    testRenderer.update(
      <InstanceContext.Provider value={{ translator: { get: () => 'Search' } }}>
        <ListBoxSearch model={model} keyboard={keyboard} />
      </InstanceContext.Provider>
    );
    expect(model.searchListObjectFor).to.have.been.calledWith('/qListObjectDef', 'foo');
    type = testInstance.findByType(OutlinedInput);
    expect(type.props.value).to.equal('foo');
  });
  it('should reset `OutlinedInput` and `acceptListObjectSearch` on `Enter`', () => {
    const model = {
      searchListObjectFor: sinon.spy(),
      acceptListObjectSearch: sinon.spy(),
      abortListObjectSearch: sinon.spy(),
    };
    const testRenderer = renderer.create(
      <InstanceContext.Provider value={{ translator: { get: () => 'Search' } }}>
        <ListBoxSearch model={model} keyboard={keyboard} />
      </InstanceContext.Provider>
    );
    const testInstance = testRenderer.root;
    const type = testInstance.findByType(OutlinedInput);
    type.props.onChange({ target: { value: 'foo' } });
    expect(type.props.value).to.equal('foo');
    type.props.onKeyDown({ key: 'Enter' });
    expect(model.acceptListObjectSearch).to.have.been.calledWith('/qListObjectDef', true);
    expect(type.props.value).to.equal('');
  });
  it('should `abortListObjectSearch` on `Escape`', () => {
    const model = {
      searchListObjectFor: sinon.spy(),
      acceptListObjectSearch: sinon.spy(),
      abortListObjectSearch: sinon.spy(),
    };
    const testRenderer = renderer.create(
      <InstanceContext.Provider value={{ translator: { get: () => 'Search' } }}>
        <ListBoxSearch model={model} keyboard={keyboard} />
      </InstanceContext.Provider>
    );
    const testInstance = testRenderer.root;
    const type = testInstance.findByType(OutlinedInput);
    type.props.onChange({ target: { value: 'foo' } });
    expect(type.props.value).to.equal('foo');
    type.props.onKeyDown({ key: 'Escape' });
    expect(model.abortListObjectSearch).to.have.been.calledWith('/qListObjectDef');
    expect(type.props.value).to.equal('foo');
  });
});
