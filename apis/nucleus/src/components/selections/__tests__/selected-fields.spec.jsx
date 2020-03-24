/* eslint-disable no-param-reassign */
import React from 'react';
import { create, act } from 'react-test-renderer';
// import { modalObjectStore } from '../../../stores/selectionsStore';

describe('<SelectedFields />', () => {
  let sandbox;
  const MockedOneField = () => 'OneField';
  const MockedMultiState = () => 'MultiState';
  const MockedMore = () => 'More';
  let currentSelectionsModel;
  let useLayout;
  let SelectedFields;
  let rect;
  let modalObjectStore;

  before(() => {
    sandbox = sinon.createSandbox();
    useLayout = sandbox.stub();
    currentSelectionsModel = {
      id: 'current-selections',
    };
    modalObjectStore = {
      get: sandbox.stub().returns(false),
      set: sandbox.spy(),
    };

    [{ default: SelectedFields }] = aw.mock(
      [
        [
          require.resolve('@nebula.js/ui/theme'),
          () => ({ useTheme: () => ({ palette: { divider: 'red', background: { paper: 'pinky' } } }) }),
        ],
        [require.resolve('../OneField'), () => MockedOneField],
        [require.resolve('../MultiState'), () => MockedMultiState],
        [require.resolve('../More'), () => MockedMore],
        [require.resolve('../../../hooks/useCurrentSelectionsModel'), () => () => [currentSelectionsModel]],
        [require.resolve('../../../hooks/useLayout'), () => useLayout],
        [require.resolve('../../../hooks/useRect'), () => () => [() => {}, rect]],
        [require.resolve('../../../stores/selectionsStore'), () => ({ useModalObjectStore: () => [modalObjectStore] })],
      ],
      ['../SelectedFields']
    );
  });

  let render;
  let renderer;

  beforeEach(() => {
    rect = { width: 900 };
    const defaultApp = {
      id: 'selected-fields',
    };
    const defaultApi = {
      isInModal: sandbox.stub().returns(false),
    };

    render = async ({ api = {}, app = {}, rendererOptions } = {}) => {
      api = {
        ...defaultApi,
        ...api,
      };
      app = {
        ...defaultApp,
        ...app,
      };
      await act(async () => {
        renderer = create(<SelectedFields api={api} app={app} />, rendererOptions || null);
      });
    };
  });

  afterEach(() => {
    sandbox.reset();
    renderer.unmount();
  });

  it('should render `<OneField />`', async () => {
    const data = {
      qSelectionObject: {
        qSelections: [
          {
            qField: 'my-field',
          },
        ],
      },
    };
    useLayout.returns([data]);
    await render();
    renderer.root.findByType(MockedOneField);
    expect(() => renderer.root.findByType(MockedMultiState)).to.throw();
  });

  it('should render `<MultiState />`', async () => {
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
    useLayout.returns([data]);
    await render();
    renderer.root.findByType(MockedMultiState);
    expect(() => renderer.root.findByType(MockedOneField)).to.throw();
  });

  it('should keep item in modal state', async () => {
    modalObjectStore.get.returns({ genericType: 'njsListbox' });
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
    useLayout.onFirstCall().returns([data]);
    useLayout.onSecondCall().returns([data]);
    useLayout.onThirdCall().returns([newData]);
    useLayout.onCall(3).returns([newData]);
    await render();
    const types = renderer.root.findAllByType(MockedOneField);
    expect(types).to.have.length(3);
    expect(types[0].props.field.name).to.equal('my-field0');
    expect(types[1].props.field.name).to.equal('my-field1');
    expect(types[2].props.field.name).to.equal('my-field2');
  });

  it('should render `<More />`', async () => {
    rect = { width: 1 };
    const data = {
      qSelectionObject: {
        qSelections: [
          {
            qField: 'my-field',
          },
        ],
      },
    };
    useLayout.returns([data]);
    await render();
    renderer.root.findByType(MockedMore);
    expect(() => renderer.root.findByType(MockedOneField)).to.throw();
    expect(() => renderer.root.findByType(MockedMultiState)).to.throw();
  });
});
