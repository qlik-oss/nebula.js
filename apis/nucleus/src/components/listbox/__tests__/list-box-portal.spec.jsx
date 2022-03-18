import React from 'react';
import renderer from 'react-test-renderer';

const ListBoxInlineMock = ({ fieldDef }) => <div>{fieldDef}</div>;

const [{ ListBoxFetchMasterItem }] = aw.mock(
  [[require.resolve('../ListBoxInline'), () => ListBoxInlineMock]],
  ['../ListBoxPortal']
);

async function render(content) {
  let testRenderer;
  await renderer.act(async () => {
    testRenderer = renderer.create(content);
  });
  return testRenderer;
}

describe('<ListBoxFetchMasterItem />', () => {
  describe('extract data from app', () => {
    it('should extract fieldDef from app', async () => {
      const fieldIdentifier = { qLibraryId: '123' };
      const fakeDimLayout = { qDim: { qFieldDefs: ['Volume'] } };
      const app = {
        getDimension: sinon.stub().returns({ getLayout: () => fakeDimLayout }),
      };
      const testRenderer = await render(<ListBoxFetchMasterItem app={app} fieldIdentifier={fieldIdentifier} />);
      const result = testRenderer.toJSON();
      expect(result.children[0]).to.equal('Volume');
    });
  });
});
