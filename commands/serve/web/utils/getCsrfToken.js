export default async function getCsrfToken(host) {
  try {
    const res = await fetch(`${host}/qps/csrftoken`, { credentials: 'include' });
    return res.headers.get('QLIK-CSRF-TOKEN');
  } catch (err) {
    console.log('Failed to fetch csrf-token', err);
  }
  return '';
}
