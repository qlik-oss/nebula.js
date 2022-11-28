import { OptionsToConnect } from '../constants/optionsToConnect';

export const detectDefaultConnectionStep = (info) => {
  if (!info) return 0;
  if (info.isWebIntegrationIdProvided) return OptionsToConnect.findIndex((x) => x.label === 'Web Integration Id');
  if (info.isClientIdProvided) return OptionsToConnect.findIndex((x) => x.label === 'Client Id');
  return 0;
};
