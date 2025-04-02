import React from 'react';
import { Typography, Grid, Tooltip } from '@mui/material';
import FilterIcon from '@nebula.js/ui/icons/filter';
import { generateFiltersLabels } from '../utils/generateSetExpression';

function ItalicText({ footerStyle, children }) {
  return (
    <Typography noWrap variant="body2" style={{ ...footerStyle, fontStyle: 'italic' }}>
      {children}
    </Typography>
  );
}

function BoldText({ footerStyle, children }) {
  return (
    <Typography noWrap variant="body2" style={{ ...footerStyle, fontWeight: 'bold', fontStyle: 'normal' }}>
      {children}
    </Typography>
  );
}

function FiltersFooter({ layout, translator, filtersFootnoteString, footerStyle }) {
  const filtersFootnoteLabels = generateFiltersLabels(layout?.filters ?? [], translator);

  return (
    <Tooltip title={filtersFootnoteString}>
      <Grid
        container
        wrap="nowrap"
        sx={{ backgroundColor: footerStyle.backgroundColor }}
        data-testid="filters-footnote"
      >
        <Grid item display="flex">
          <FilterIcon style={{ fontSize: '12px', color: footerStyle.color, marginTop: '2px' }} />
          <ItalicText footerStyle={footerStyle}>{translator.get('Object.FiltersApplied')}</ItalicText>
          <ItalicText footerStyle={footerStyle}> &nbsp;</ItalicText>
        </Grid>
        <Grid item display="flex">
          {filtersFootnoteLabels.map((filter) => (
            <Grid container wrap="nowrap" key={`${filter.field}-${filter.label}`}>
              <BoldText footerStyle={footerStyle}>{`${filter.field}:`}</BoldText>
              <ItalicText footerStyle={footerStyle}> &nbsp;</ItalicText>
              <ItalicText footerStyle={footerStyle}> {filter.label}</ItalicText>
              <ItalicText footerStyle={footerStyle}> &nbsp;</ItalicText>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Tooltip>
  );
}

export default FiltersFooter;
