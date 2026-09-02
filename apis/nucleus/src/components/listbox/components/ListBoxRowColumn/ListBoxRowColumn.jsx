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
import Image from './components/Image';
import Histogram from './components/Histogram';
import Frequency from './components/Frequency';
import ItemGrid from './components/ItemGrid';
import getRowFromPages from './helpers/get-row-from-pages';
import getRowsKeyboardNavigation from '../../interactions/keyboard-navigation/keyboard-nav-rows';
import getValueTextAlign from './helpers/get-value-text-align';
import getValueLabel from '../screen-reader/value-label';

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
    representation,
    listExprIndex = {},
    exprCache = {},
  } = data;

  const { dense = false, dataLayout = 'singleColumn', layoutOrder } = layoutOptions;
  const { itemPadding, gridGap = 0 } = sizes;
  const isImageRepr = representation?.type === 'image';
  const effectiveLayoutOrder = isImageRepr ? 'row' : layoutOrder;

  let cellIndex;
  let styleOverrides;
  const count = { max: null, currentIndex: null };

  if (typeof rowIndex === 'number' && typeof columnIndex === 'number') {
    if (effectiveLayoutOrder === 'row') {
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
    if (isImageRepr && gridGap > 0) {
      styleOverrides.width = Math.max(1, Number(style.width) - gridGap);
      styleOverrides.height = Math.max(1, Number(style.height) - gridGap);
      styleOverrides.left = Number(style.left) + gridGap / 2;
      styleOverrides.top = Number(style.top) + gridGap / 2;
    }
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

  const row = useMemo(() => getRowFromPages({ pages, cellIndex }), [pages, cellIndex]);
  const cell = row?.[0];
  const isSelected = cell?.qState === 'S' || cell?.qState === 'XS' || cell?.qState === 'L' || cell?.qState === 'XL';

  const classArr = useMemo(
    () => getValueStateClasses({ column, histogram, cell, showGray }),
    [cell?.qState, histogram, dense]
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

  // Image representation. In 'url' mode the image src comes from the imageUrl expression and the
  // field value is the alt text; in 'label' mode (default) the field value is the image src and
  // the imageLabel expression provides the alt text.
  const isImage = isImageRepr;
  let imageSrc;
  let imageAlt;
  let imageSubtitle;
  let imageCellBgColor;
  let imageTooltip;
  let imageSelectionColor;
  let imageOpacity = 1;
  let imagePlaceholderBg;
  if (isImage) {
    imageSelectionColor = styles?.selections?.selected || '#009845';
    if (cell.qState === 'X' || cell.qState === 'XS') {
      imageOpacity = 0.3;
    } else if (cell.qState === 'A') {
      imageOpacity = 0.4;
    }
    // Neutral backdrop shown while the image loads and behind any letterboxing (a touch darker for
    // alternatives); the cell background color expression, when set, takes precedence over this.
    imagePlaceholderBg = cell.qState === 'A' ? '#e0e0e0' : '#f0f0f0';

    // Resolve a per-value expression column, caching the last non-empty value per dimension value so
    // it survives once the value becomes excluded (the engine returns null for excluded values).
    // Key by the stable element number rather than the display text (qText/label), which is not
    // guaranteed unique — duplicate labels would otherwise overwrite each other's cached values.
    const valueKey = cell?.qElemNumber ?? label;
    const resolveExpr = (key) => {
      const col = listExprIndex[key];
      if (col == null) return undefined;
      const raw = row?.[col]?.qText;
      const bucket = exprCache[key] || (exprCache[key] = {});
      if (raw != null && raw !== '') {
        bucket[valueKey] = raw;
        return raw;
      }
      return bucket[valueKey];
    };

    const imageSetting = representation?.imageSetting ?? 'label';
    const urlExprValue = resolveExpr('imageUrl');
    const labelExprValue = resolveExpr('imageLabel');
    imageSubtitle = resolveExpr('subtitle');
    imageCellBgColor = resolveExpr('cellBgColor');
    imageTooltip = resolveExpr('tooltip') || label;

    if (imageSetting === 'url') {
      imageSrc = urlExprValue || label;
      imageAlt = label;
    } else {
      imageSrc = label;
      imageAlt = labelExprValue || label;
    }
  }

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
    paddingLeft: isImage ? 0 : isRtl ? 8 : checkboxes ? 0 : undefined,
    paddingRight: isImage ? 0 : checkboxes ? 0 : isRtl ? 8 : 0,
    justifyContent: valueTextAlign,
    textAlign: valueTextAlign,
  };

  const isFirstElement = index === 0;

  const showLockIcon = isSelected && isLocked;
  const showTickIcon = !checkboxes && isSelected && !isLocked;
  const showAnyIcon = !checkboxes && sizePermitsTickOrLock && !isImage;
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
        isImage={isImage}
        gap={0}
        className={joinClassNames(['value', classes.fieldRoot, ...classArr])}
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
          style={cellStyle}
          className={joinClassNames([classes.cell, classes.selectedCell])}
          title={isImage ? `${imageTooltip}` : `${label}`}
        >
          {isImage ? (
            <Image
              representation={representation}
              src={imageSrc}
              label={imageAlt}
              title={label}
              subtitle={imageSubtitle}
              cellBgColor={imageCellBgColor}
              placeholderBackground={imagePlaceholderBg}
              selected={isSelected}
              selectionColor={imageSelectionColor}
              opacity={imageOpacity}
            />
          ) : labels ? (
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

        {showAnyIcon && (
          <Grid className={classes.icon}>
            {showLockIcon && <Lock style={iconStyles} size="small" />}
            {showTickIcon && <Tick style={iconStyles} size="small" />}
          </Grid>
        )}
      </ItemGrid>
    </RowColRoot>
  );
}

export default RowColumn;
