import useSessionModel from './useSessionModel';

const definition = {
  qInfo: {
    qType: 'current-selections',
  },
  qSelectionObjectDef: {
    qStateName: '$',
  },
  alternateStates: [],
};

export default function useCurrentSelectionsModel(app) {
  return useSessionModel(definition, app);
}
