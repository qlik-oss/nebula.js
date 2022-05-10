export default (obj) => {
  let seen = []; // eslint-disable-line prefer-const
  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      obj,
      (key, val) => {
        if (val != null && typeof val === 'object') {
          if (seen.indexOf(val) >= 0) {
            return;
          }
          seen.push(val);
        }
        return val; // eslint-disable-line consistent-return
      },
      2
    )
  );
};
