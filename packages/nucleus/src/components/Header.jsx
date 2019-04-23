import React from 'react';
import Text from '@nebula.js/ui/components/Text';

const Header = ({
  layout,
}) => (
  layout && layout.showTitles && (layout.title || layout.subtitle) ? (
    <div style={{ background: 'transparent', padding: '0 8px' }}>
      <Text size="large" nowrap block>{layout.title}</Text>
      <Text faded size="small" nowrap block>{layout.subtitle}</Text>
    </div>
  ) : null
);

export default Header;
