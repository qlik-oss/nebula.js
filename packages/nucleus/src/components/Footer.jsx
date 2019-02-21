import preact from 'preact';
import { prefixer } from '../utils/utils';

const Footer = ({ layout }) => (
  layout && layout.showTitles && layout.footnote ? (
    <footer className={prefixer(['cell__footnote'])}>
      <div className={prefixer(['type', 'type--s'])}>{layout.footnote}</div>
    </footer>
  ) : null
);

export default Footer;
