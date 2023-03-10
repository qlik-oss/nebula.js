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

export default React.memo(
  ItemGrid,
  (o, n) =>
    o.dataLayout === n.dataLayout &&
    o.layoutOrder === n.layoutOrder &&
    o.itemPadding === n.itemPadding &&
    o.gap === n.gap &&
    o.className === n.className &&
    o.classes === n.classes &&
    o.role === n.role &&
    o.tabIndex === n.tabIndex &&
    o.classes === n.classes &&
    o['data-n'] === n['data-n']
);
