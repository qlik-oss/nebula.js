export const checkIfAuthorized = async () => {
  const { isAuthorized } = await (await fetch('/auth/isAuthorized')).json();
  return { isAuthorized };
};

export const getAppList = async () => {
  const apps = await (await fetch(`/apps`)).json();
  return apps || [];
};
