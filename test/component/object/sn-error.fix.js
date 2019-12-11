export default function fixture() {
  return {
    type: 'error-sn',
    sn() {
      throw new Error('hahaha');
    },
  };
}
