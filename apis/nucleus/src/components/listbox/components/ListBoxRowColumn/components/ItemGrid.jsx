import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import getItemSizes from '../../grid-list-components/item-sizes';
import classes from '../helpers/classes';

const ItemGrid = styled(Grid, {
  shouldForwardProp: (prop) =>
    !['dataLayout', 'layoutOrder', 'itemPadding', 'cellPaddingRight', 'direction'].includes(prop),
})(({ dataLayout, layoutOrder, itemPadding, cellPaddingRight, direction }) => {
  const att = `padding${direction === 'rtl' ? 'left' : 'right'}`;
  return {
    [`&.${classes.fieldRoot}`]: {
      ...getItemSizes({ dataLayout, layoutOrder, itemPadding }),
      [att]: cellPaddingRight ? '8px' : undefined,
    },
  };
});

export default ItemGrid;
