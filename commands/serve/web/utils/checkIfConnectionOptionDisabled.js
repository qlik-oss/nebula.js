export const checkIfConnectionOptionDisabled = ({ label, info }) => {
  if (!info) return false;

  const labelKey = label
    .split(' ')
    .map((x) => x.toLowerCase())
    .join('-');

  if (info.isWebIntegrationIdProvided) {
    if (labelKey === 'web-integration-id') return false;
    return true;
  }

  if (info.isClientIdProvided) {
    if (labelKey === 'client-id') return false;
    return true;
  }

  return false;
};
