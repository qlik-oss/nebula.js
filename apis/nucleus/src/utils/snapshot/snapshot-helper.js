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
import uid from '../../object/uid';

const SNAPSHOT_FORMATS = { LEGACY: 'legacy', CLIENT: 'client' };
const DEFAULT_SNAPSHOT_FORMAT = SNAPSHOT_FORMATS.LEGACY;

export function resolveSnapshotFormat(format) {
  return Object.values(SNAPSHOT_FORMATS).includes(format) ? format : DEFAULT_SNAPSHOT_FORMAT;
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
    language,
    theme: themeName,
  };

  const snapshotLayout = await applyChartHook(sn, clonedLayout);

  // Generate a unique ID to prevent multiple objects with the same ID.
  // Snapshots in storytelling doesn't care about this ID - this is a safe guard from other types of usages.
  snapshotLayout.qInfo = { ...snapshotLayout.qInfo, qId: uid() };
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
  return resolveSnapshotFormat(format) === SNAPSHOT_FORMATS.CLIENT
    ? buildClientSnapshot(params)
    : buildLegacySnapshot(params);
}
