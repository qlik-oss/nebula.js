const DEFAULT_INTERACTIONS = {
  active: true,
  select: true,
  passive: true,
  edit: false,
};

function pickConstraintsOrInteractions(context) {
  const { constraints, interactions } = context;
  // If some interaction is defined, then we use that
  if (Object.keys(interactions).length > 0) {
    return interactions;
  }
  const ret = {};
  Object.keys(constraints).forEach((state) => {
    ret[state] = !constraints[state];
  });
  return ret;
}

export default function unifyContraintsAndInteractions(context) {
  const { constraints, interactions } = context;
  const definedSettings = pickConstraintsOrInteractions(context);
  Object.keys(DEFAULT_INTERACTIONS).forEach((state) => {
    if (definedSettings[state] !== undefined) {
      interactions[state] = definedSettings[state];
      constraints[state] = !definedSettings[state];
    } else {
      interactions[state] = DEFAULT_INTERACTIONS[state];
      constraints[state] = !DEFAULT_INTERACTIONS[state];
    }
  });
}
