import { embed } from '@nebula.js/stardust';
import connect from './connect';

// Change to any dimension field that exists in your app
const FIELD = 'Alpha';

async function init() {
  const app = await connect();
  if (!app) return; // auth redirect in progress

  const nebbie = embed(app);

  const popover = document.querySelector('.popover');
  let mounted = false;

  document.querySelector('.trigger').addEventListener('click', () => {
    popover.classList.toggle('open');
    if (!mounted) {
      mounted = true;
      nebbie.field(FIELD).then((f) => f.mount(document.querySelector('.popover-listbox')));
    }
  });
}

init();
