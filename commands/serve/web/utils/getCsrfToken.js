export default async function getCsrfToken(host) {
  try {
    const res = await fetch(`${host}/qps/csrftoken`, { credentials: 'include' });
    const token = res.headers.get('QLIK-CSRF-TOKEN');
    if (token) {
      return token;
    }
    return '';
  } catch (err) {
    console.log('Failed to fetch csrf-token', err);
  }
  return '';
}
