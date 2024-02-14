// import { getConnectionInfo } from '../connect';

export const checkIfAuthorized = async () => {
  const { isAuthorized } = await (await fetch('/isAuthorized')).json();
  return { isAuthorized };
};

export const getAppList = async () => {
  console.log('[getAppList_func]');
  const apps = await (await fetch(`/apps`)).json();
  return apps || [];
};

// export const startAuthorizing = async () => {
//   const { clientId, engineUrl } = await getConnectionInfo();
//   const URL = `/oauth?host=${engineUrl}&clientId=${clientId}`;
//   const resp = await (await fetch(URL)).json();
//   if (resp.redirectUrl) window.location.href = resp.redirectUrl;
// };
