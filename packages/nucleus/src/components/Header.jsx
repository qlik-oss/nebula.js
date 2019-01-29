import preact from 'preact';
import { prefixer } from '../utils';

const Header = ({ layout }) => (
  layout && layout.showTitles && (layout.title || layout.subtitle) ? (
    <header className={prefixer(['cell__header'])}>
      <div className={prefixer(['type--m'])}>
        {layout.title}
      </div>
      <div className={prefixer(['type--s'])}>{layout.subtitle}</div>
    </header>
  ) : null
);

export default Header;
