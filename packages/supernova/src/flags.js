// dummy capability flags until exposed as require alias in sense-client
const FLAGS = {
  PIE_RADIUS: true,
};

export default function flags() {
  return {
    getFlag(f) {
      if (!(f in FLAGS)) {
        throw new Error('Oopsie');
      }
      return FLAGS[f];
    },
  };
}
