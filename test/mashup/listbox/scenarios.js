const scenarios = {};

function trackFlow(flowName) {
  document.querySelector('#flow-tracker').innerText += `${flowName},`;
}

scenarios.scenario1 = {
  options: {
    delay: 1000,
  },
  genericObject: {
    getLayout() {
      trackFlow('getLayout');
      return {
        qInfo: {
          qId: 'listbox111',
          qType: 'listbox',
        },
        qMeta: {
          privileges: ['read', 'update', 'delete'],
        },
        qSelectionInfo: {},
        qListObject: {
          qSize: {
            qcx: 1,
            qcy: 12,
          },
          qDimensionInfo: {
            qFallbackTitle: 'Month',
            qApprMaxGlyphCount: 3,
            qCardinal: 12,
            qSortIndicator: 'A',
            qGroupFallbackTitles: ['Month'],
            qGroupPos: 0,
            qStateCounts: {
              qLocked: 0,
              qSelected: 0,
              qOption: 12,
              qDeselected: 0,
              qAlternative: 0,
              qExcluded: 0,
              qSelectedExcluded: 0,
              qLockedExcluded: 0,
            },
            qTags: ['$numeric', '$integer'],
            qDimensionType: 'N',
            qGrouping: 'N',
            qNumFormat: {
              qType: 'U',
              qnDec: 0,
              qUseThou: 0,
            },
            qIsAutoFormat: true,
            qGroupFieldDefs: ['Month'],
            qMin: 0,
            qMax: 0,
            qAttrExprInfo: [],
            qAttrDimInfo: [],
            qCardinalities: {
              qCardinal: 12,
              qHypercubeCardinal: 0,
              qAllValuesCardinal: -1,
            },
            autoSort: true,
            cId: 'jmqbe',
          },
          qExpressions: [],
          qDataPages: [],
          showTitles: true,
          title: '',
          subtitle: '',
          footnote: '',
          disableNavMenu: false,
          showDetails: true,
          showDetailsExpression: false,
          qOtherTotalSpec: {},
        },
        showTitles: true,
        title: 'Month',
        subtitle: '',
        footnote: '',
        disableNavMenu: false,
        showDetails: true,
        showDetailsExpression: false,
        visualization: 'listbox',
      };
    },
    // listbox data
    getListObjectData() {
      trackFlow('getListObjectData');
      return [
        {
          qMatrix: [
            [
              {
                qText: 'Jan',
                qNum: 1,
                qElemNumber: 2,
                qState: 'O',
              },
            ],
            [
              {
                qText: 'Feb',
                qNum: 2,
                qElemNumber: 9,
                qState: 'O',
              },
            ],
            [
              {
                qText: 'Mar',
                qNum: 3,
                qElemNumber: 10,
                qState: 'O',
              },
            ],
            [
              {
                qText: 'Apr',
                qNum: 4,
                qElemNumber: 0,
                qState: 'O',
              },
            ],
            [
              {
                qText: 'May',
                qNum: 5,
                qElemNumber: 11,
                qState: 'O',
              },
            ],
            [
              {
                qText: 'Jun',
                qNum: 6,
                qElemNumber: 1,
                qState: 'O',
              },
            ],
            [
              {
                qText: 'Jul',
                qNum: 7,
                qElemNumber: 8,
                qState: 'O',
              },
            ],
            [
              {
                qText: 'Aug',
                qNum: 8,
                qElemNumber: 5,
                qState: 'O',
              },
            ],
            [
              {
                qText: 'Sep',
                qNum: 9,
                qElemNumber: 3,
                qState: 'O',
              },
            ],
            [
              {
                qText: 'Oct',
                qNum: 10,
                qElemNumber: 6,
                qState: 'O',
              },
            ],
            [
              {
                qText: 'Nov',
                qNum: 11,
                qElemNumber: 4,
                qState: 'O',
              },
            ],
            [
              {
                qText: 'Dec',
                qNum: 12,
                qElemNumber: 7,
                qState: 'O',
              },
            ],
          ],
          qTails: [],
          qArea: {
            qLeft: 0,
            qTop: 0,
            qWidth: 1,
            qHeight: 12,
          },
        },
        {
          qMatrix: [
            [
              {
                qText: 'Jan',
                qNum: 1,
                qElemNumber: 2,
                qState: 'O',
              },
            ],
            [
              {
                qText: 'Feb',
                qNum: 2,
                qElemNumber: 9,
                qState: 'O',
              },
            ],
            [
              {
                qText: 'Mar',
                qNum: 3,
                qElemNumber: 10,
                qState: 'O',
              },
            ],
            [
              {
                qText: 'Apr',
                qNum: 4,
                qElemNumber: 0,
                qState: 'O',
              },
            ],
            [
              {
                qText: 'May',
                qNum: 5,
                qElemNumber: 11,
                qState: 'O',
              },
            ],
            [
              {
                qText: 'Jun',
                qNum: 6,
                qElemNumber: 1,
                qState: 'O',
              },
            ],
            [
              {
                qText: 'Jul',
                qNum: 7,
                qElemNumber: 8,
                qState: 'O',
              },
            ],
            [
              {
                qText: 'Aug',
                qNum: 8,
                qElemNumber: 5,
                qState: 'O',
              },
            ],
            [
              {
                qText: 'Sep',
                qNum: 9,
                qElemNumber: 3,
                qState: 'O',
              },
            ],
            [
              {
                qText: 'Oct',
                qNum: 10,
                qElemNumber: 6,
                qState: 'O',
              },
            ],
            [
              {
                qText: 'Nov',
                qNum: 11,
                qElemNumber: 4,
                qState: 'O',
              },
            ],
            [
              {
                qText: 'Dec',
                qNum: 12,
                qElemNumber: 7,
                qState: 'O',
              },
            ],
          ],
          qTails: [],
          qArea: {
            qLeft: 0,
            qTop: 0,
            qWidth: 1,
            qHeight: 12,
          },
        },
      ];
    },
  },
};

const { embed, EnigmaMocker } = window.stardust;

function getScenario() {
  const queryParams = new URLSearchParams(window.location.search);
  const id = queryParams.get('scenario');
  const scenario = scenarios[id];

  if (!scenario) {
    throw new Error(`No scenario with id "${id}" found`);
  }

  return scenario;
}

async function render() {
  const scenario = getScenario();
  const app = await EnigmaMocker.fromGenericObjects([scenario.genericObject], scenario.options);
  const element = document.querySelector('.listbox1');
  const fieldInstance = await embed(app).field({ qId: 'listbox111' });
  trackFlow('before mount call');
  await fieldInstance.mount(element);
  trackFlow('mount promise resolved');
}

window.addEventListener('load', render);
