import preact from 'preact';

import { prefixer } from '../utils/utils';

const Component = props => (
  <div className={prefixer('cell__error')}>
    <div>Error</div>
    <div>{props.message}</div>
  </div>
);

export default Component;
