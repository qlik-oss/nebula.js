import fs from 'fs';
import os from 'os';
import path from 'path';

const makeMatrixRow = ({ rowIndex, dimensions, measures }) => {
  const row = [];
  for (let i = 0; i < dimensions; i += 1) {
    row.push({
      qText: `Dim-${i + 1}-${rowIndex + 1}`,
      qElemNumber: rowIndex,
    });
  }
  for (let i = 0; i < measures; i += 1) {
    row.push({
      qNum: (rowIndex + 1) * (i + 1) * 10,
      qText: `${(rowIndex + 1) * (i + 1) * 10}`,
    });
  }
  return row;
};

const buildGenericObjectCode = ({ type, qId, dims, measures, rows }) => {
  const matrix = [];
  for (let i = 0; i < rows; i += 1) {
    matrix.push(makeMatrixRow({ rowIndex: i, dimensions: dims, measures }));
  }

  const qcx = Math.max(dims + measures, 1);
  const matrixJson = JSON.stringify(matrix, null, 2);

  return `{
  getLayout: {
    qInfo: { qId: '${qId}', qType: '${type}' },
    visualization: '${type}',
    qHyperCube: {
      qSize: { qcx: ${qcx}, qcy: ${rows} },
      qDataPages: [
        {
          qArea: { qLeft: 0, qTop: 0, qWidth: ${qcx}, qHeight: ${rows} },
          qMatrix: ${matrixJson}
        }
      ]
    }
  },
  getHyperCubeData() {
    return [this.getLayout.qHyperCube.qDataPages[0]];
  }
}`;
};

export const writeSmokeFiles = ({ type, dataRequirements }) => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nebula-validate-'));
  const fixtureFile = path.join(fixtureRoot, 'validate.fix.js');
  const configFile = path.join(fixtureRoot, 'nebula.validate.config.cjs');
  const qId = `nebula-validate-${Date.now()}`;

  const genericObjectCode = buildGenericObjectCode({
    type,
    qId,
    dims: dataRequirements.dimensions,
    measures: dataRequirements.measures,
    rows: dataRequirements.rows,
  });

  const fixtureContent = `export default function fixture() {
  return {
    type: '${type}',
    genericObjects: [${genericObjectCode}],
    snConfig: {
      onRender() {
        window.__NEBULA_VALIDATE_ON_RENDER__ = true;
      },
    },
  };
}
`;

  const configContent = `module.exports = {
  serve: {
    open: false,
    fixturePath: ${JSON.stringify(fixtureRoot)},
  },
};
`;

  fs.writeFileSync(fixtureFile, fixtureContent, 'utf-8');
  fs.writeFileSync(configFile, configContent, 'utf-8');

  return {
    fixtureRoot,
    fixtureFile,
    configFile,
  };
};
