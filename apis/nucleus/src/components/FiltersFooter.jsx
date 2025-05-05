import React from 'react';
import { Typography, Grid, Tooltip } from '@mui/material';
import FilterIcon from '@nebula.js/ui/icons/filter';
import { generateFiltersLabels } from '../utils/generateFiltersInfo';

function ItalicText({ styles, children }) {
  return (
    <Typography noWrap variant="body2" style={{ ...styles, fontStyle: 'italic' }}>
      {children}
    </Typography>
  );
}

function FiltersFooter({ layout, translator, filtersFootnoteString, footerStyle }) {
  const filtersFootnoteLabels = generateFiltersLabels(layout?.filters ?? [], translator);
  const styles = {
    color: footerStyle?.color,
    fontFamily: footerStyle?.fontFamily,
    fontSize: footerStyle?.fontSize,
    fontWeight: footerStyle?.fontWeight,
  };

  return (
    <Tooltip title={filtersFootnoteString}>
      <Grid
        container
        wrap="nowrap"
        sx={{
          backgroundColor: footerStyle?.backgroundColor,
          padding: footerStyle?.padding,
          borderTop: footerStyle?.borderTop,
        }}
        data-testid="filters-footnote"
      >
        <Grid item display="flex">
          <FilterIcon style={{ fontSize: '12px', color: footerStyle.color, margin: 'auto' }} />
          <ItalicText styles={{ ...styles, marginLeft: '2px' }}>
            {translator.get('Object.FiltersApplied')} &nbsp;
          </ItalicText>
        </Grid>
        <Grid item display="flex">
          {filtersFootnoteLabels.map((filter) => (
            <Grid container wrap="nowrap" key={`${filter.field}-${filter.label}`}>
              <ItalicText styles={{ ...styles, fontWeight: 'bold' }}>{`${filter.field}:`}</ItalicText>
              <ItalicText styles={styles}> &nbsp; {filter.label} &nbsp;</ItalicText>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Tooltip>
  );
}

export default FiltersFooter;
