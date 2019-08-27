import { connect } from './connect';

const ul = document.querySelector('#apps ul');

connect().then((qix) => {
  qix.getDocList().then((list) => {
    const items = list.map((doc) => `
      <li>
        <a href="/dev/app/${encodeURIComponent(doc.qDocId)}">${doc.qTitle}</a>
      </li>`).join('');

    ul.innerHTML = items;
  });
});
