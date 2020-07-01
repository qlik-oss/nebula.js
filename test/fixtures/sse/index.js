const q = require('qlik-sse');

const s = q.server({
  identifier: 'heavy',
  version: '0.1.0',
  allowScript: true,
});

async function heavy(request) {
  request.on('data', (bundle) => {
    const rows = [];
    let t = 100;
    try {
      t = bundle.rows[0].duals[0].numData;
    } catch (e) {
      /* */
    }

    setTimeout(() => {
      bundle.rows.forEach((row) => {
        row.duals.forEach((dual) => {
          rows.push({
            duals: [{ numData: dual.numData, strData: `$${dual.numData}` }],
          });
        });
      });
      request.write({ rows });
      request.end();
    }, t);
  });
}

s.addFunction(heavy, {
  functionType: q.sse.FunctionType.SCALAR,
  returnType: q.sse.DataType.NUMERIC,
  params: [
    {
      name: 'first',
      dataType: q.sse.DataType.NUMERIC,
    },
  ],
});

// start the server
/*
s.start({
  port: 50051,
});
*/

module.exports = s;
