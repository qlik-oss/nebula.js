const canSetProperties = (layout) =>
  !!(
    layout &&
    !layout.qHasSoftPatches &&
    !layout.qExtendsId &&
    (layout.qMeta?.privileges || []).indexOf('update') > -1
  );

export default canSetProperties;
