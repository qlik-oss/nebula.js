import React from 'react';
import renderer from 'react-test-renderer';
import { OutlinedInput } from '@material-ui/core';

const InstanceContext = React.createContext();
const [{ default: ListBoxSearch }] = aw.mock(
  [
    [require.resolve('../../../contexts/InstanceContext'), () => InstanceContext],
    [require.resolve('@nebula.js/ui/theme'), () => ({ makeStyles: () => () => ({}) })],
  ],
  ['../ListBoxSearch']
);

describe('<ListBoxSearch />', () => {
  it('should have default props', () => {
    const model = {
      searchListObjectFor: sinon.spy(),
      acceptListObjectSearch: sinon.spy(),
      abortListObjectSearch: sinon.spy(),
    };
    const testRenderer = renderer.create(
      <InstanceContext.Provider value={{ translator: { get: () => 'Search' } }}>
        <ListBoxSearch model={model} />
      </InstanceContext.Provider>
    );
    const testInstance = testRenderer.root;
    const types = testInstance.findAllByType(OutlinedInput);
    expect(types).to.have.length(1);
    expect(types[0].props.fullWidth).to.equal(true);
    expect(types[0].props.autoFocus).to.equal(true);
    expect(types[0].props.placeholder).to.equal('Search');
    expect(types[0].props.value).to.equal('');
    expect(types[0].props.onChange).to.be.a('function');
    expect(types[0].props.onKeyDown).to.be.a('function');
  });
  it('should update `OutlinedInput` and search `onChange`', () => {
    const model = {
      searchListObjectFor: sinon.spy(),
      acceptListObjectSearch: sinon.spy(),
      abortListObjectSearch: sinon.spy(),
    };
    const testRenderer = renderer.create(
      <InstanceContext.Provider value={{ translator: { get: () => 'Search' } }}>
        <ListBoxSearch model={model} />
      </InstanceContext.Provider>
    );
    const testInstance = testRenderer.root;
    let type = testInstance.findByType(OutlinedInput);
    type.props.onChange({ target: { value: 'foo' } });
    testRenderer.update(
      <InstanceContext.Provider value={{ translator: { get: () => 'Search' } }}>
        <ListBoxSearch model={model} />
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
        <ListBoxSearch model={model} />
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
        <ListBoxSearch model={model} />
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
