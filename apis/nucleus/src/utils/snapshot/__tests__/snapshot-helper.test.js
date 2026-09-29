import buildSnapshot, { resolveSnapshotFormat, generateId } from '../snapshot-helper';

describe('snapshot-helper', () => {
  let layout;
  let sn;
  let params;

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(1234);
    layout = { qInfo: { qId: 'abc', qType: 'bar' }, qExtendsId: 'master', title: 'My title', foo: 'bar' };
    sn = { component: {} };
    params = {
      layout,
      sn,
      cellRect: { width: 300.4, height: 400.6 },
      language: 'sv',
      themeName: 'dark',
      appLayout: { rtl: true, qLocaleInfo: { qDecimalSep: ',' } },
      supportExport: true,
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('resolveSnapshotFormat should default to legacy and pick first valid candidate', () => {
    expect(resolveSnapshotFormat(undefined, 'nope')).toBe('legacy');
    expect(resolveSnapshotFormat(undefined, 'client')).toBe('client');
    expect(resolveSnapshotFormat('legacy', 'client')).toBe('legacy');
  });

  test('generateId should generate ids of given length', () => {
    expect(generateId()).toHaveLength(7);
    expect(generateId(3)).toHaveLength(3);
  });

  describe('legacy', () => {
    test('should return wrapper', async () => {
      expect(await buildSnapshot({ format: 'legacy', ...params })).toEqual({
        key: '1234',
        meta: {
          language: 'sv',
          theme: 'dark',
          appLayout: { rtl: true, qLocaleInfo: { qDecimalSep: ',' } },
          size: { width: 300, height: 401 },
        },
        layout,
      });
    });

    test('should start with empty snapshotData and use hook return value', async () => {
      sn.component.setSnapshotData = jest.fn((l) => ({ ...l, extra: 1 }));
      const res = await buildSnapshot({ format: 'legacy', ...params });
      expect(sn.component.setSnapshotData.mock.calls[0][0].snapshotData).toEqual({});
      expect(res.layout).toEqual({ ...layout, snapshotData: {}, extra: 1 });
    });
  });

  describe('client', () => {
    const parent = () => ({ w: window.innerWidth, h: window.innerHeight });

    test('should return bare layout', async () => {
      const res = await buildSnapshot({ format: 'client', ...params });
      expect(res).toEqual({
        qInfo: { qId: expect.stringMatching(/^[a-zA-Z0-9]{7}$/), qType: 'bar' },
        title: 'My title',
        foo: 'bar',
        visualizationType: 'bar',
        sourceObjectId: 'abc',
        timestamp: 1234,
        isClone: false,
        qMetaDef: { title: 'My title' },
        supportExport: true,
        snapshotData: {
          object: { size: { w: 300, h: 401 } },
          rtl: true,
          appLocaleInfo: { qDecimalSep: ',' },
          parent: parent(),
          language: 'sv',
          theme: 'dark',
        },
      });
      expect(res.qInfo.qId).not.toBe('abc');
    });

    test('should not mutate the input layout', async () => {
      await buildSnapshot({ format: 'client', ...params });
      expect(layout).toEqual({
        qInfo: { qId: 'abc', qType: 'bar' },
        qExtendsId: 'master',
        title: 'My title',
        foo: 'bar',
      });
    });

    test('should use masterobject visualization as type', async () => {
      layout.qInfo.qType = 'masterobject';
      layout.visualization = 'linechart';
      const res = await buildSnapshot({ format: 'client', ...params });
      expect(res.visualizationType).toBe('linechart');
    });

    test('should give chart hook pre-filled snapshotData and use its return value', async () => {
      sn.component.setSnapshotData = jest.fn((l) => ({ ...l, snapshotData: { ...l.snapshotData, content: 'x' } }));
      const res = await buildSnapshot({ format: 'client', ...params });
      expect(sn.component.setSnapshotData.mock.calls[0][0].snapshotData).toEqual({
        object: { size: { w: 300, h: 401 } },
        rtl: true,
        appLocaleInfo: { qDecimalSep: ',' },
        parent: parent(),
        language: 'sv',
        theme: 'dark',
      });
      expect(res.snapshotData.content).toBe('x');
    });

    test('should default rtl to false', async () => {
      const res = await buildSnapshot({ format: 'client', ...params, appLayout: {} });
      expect(res.snapshotData.rtl).toBe(false);
    });
  });
});
