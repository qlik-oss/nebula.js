import preact from 'preact';
import Text from '@nebula.js/ui/components/Text';
import Grid from '@nebula.js/ui/components/Grid';

const Footer = ({ layout }) => (
  layout && layout.showTitles && layout.footnote ? (
    <Grid>
      <Text nowrap size="small">{layout.footnote}</Text>
    </Grid>
  ) : null
);

export default Footer;
