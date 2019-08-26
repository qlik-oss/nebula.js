const INTERACTION_STATES = {
  STATIC: 0,
  ANALYSIS: 1,
  EDIT: 2,
};

function showTooltip(options) {
  if (options.tooltips) {
    return true;
  }
  return options.interactionState === INTERACTION_STATES.ANALYSIS && options.tooltips !== false;
}

function permissions(options, backendApi) {
  const p = [];
  if (showTooltip(options)) {
    p.push('passive');
  }
  if (
    options.interactionState === INTERACTION_STATES.ANALYSIS &&
    options.tooltips !== false &&
    options.limitedInteraction !== true
  ) {
    p.push('interact');
  }
  if (!backendApi.isSnapshot) {
    if (options.selections !== false) {
      p.push('select');
    }
    p.push('fetch');
  }

  return p;
}

export default permissions;
