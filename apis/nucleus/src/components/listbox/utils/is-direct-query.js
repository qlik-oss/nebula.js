export default function isDirectQueryEnabled({ flags, appLayout }) {
  const { isEnabled = () => false } = flags || {};

  const isDQ = !!(
    appLayout?.qIsDirectQueryMode &&
    (isEnabled('CLIENT_DIRECT_QUERY_EAP') || isEnabled('CLIENT_DIRECT_QUERY_GA'))
  );
  return isDQ;
}
