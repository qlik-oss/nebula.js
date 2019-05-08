import supernova from '@nebula.js/supernova';

import permissions from './permissions';
import selectionsApi from './selections';

import snDefinition from 'snDefinition'; // eslint-disable-line
import extDefinition from 'extDefinition'; // eslint-disable-line

const env = {
  Promise,
};

const snGenerator = supernova(snDefinition, env);

const ext = typeof extDefinition === 'function' ? extDefinition(env) : extDefinition;

export default {
  initialProperties: snGenerator.qae.properties,
  definition: {
    type: 'items',
    component: 'accordion',
    items: {
      data: {
        uses: 'data',
      },
    },
  },
  support: {
    export: false,
    exportData: false,
    snapshot: false,
    viewData: false,
  },
  ...ext,
  importProperties: null, // Disable conversion to/from this object
  exportProperties: null, // Disable conversion to/from this object
  template: '<div style="height: 100%;position: relative"></div>',
  mounted($element) {
    const element = $element[0].children[0];
    const selectionAPI = selectionsApi(this.$scope);
    const sn = snGenerator.create({
      model: this.backendApi.model,
      app: this.backendApi.model.session.app,
      selections: selectionAPI,
    });
    this.snComponent = sn.component;
    this.snComponent.created({
      options: this.options || {},
    });
    this.snComponent.mounted(element);
  },
  paint($element, layout) {
    return this.snComponent.render({
      layout,
      context: {
        permissions: permissions(this.options, this.backendApi),
      },
    });
  },
  destroy() {
    if (this.snComponent) {
      this.snComponent.willUnmount();
      this.snComponent.destroy();
    }
  },
};
