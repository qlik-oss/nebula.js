import React from 'react';
import renderer from 'react-test-renderer';
import { TextField } from '@nebula.js/ui/components';

const LocaleContext = React.createContext();
const [{ default: ListBoxSearch }] = aw.mock(
  [
    [require.resolve('../../../contexts/LocaleContext'), () => LocaleContext],
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
      <LocaleContext.Provider value={{ get: () => 'Search' }}>
        <ListBoxSearch model={model} />
      </LocaleContext.Provider>
    );
    const testInstance = testRenderer.root;
    const types = testInstance.findAllByType(TextField);
    expect(types).to.have.length(1);
    expect(types[0].props.fullWidth).to.equal(true);
    expect(types[0].props.autoFocus).to.equal(true);
    expect(types[0].props.placeholder).to.equal('Search');
    expect(types[0].props.value).to.equal('');
    expect(types[0].props.onChange).to.be.a('function');
    expect(types[0].props.onKeyDown).to.be.a('function');
  });
  it('should update `TextField` and search `onChange`', () => {
    const model = {
      searchListObjectFor: sinon.spy(),
      acceptListObjectSearch: sinon.spy(),
      abortListObjectSearch: sinon.spy(),
    };
    const testRenderer = renderer.create(
      <LocaleContext.Provider value={{ get: () => 'Search' }}>
        <ListBoxSearch model={model} />
      </LocaleContext.Provider>
    );
    const testInstance = testRenderer.root;
    let type = testInstance.findByType(TextField);
    type.props.onChange({ target: { value: 'foo' } });
    testRenderer.update(
      <LocaleContext.Provider value={{ get: () => 'Search' }}>
        <ListBoxSearch model={model} />
      </LocaleContext.Provider>
    );
    expect(model.searchListObjectFor).to.have.been.calledWith('/qListObjectDef', 'foo');
    type = testInstance.findByType(TextField);
    expect(type.props.value).to.equal('foo');
  });
  it('should reset `TextField` and `acceptListObjectSearch` on `Enter`', () => {
    const model = {
      searchListObjectFor: sinon.spy(),
      acceptListObjectSearch: sinon.spy(),
      abortListObjectSearch: sinon.spy(),
    };
    const testRenderer = renderer.create(
      <LocaleContext.Provider value={{ get: () => 'Search' }}>
        <ListBoxSearch model={model} />
      </LocaleContext.Provider>
    );
    const testInstance = testRenderer.root;
    const type = testInstance.findByType(TextField);
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
      <LocaleContext.Provider value={{ get: () => 'Search' }}>
        <ListBoxSearch model={model} />
      </LocaleContext.Provider>
    );
    const testInstance = testRenderer.root;
    const type = testInstance.findByType(TextField);
    type.props.onChange({ target: { value: 'foo' } });
    expect(type.props.value).to.equal('foo');
    type.props.onKeyDown({ key: 'Escape' });
    expect(model.abortListObjectSearch).to.have.been.calledWith('/qListObjectDef');
    expect(type.props.value).to.equal('foo');
  });
});
