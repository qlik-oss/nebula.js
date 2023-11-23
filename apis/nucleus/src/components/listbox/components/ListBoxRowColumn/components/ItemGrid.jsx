import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import getItemSizes from '../../grid-list-components/item-sizes';
import classes from '../helpers/classes';

const ItemGrid = styled(Grid, {
  shouldForwardProp: (prop) =>
    !['dataLayout', 'layoutOrder', 'itemPadding', 'cellPaddingRight', 'direction', 'fillHeight'].includes(prop),
})(({ dataLayout, layoutOrder, itemPadding, cellPaddingRight, direction, fillHeight }) => {
  const att = `padding${direction === 'rtl' ? 'Left' : 'Right'}`;
  return {
    [`&.${classes.fieldRoot}`]: {
      ...getItemSizes({ dataLayout, layoutOrder, itemPadding, fillHeight }),
      [att]: cellPaddingRight ? '8px' : undefined,
    },
  };
});

export default ItemGrid;
