/* eslint-disable no-nested-ternary */
import React, { useEffect, useCallback, useMemo, useState } from 'react';

import { Grid } from '@mui/material';

import Lock from '@nebula.js/ui/icons/lock';
import Tick from '@nebula.js/ui/icons/tick';
import getSegmentsFromRanges from '../listbox-highlight';
import classes from './helpers/classes';
import { getValueStateClasses } from './helpers/cell-states';
import { joinClassNames } from './helpers/operations';
import RowColRoot from './components/ListBoxRoot';
import FieldWithRanges from './components/FieldWithRanges';
import Field from './components/Field';
import Histogram from './components/Histogram';
import Frequency from './components/Frequency';
import ItemGrid from './components/ItemGrid';
import getCellFromPages from './helpers/get-cell-from-pages';
import { getValueLabel } from '../ScreenReaders';
import getRowsKeyboardNavigation from '../../interactions/keyboard-navigation/keyboard-nav-rows';
import getValueTextAlign from './helpers/get-value-text-align';

function RowColumn({ index, rowIndex, columnIndex, style, data }) {
  const {
    onChange,
    onClick,
    onMouseDown,
    onMouseUp,
    onMouseEnter,
    onTouchStart,
    onTouchEnd,
    pages,
    isLocked,
    column = false,
    checkboxes = false,
    textAlign,
    direction,
    layoutOptions = {},
    freqIsAllowed,
    isSingleSelect,
    actions,
    frequencyMax = '',
    histogram = false,
    keyboard,
    showGray = true,
    showTick: sizePermitsTickOrLock = true,
    columnCount = 1,
    rowCount = 1,
    dataOffset,
    deducedFrequencyMode,
    focusListItems,
    listCount,
    sizes,
    translator,
    showSearch,
    isModal,
    contentFontStyle,
    styles,
    fillHeight,
  } = data;

  const { dense = false, dataLayout = 'singleColumn', layoutOrder } = layoutOptions;
  const { itemPadding } = sizes;

  let cellIndex;
  let styleOverrides;
  const count = { max: null, currentIndex: null };

  if (typeof rowIndex === 'number' && typeof columnIndex === 'number') {
    if (layoutOrder === 'row') {
      cellIndex = rowIndex * columnCount + columnIndex;
      count.max = rowCount;
      count.currentIndex = rowIndex;
    } else {
      cellIndex = columnIndex * rowCount + rowIndex;
      count.max = columnCount;
      count.currentIndex = columnIndex;
    }
    const padding = 0;
    styleOverrides = {
      ...style,
      height: fillHeight ? '100%' : style.height,
      left: padding + (columnIndex === 0 ? style.left : Number(style.left) + columnIndex * padding),
      // right: columnIndex === columnCount ? style.right : Number(style.right) + columnIndex * padding,
      top: rowIndex === 0 ? style.top : Number(style.top) + rowIndex * padding,
    };
  } else {
    cellIndex = index;
    count.max = listCount;
    count.currentIndex = index;
    styleOverrides = { ...style };
  }
  cellIndex += dataOffset;

  const [rowRef, setRowRef] = useState(null);

  useEffect(() => {
    if (rowRef !== null) {
      if (count.currentIndex === 0 && focusListItems.first) {
        rowRef.focus();
        focusListItems.setFirst(false);
      }
      if (count.currentIndex === count.max - 1 && focusListItems.last) {
        rowRef.focus();
        focusListItems.setLast(false);
      }
    }
  }, [rowRef, focusListItems.first, focusListItems.last]);

  const handleKeyDownCallback = useCallback(
    getRowsKeyboardNavigation({
      ...actions,
      focusListItems,
      keyboard,
      isModal,
      rowCount,
      columnCount,
      rowIndex,
      columnIndex,
      layoutOrder,
    }),
    [actions, keyboard?.innerTabStops, rowCount, columnCount, rowIndex, columnIndex, layoutOrder]
  );

  const cell = useMemo(() => getCellFromPages({ pages, cellIndex }), [pages, cellIndex]);
  const isSelected = cell?.qState === 'S' || cell?.qState === 'XS' || cell?.qState === 'L' || cell?.qState === 'XL';

  const classArr = useMemo(
    () => getValueStateClasses({ column, histogram, checkboxes, cell, showGray }),
    [cell?.qState, histogram, dense, checkboxes]
  );

  const preventContextMenu = useCallback(
    (event) => {
      event.preventDefault();
    },
    [checkboxes]
  );

  const valueTextAlign = useMemo(
    () => cell && getValueTextAlign({ direction, cell, textAlign }),
    [direction, cell, textAlign]
  );

  if (!cell) {
    return null; // prevent rendering empty rows
  }

  const isGridCol = dataLayout === 'grid' && layoutOrder === 'column';

  const label = cell?.qText ?? '';
  // Search highlights. Split up labelText span into several and add the highlighted class to matching sub-strings.

  let labels;
  if (cell.qHighlightRanges?.qRanges?.length) {
    const ranges = cell.qHighlightRanges.qRanges.sort((a, b) => a.qCharPos - b.qCharPos) || [];
    labels = getSegmentsFromRanges(label, ranges);
  }

  const iconStyles = {
    alignItems: 'center',
    display: 'flex',
    fontSize: '8px',
  };

  const isRtl = direction === 'rtl';

  const cellStyle = {
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
    paddingLeft: isRtl ? 8 : checkboxes ? 0 : undefined,
    paddingRight: checkboxes ? 0 : isRtl ? 8 : 0,
    justifyContent: valueTextAlign,
  };

  const isFirstElement = index === 0;

  const showLock = isSelected && isLocked;
  const showTick = !checkboxes && isSelected && !isLocked;
  const showIcon = !checkboxes && sizePermitsTickOrLock;
  const cellPaddingRight = checkboxes || !sizePermitsTickOrLock;

  const ariaLabel = getValueLabel({
    translator,
    label,
    qState: cell.qState,
    currentIndex: count.currentIndex,
    maxIndex: count.max,
    showSearch,
  });

  const freqHitsValue = (!isRtl && valueTextAlign === 'right') || (isRtl && valueTextAlign === 'left');

  return (
    <RowColRoot
      className={classes.barContainer}
      checkboxes={checkboxes}
      style={styleOverrides}
      styles={styles}
      isGridCol={isGridCol}
      isGridMode={dataLayout === 'grid'}
      dense={dense}
      direction={direction}
      sizes={sizes}
      frequencyMode={deducedFrequencyMode}
      freqHitsValue={freqHitsValue}
      contentFontStyle={contentFontStyle}
      data-testid="listbox.item"
    >
      <ItemGrid
        role="row"
        aria-label={ariaLabel}
        aria-selected={isSelected}
        aria-setsize={count.max}
        aria-rowindex={count.currentIndex}
        ref={setRowRef}
        container
        dataLayout={dataLayout}
        cellPaddingRight={cellPaddingRight}
        layoutOrder={layoutOrder}
        itemPadding={itemPadding}
        gap={0}
        className={joinClassNames(['value', ...classArr])}
        classes={{
          root: classes.fieldRoot,
        }}
        onClick={onClick}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseEnter={onMouseEnter}
        onKeyDown={handleKeyDownCallback}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onContextMenu={preventContextMenu}
        tabIndex={isFirstElement && keyboard.innerTabStops ? 0 : -1}
        data-n={cell?.qElemNumber}
        direction={direction}
        fillHeight={fillHeight}
      >
        {cell?.qFrequency && (
          <Histogram
            qFrequency={cell?.qFrequency}
            histogram={histogram}
            checkboxes={checkboxes}
            isSelected={isSelected}
            frequencyMax={frequencyMax}
          />
        )}
        <Grid
          item
          style={cellStyle}
          className={joinClassNames([classes.cell, classes.selectedCell])}
          title={`${label}`}
        >
          {labels ? (
            <FieldWithRanges
              onChange={onChange}
              labels={labels}
              checkboxes={checkboxes}
              dense={dense}
              showGray={showGray}
              qElemNumber={cell.qElemNumber}
              isSelected={isSelected}
              cell={cell}
              isGridCol={isGridCol}
              isSingleSelect={isSingleSelect}
              valueTextAlign={valueTextAlign}
              styles={styles}
            />
          ) : (
            <Field
              onChange={onChange}
              label={label}
              qElemNumber={cell.qElemNumber}
              isSelected={isSelected}
              dense={dense}
              cell={cell}
              isGridCol={isGridCol}
              showGray={showGray}
              isSingleSelect={isSingleSelect}
              checkboxes={checkboxes}
              valueTextAlign={valueTextAlign}
              styles={styles}
            />
          )}
        </Grid>

        {freqIsAllowed && <Frequency cell={cell} checkboxes={checkboxes} dense={dense} showGray={showGray} />}

        {showIcon && (
          <Grid item className={classes.icon}>
            {showLock && <Lock style={iconStyles} size="small" />}
            {showTick && <Tick style={iconStyles} size="small" />}
          </Grid>
        )}
      </ItemGrid>
    </RowColRoot>
  );
}

export default RowColumn;
