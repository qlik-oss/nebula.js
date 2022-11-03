import renderer from '../renderer';

describe('snapshooter', () => {
  let embed;

  let nebbie;
  let embedGetSnapshotMock;
  let nebbieRenderMock;
  let setAttributeMock;
  let element;

  beforeEach(() => {
    embedGetSnapshotMock = jest.fn();
    setAttributeMock = jest.fn();
    element = {
      setAttribute: setAttributeMock,
    };

    embed = jest.fn();
    embed.config = {
      snapshot: {
        get: embedGetSnapshotMock,
      },
    };

    nebbieRenderMock = jest.fn().mockReturnValue(Promise.resolve());
    nebbie = {
      render: nebbieRenderMock,
    };

    embed.mockReturnValue(nebbie);
    embedGetSnapshotMock.mockReturnValue(
      Promise.resolve({
        meta: { theme: 'dark', language: 'sv' },
        layout: {
          cube: 'c',
          qInfo: {
            qId: 'xyz',
          },
        },
      })
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('should get snapshot with id "abc"', async () => {
    await renderer({ embed, snapshot: 'abc' });
    expect(embed.config.snapshot.get).toHaveBeenCalledWith('abc');
  });

  test('should catch snapshot get errors and render the error', async () => {
    embedGetSnapshotMock.mockImplementationOnce(() => {
      throw new Error('meh');
    });

    try {
      await renderer({ embed, element, snapshot: '' });
      expect(1).toBe('a'); // just to make sure this test fails if error is not trown
    } catch (e) {
      /* */
    }
    expect(element.setAttribute).toHaveBeenCalledWith('data-njs-error', 'meh');
    expect(element.innerHTML).toBe('<p>meh</p>');
  });

  test('should call embed with context theme and language', async () => {
    await renderer({ embed, snapshot: '' });

    // embed function only has been called once => calls[0]
    expect(embed.mock.calls[0][1]).toEqual({
      context: {
        theme: 'dark',
        language: 'sv',
      },
    });
  });

  test('should mock an app that returns a mocked model', async () => {
    await renderer({ embed, snapshot: '' });
    // first object of first call
    const app = embed.mock.calls[0][0];
    const model = await app.getObject('xyz');
    expect(model.getLayout instanceof Function).toBe(true);
    expect(model.on instanceof Function).toBe(true);
    expect(model.once instanceof Function).toBe(true);
  });

  test('the mocked model should return the snapshot as layout', async () => {
    await renderer({ embed, snapshot: '' });
    const app = embed.mock.calls[0][0];
    const model = await app.getObject('xyz');
    const ly = await model.getLayout();
    expect(ly).toEqual({
      cube: 'c',
      qInfo: {
        qId: 'xyz',
      },
    });
  });

  test('should reject mocked getObject when id is not matching qId', async () => {
    await renderer({ embed, snapshot: '' });
    const app = embed.mock.calls[0][0];
    try {
      await app.getObject('unknown');
      expect(1).toBe(0); // should never reach this point
    } catch (e) {
      expect(e.message).toBe('Could not find an object with id: unknown');
    }
  });

  test('should call nebbie.render() with id when qInfo.qId is truthy', async () => {
    const el = 'el';
    await renderer({ embed, element: el, snapshot: '' });
    expect(nebbie.render).toHaveBeenCalledWith({
      id: 'xyz',
      element: el,
    });
  });

  test('should call nebbie.render() with type when qInfo is falsy', async () => {
    const el = 'el';
    await renderer({
      embed,
      element: el,
      snapshot: { meta: {}, layout: { myProp: 'yes', visualization: 'legendary' } },
    });
    expect(nebbie.render).toHaveBeenCalledWith({
      type: 'legendary',
      element: el,
      properties: { myProp: 'yes', visualization: 'legendary' },
    });
  });

  test('should render error when nebbie.render() throws', async () => {
    nebbieRenderMock.mockImplementationOnce(() => {
      throw new Error('aaaaaaah!');
    });
    try {
      await renderer({ embed, element, snapshot: '' });
    } catch (e) {
      expect(e.message).toBe('aaaaaaah!');
    }
    expect(element.setAttribute).toHaveBeenCalledWith('data-njs-error', 'aaaaaaah!');
  });
});
