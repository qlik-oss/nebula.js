export default function fixture() {
  return {
    type: 'error-sn',
    load: async () =>
      function sn() {
        throw new Error('hahaha');
      },
  };
}
