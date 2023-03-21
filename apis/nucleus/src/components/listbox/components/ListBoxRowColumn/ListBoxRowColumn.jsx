/* eslint-disable no-nested-ternary */
import React, { useEffect, useCallback, useRef, useMemo } from 'react';

import { Grid } from '@mui/material';

import Lock from '@nebula.js/ui/icons/lock';
import Tick from '@nebula.js/ui/icons/tick';
import getSegmentsFromRanges from '../listbox-highlight';
import { getFieldKeyboardNavigation } from '../../interactions/listbox-keyboard-navigation';
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

function RowColumn({ index, rowIndex, columnIndex, style, data }) {
  const {
    onChange,
    onClick,
    onMouseDown,
    onMouseUp,
    onMouseEnter,
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
    focusListItems,
    listCount,
    itemPadding,
    frequencyWidth,
  } = data;

  const { dense = false, dataLayout = 'singleColumn', layoutOrder } = layoutOptions;

  let cellIndex;
  let styles;
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
    styles = {
      ...style,
      left: padding + (columnIndex === 0 ? style.left : Number(style.left) + columnIndex * padding),
      // right: columnIndex === columnCount ? style.right : Number(style.right) + columnIndex * padding,
      top: rowIndex === 0 ? style.top : Number(style.top) + rowIndex * padding,
    };
  } else {
    cellIndex = index;
    count.max = listCount;
    count.currentIndex = index;
    styles = { ...style };
  }
  cellIndex += dataOffset;

  const rowRef = useRef(null);
  useEffect(() => {
    if (rowRef.current !== null) {
      if (count.currentIndex === 0 && focusListItems.first) {
        rowRef.current.focus();
        focusListItems.setFirst(false);
      }
      if (count.currentIndex === count.max - 1 && focusListItems.last) {
        rowRef.current.focus();
        focusListItems.setLast(false);
      }
    }
  }, [rowRef.current]);

  const handleKeyDownCallback = useCallback(getFieldKeyboardNavigation({ ...actions, focusListItems }), [actions]);

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

  if (!cell) {
    return null; // prevent rendering empty rows
  }

  const isNumeric = !['NaN', undefined].includes(cell?.qNum);
  let valueTextAlign;
  const isAutoTextAlign = !textAlign || textAlign.auto;
  const dirToTextAlignMap = {
    rtl: 'right',
    ltr: 'left',
  };

  if (isAutoTextAlign) {
    if (!isNumeric) {
      valueTextAlign = dirToTextAlignMap[direction];
    } else {
      valueTextAlign = direction === 'rtl' ? 'left' : 'right';
    }
  } else {
    valueTextAlign = textAlign?.align || 'left';
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

  const cellStyle = {
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    flexGrow: 1,
    paddingLeft: direction === 'rtl' ? 8 : checkboxes ? 0 : undefined,
    paddingRight: checkboxes ? 0 : direction === 'rtl' ? 8 : 0,
    justifyContent: valueTextAlign,
  };

  const isFirstElement = index === 0;
  const flexBasisVal = checkboxes ? 'auto' : 'max-content';

  const showLock = isSelected && isLocked && sizePermitsTickOrLock;
  const showTick = !checkboxes && isSelected && !isLocked && sizePermitsTickOrLock;
  const showIcon = !checkboxes && (showTick || showLock);

  return (
    <RowColRoot
      className={classes.barContainer}
      flexBasisProp={flexBasisVal}
      style={styles}
      showIcon={showIcon}
      checkboxes={checkboxes}
      isGridCol={isGridCol}
      isGridMode={dataLayout === 'grid'}
      dense={dense}
      frequencyWidth={frequencyWidth}
    >
      <ItemGrid
        ref={rowRef}
        container
        dataLayout={dataLayout}
        checkboxes={checkboxes}
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
        onContextMenu={preventContextMenu}
        role={column ? 'column' : 'row'}
        tabIndex={isFirstElement && (!keyboard.enabled || keyboard.active) ? 0 : -1}
        data-n={cell?.qElemNumber}
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
              color="inherit" // TODO: Check this
              qElemNumber={cell.qElemNumber}
              isSelected={isSelected}
              cell={cell}
              isGridCol={isGridCol}
              isSingleSelect={isSingleSelect}
              valueTextAlign={valueTextAlign}
            />
          ) : (
            <Field
              onChange={onChange}
              label={label}
              color="inherit"
              qElemNumber={cell.qElemNumber}
              isSelected={isSelected}
              dense={dense}
              cell={cell}
              isGridCol={isGridCol}
              showGray={showGray}
              isSingleSelect={isSingleSelect}
              checkboxes={checkboxes}
              valueTextAlign={valueTextAlign}
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
