import React from 'react';
import renderer from 'react-test-renderer';

const MockedOneField = () => 'OneField';
const MockedMultiState = () => 'MultiState';
const [{ default: SelectedFields }] = aw.mock(
  [
    [
      require.resolve('@nebula.js/ui/theme'),
      () => ({ useTheme: () => ({ palette: { divider: 'red', background: { paper: 'pinky' } } }) }),
    ],
    [require.resolve('../OneField'), () => MockedOneField],
    [require.resolve('../MultiState'), () => MockedMultiState],
  ],
  ['../SelectedFields']
);

describe('<SelectedFields />', () => {
  it('should render `<OneField />`', () => {
    const data = {
      qSelectionObject: {
        qSelections: [
          {
            qField: 'my-field',
          },
        ],
      },
    };
    const on = sinon.spy();
    const api = {
      layout: sinon.stub().returns(data),
      on,
    };
    const testRenderer = renderer.create(<SelectedFields api={api} />);
    const testInstance = testRenderer.root;
    const types = testInstance.findAllByType(MockedOneField);
    expect(types).to.have.length(1);
  });
  it('should render `<MultiState />`', () => {
    const data = {
      alternateStates: [
        {
          stateName: '$',
          qSelectionObject: {
            qSelections: [
              {
                qField: 'my-field',
              },
            ],
          },
        },
        {
          stateName: 'foo',
          qSelectionObject: {
            qSelections: [
              {
                qField: 'my-field',
              },
            ],
          },
        },
      ],
    };
    const on = sinon.spy();
    const api = {
      layout: sinon.stub().returns(data),
      on,
    };
    const testRenderer = renderer.create(<SelectedFields api={api} />);
    const testInstance = testRenderer.root;
    const types = testInstance.findAllByType(MockedMultiState);
    expect(types).to.have.length(1);
  });
  it('should listen on `changed`, `modal-unset` events', () => {
    const data = {
      qSelectionObject: {
        qSelections: [
          {
            qField: 'my-field',
          },
        ],
      },
    };
    const on = sinon.spy();
    const api = {
      layout: sinon.stub().returns(data),
      on,
    };
    const testRenderer = renderer.create(<SelectedFields api={api} />);
    testRenderer.update(<SelectedFields api={api} />);
    expect(on.firstCall).to.have.been.calledWith('changed', sinon.match.func);
    expect(on.secondCall).to.have.been.calledWith('modal-unset', sinon.match.func);
  });
  it('should set items', () => {
    const data = {
      qSelectionObject: {
        qSelections: [
          {
            qField: 'my-field',
          },
        ],
      },
    };
    const on = sinon.stub();
    const removeListener = sinon.spy();
    const isInModal = sinon.stub();
    const api = {
      layout: sinon.stub().returns(data),
      on,
      removeListener,
      isInModal,
    };
    const testRenderer = renderer.create(<SelectedFields api={api} />);
    testRenderer.update(<SelectedFields api={api} />);
    const testInstance = testRenderer.root;
    isInModal.returns(false);
    on.firstCall.callArg(1);
    const types = testInstance.findAllByType(MockedOneField);
    expect(types).to.have.length(1);
  });
  it('should keep item in modal state', () => {
    const data = {
      qSelectionObject: {
        qSelections: [
          {
            qField: 'my-field0',
          },
          {
            qField: 'my-field1',
          },
          {
            qField: 'my-field2',
          },
        ],
      },
    };
    const newData = {
      qSelectionObject: {
        qSelections: [
          {
            qField: 'my-field0',
          },
          {
            qField: 'my-field2',
          },
        ],
      },
    };
    const on = sinon.stub();
    const removeListener = sinon.spy();
    const isInModal = sinon.stub();
    const api = {
      layout: sinon.stub(),
      on,
      removeListener,
      isInModal,
    };
    api.layout.onFirstCall().returns(data);
    api.layout.onSecondCall().returns(data);
    api.layout.onThirdCall().returns(newData);
    const testRenderer = renderer.create(<SelectedFields api={api} />);
    testRenderer.update(<SelectedFields api={api} />);
    const testInstance = testRenderer.root;
    isInModal.returns(true);
    on.firstCall.callArg(1);
    const types = testInstance.findAllByType(MockedOneField);
    expect(types).to.have.length(3);
    expect(types[0].props.field.name).to.equal('my-field0');
    expect(types[1].props.field.name).to.equal('my-field1');
    expect(types[2].props.field.name).to.equal('my-field2');
  });
  it('should not run keep item in modal state when doing new selection', () => {
    const data = {
      qSelectionObject: {
        qSelections: [],
      },
    };
    const newData = {
      qSelectionObject: {
        qSelections: [
          {
            qField: 'my-field0',
          },
        ],
      },
    };
    const on = sinon.stub();
    const removeListener = sinon.spy();
    const isInModal = sinon.stub();
    const api = {
      layout: sinon.stub(),
      on,
      removeListener,
      isInModal,
    };
    api.layout.onFirstCall().returns(data);
    api.layout.onSecondCall().returns(data);
    api.layout.onThirdCall().returns(newData);
    const testRenderer = renderer.create(<SelectedFields api={api} />);
    testRenderer.update(<SelectedFields api={api} />);
    const testInstance = testRenderer.root;
    isInModal.returns(true);
    on.firstCall.callArg(1);
    const types = testInstance.findAllByType(MockedOneField);
    expect(types).to.have.length(1);
    expect(types[0].props.field.name).to.equal('my-field0');
  });
});
