import sn from './sn';

export default function fixture() {
  return {
    type: 'sn',
    sn,
    snConfig: {
      context: {
        permissions: ['passive', 'interact'],
      },
    },
  };
}
