import React, { useEffect } from 'react';

function getAccentColor(theme, layout) {
  const configured = layout?.props?.accent;
  if (configured) {
    return theme.getColorPickerColor(configured);
  }

  return theme.getStyle('object', '', 'primaryColor') || '#00873d';
}

function getColumns(staleLayout) {
  const dims = staleLayout?.qHyperCube?.qDimensionInfo || [];
  const measures = staleLayout?.qHyperCube?.qMeasureInfo || [];
  return [...dims, ...measures].map((f) => f.qFallbackTitle || '');
}

function doSelection(selections, cell, colIdx, setSelectedElements) {
  if (cell.qState === 'L') {
    return; // locked or measure
  }
  if (!selections.isActive()) {
    selections.begin('/qHyperCubeDef');
  }
  selections.select({
    method: 'selectHyperCubeValues',
    params: ['/qHyperCubeDef', colIdx, [cell.qElemNumber], true],
  });
  setSelectedElements((prev) => {
    const cellId = cell.qElemNumber;
    if (prev.includes(cellId)) {
      return prev.filter((id) => id !== cellId);
    } else {
      return [...prev, cellId];
    }
  });
}

function TableView({ rows, columns, selections, canSelect, accent, theme }) {
  const [selectedElements, setSelectedElements] = React.useState([]);
  const fg = theme.getContrastingColorTo(accent);

  useEffect(() => {
    setSelectedElements([]);
  }, [rows]);

  if (!rows.length) {
    return <p className="abc-advanced-chart__empty">No rows to display.</p>;
  }

  return (
    <table className="abc-advanced-chart__table">
      {columns.length ? (
        <thead>
          <tr>
            {columns.map((col, colIdx) => (
              <th key={`${colIdx}-${col}`}>{col}</th>
            ))}
          </tr>
        </thead>
      ) : null}
      <tbody>
        {rows.map((row, rowIdx) => (
          <tr key={rowIdx}>
            {row.map((cell, colIdx) => (
              <td
                style={{
                  background: selectedElements.includes(cell.qElemNumber) ? accent : null,
                  color: selectedElements.includes(cell.qElemNumber) ? fg : null,
                }}
                onClick={() => canSelect && doSelection(selections, cell, colIdx, setSelectedElements)}
                key={`${rowIdx}-${colIdx}`}
              >
                {cell?.qText || ''}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Table({ layout, staleLayout, dataset, datasetError, theme, interactions, selections }) {
  const accent = getAccentColor(theme, layout);
  const bg = theme.getStyle('object', '', 'backgroundColor') || '#ffffff';
  const fg = theme.getContrastingColorTo(bg);

  const rowCount = dataset?.rows?.length || 0;
  const columns = getColumns(staleLayout);
  const canSelect = interactions?.active && interactions?.select;

  return (
    <section
      className="abc-advanced-chart"
      style={{
        width: '100%',
        height: '100%',
        color: fg,
        background: bg,
        borderTopColor: accent,
      }}
    >
      <div className="abc-advanced-chart__meta">
        <span>Rows: {rowCount}</span>
        <span>Selections: {layout?.qSelectionInfo?.qInSelections ? 'active' : 'inactive'}</span>
        <span>Interactions: {interactions?.active && interactions?.select ? 'enabled' : 'disabled'}</span>
      </div>

      <div className="abc-advanced-chart__body">
        {datasetError ? (
          <div className="abc-advanced-chart__error">Data error: {String(datasetError)}</div>
        ) : (
          <TableView
            rows={dataset?.rows || []}
            columns={columns}
            selections={selections}
            canSelect={canSelect}
            accent={accent}
            theme={theme}
          />
        )}
      </div>
    </section>
  );
}
