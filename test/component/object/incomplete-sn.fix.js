import incompleteSn from './incomplete-sn';

export default function fixture() {
  return {
    type: 'incomplete-sn',
    sn: incompleteSn,
    snConfig: {
      context: {
        permissions: ['passive', 'interact'],
      },
    },
  };
}
