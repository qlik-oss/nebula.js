export const checkIfHistoryConnectionDisabled = ({ item, info }) => {
  if (!info) return false;

  if ((info.isClientIdProvided || info.isWebIntegrationIdProvided) && item.includes('localhost')) return true;
  if (info.isClientIdProvided) {
    if (item.includes('qlik-client-id')) return false;
    return true;
  }
  if (info.isWebIntegrationIdProvided) {
    if (item.includes('qlik-web-integration-id')) return false;
    return true;
  }

  return false;
};
