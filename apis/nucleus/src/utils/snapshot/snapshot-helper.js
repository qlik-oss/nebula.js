/**
 * Snapshot formats:
 * - `legacy`: Nebula's original `{ key, meta, layout }` wrapper.
 * - `client`: the same bare layout as sense-client's `prepSnapshotData` (snapshot-helper.js in sense-client),
 *   with `language` and `theme` added to `layout.snapshotData`.
 *
 * Note: static content urls (`qStaticContentUrl` -> `qStaticContentUrlDef`), `sheetId` and
 * `qMetaDef.title` lookups from sense-client are intentionally left out. Charts are expected to handle
 * static content themselves in `onTakeSnapshot`.
 */
export const SNAPSHOT_FORMATS = { LEGACY: 'legacy', CLIENT: 'client' };

export const DEFAULT_SNAPSHOT_FORMAT = SNAPSHOT_FORMATS.LEGACY;

export function resolveSnapshotFormat(...candidates) {
  const found = candidates.find((c) => Object.values(SNAPSHOT_FORMATS).includes(c));
  return found || DEFAULT_SNAPSHOT_FORMAT;
}

const ID_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function generateId(length = 7) {
  let id = '';
  for (let i = 0; i < length; i++) {
    id += ID_CHARS.charAt(Math.floor(Math.random() * ID_CHARS.length));
  }
  return id;
}

function getParentSize() {
  const sheetPanel = typeof document !== 'undefined' ? document.querySelector('.qv-panel-sheet') : null;
  if (sheetPanel) {
    const { width, height } = sheetPanel.getBoundingClientRect();
    return { w: Math.round(width), h: Math.round(height) };
  }
  return { w: window.innerWidth, h: window.innerHeight };
}

async function applyChartHook(sn, layout) {
  if (typeof sn.component.setSnapshotData === 'function') {
    return (await sn.component.setSnapshotData(layout)) || layout;
  }
  return layout;
}

async function buildLegacySnapshot({ layout, sn, cellRect, language, themeName, appLayout }) {
  let clonedLayout = JSON.parse(JSON.stringify(layout));
  if (typeof sn.component.setSnapshotData === 'function') {
    if (!clonedLayout.snapshotData) {
      clonedLayout.snapshotData = {};
    }
    clonedLayout = await applyChartHook(sn, clonedLayout);
  }
  return {
    key: String(+Date.now()),
    meta: {
      language,
      theme: themeName,
      appLayout,
      size: {
        width: Math.round(cellRect.width),
        height: Math.round(cellRect.height),
      },
    },
    layout: clonedLayout,
  };
}

async function buildClientSnapshot({ layout, sn, cellRect, language, themeName, appLayout, supportExport }) {
  const now = Date.now();
  const width = Math.round(cellRect.width);
  const height = Math.round(cellRect.height);
  const clonedLayout = JSON.parse(JSON.stringify(layout));

  // Pre-filled before the chart's onTakeSnapshot runs, same as in sense-client
  clonedLayout.snapshotData = {
    object: { size: { w: width, h: height } },
    rtl: appLayout?.rtl !== undefined ? appLayout.rtl : false,
    appLocaleInfo: appLayout?.qLocaleInfo,
    parent: getParentSize(),
    language,
    theme: themeName,
  };

  const snapshotLayout = await applyChartHook(sn, clonedLayout);

  snapshotLayout.qInfo = { ...snapshotLayout.qInfo, qId: generateId() };
  snapshotLayout.visualizationType =
    layout.qInfo?.qType === 'masterobject' ? layout.visualization : layout.qInfo?.qType;
  snapshotLayout.sourceObjectId = layout.qInfo?.qId;
  snapshotLayout.timestamp = now;
  snapshotLayout.isClone = false;
  snapshotLayout.qMetaDef = { title: layout.title || '' };
  snapshotLayout.supportExport = !!supportExport;
  delete snapshotLayout.qExtendsId; // Remove dependency on master visualization

  return snapshotLayout;
}

/**
 * @param {object} params
 * @param {'legacy'|'client'} params.format
 * @returns {Promise<object>}
 */
export default function buildSnapshot({ format, ...params }) {
  return format === SNAPSHOT_FORMATS.CLIENT ? buildClientSnapshot(params) : buildLegacySnapshot(params);
}
