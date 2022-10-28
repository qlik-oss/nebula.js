export default function identify({ qId, options }) {
  return {
    // External or internal ("on the fly") session model.
    hasExternalSessionModel: !!(qId || options.sessionModel),

    // External or internal selectionsApi.
    hasExternalSelectionsApi: !!options.selectionsApi,
  };
}
