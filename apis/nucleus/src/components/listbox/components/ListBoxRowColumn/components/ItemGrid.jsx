import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';
import getItemSizes from '../../grid-list-components/item-sizes';
import classes from '../helpers/classes';

const ItemGrid = styled(Grid, {
  shouldForwardProp: (prop) => !['dataLayout', 'layoutOrder', 'itemPadding'].includes(prop),
})(({ dataLayout, layoutOrder, itemPadding }) => ({
  [`&.${classes.fieldRoot}`]: getItemSizes({ dataLayout, layoutOrder, itemPadding }),
}));

export default React.memo(ItemGrid);
