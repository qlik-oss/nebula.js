import styled from '@emotion/styled';
import { FixedSizeList, FixedSizeGrid } from 'react-window';

const PREFIX = 'ListBox';
const scrollBarThumb = '#BBB';
const scrollBarThumbHover = '#555';
const scrollBarBackground = '#f1f1f1';

export const classes = {
  styledScrollbars: `${PREFIX}-styledScrollbars`,
};

export default function getStyledComponents() {
  const scrollbarStyling = {
    scrollbarColor: `${scrollBarThumb} ${scrollBarBackground}`,

    '&::-webkit-scrollbar': {
      width: 10,
      height: 10,
    },

    '&::-webkit-scrollbar-track': {
      backgroundColor: scrollBarBackground,
    },

    '&::-webkit-scrollbar-thumb': {
      backgroundColor: scrollBarThumb,
      borderRadius: '1rem',
    },

    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: scrollBarThumbHover,
    },
  };

  const StyledFixedSizeList = styled(FixedSizeList)(() => ({
    [`&.${classes.styledScrollbars}`]: scrollbarStyling,
    // TODO: Verify these props and make generic together with grid component.
    '&::-webkit-scrollbar': {
      width: 10,
      height: 10,
    },

    '&::-webkit-scrollbar-track': {
      backgroundColor: scrollBarBackground,
    },

    '&::-webkit-scrollbar-thumb': {
      backgroundColor: scrollBarThumb,
      borderRadius: '1rem',
    },

    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: scrollBarThumbHover,
    },
  }));

  const StyledFixedSizeGrid = styled(FixedSizeGrid)(() => ({
    [`&.${classes.styledScrollbars}`]: scrollbarStyling,

    '&::-webkit-scrollbar': {
      width: 10,
      height: 10,
    },

    '&::-webkit-scrollbar-track': {
      backgroundColor: scrollBarBackground,
    },

    '&::-webkit-scrollbar-thumb': {
      backgroundColor: scrollBarThumb,
      borderRadius: '1rem',
    },

    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: scrollBarThumbHover,
    },
  }));

  return {
    StyledFixedSizeList,
    StyledFixedSizeGrid,
  };
}