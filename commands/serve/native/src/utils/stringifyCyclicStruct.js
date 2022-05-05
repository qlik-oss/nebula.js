export default stringifyCyclicStructure = (obj) => {
  var seen = [];
  console.log(
    JSON.stringify(
      obj,
      (key, val) => {
        if (val != null && typeof val == 'object') {
          if (seen.indexOf(val) >= 0) {
            return;
          }
          seen.push(val);
        }
        return val;
      },
      2
    )
  );
};
