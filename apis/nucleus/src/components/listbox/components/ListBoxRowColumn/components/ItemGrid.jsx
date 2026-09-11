import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import getItemSizes from '../../grid-list-components/item-sizes';
import classes from '../helpers/classes';

const ItemGrid = styled(Grid, {
  shouldForwardProp: (prop) =>
    !['dataLayout', 'layoutOrder', 'itemPadding', 'cellPaddingRight', 'direction', 'fillHeight', 'isImage'].includes(
      prop
    ),
})(({ dataLayout, layoutOrder, itemPadding, cellPaddingRight, direction, fillHeight, isImage }) => {
  const att = `padding${direction === 'rtl' ? 'Left' : 'Right'}`;
  // Image cells fill the whole card (no trailing padding); otherwise reserve space when needed.
  let cellPadding;
  if (!isImage && cellPaddingRight) {
    cellPadding = '8px';
  } else if (isImage) {
    cellPadding = 0;
  }
  return {
    [`&.${classes.fieldRoot}`]: {
      ...getItemSizes({ dataLayout, layoutOrder, itemPadding, fillHeight, isImage }),
      [att]: cellPadding,
    },
  };
});

export default ItemGrid;
