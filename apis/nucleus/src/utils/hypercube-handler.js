import arrayUtil from '../../../conversion/src/array-util';
import utils from '../../../conversion/src/utils';
import uid from '../object/uid';
import DataPropertyHandler from './data-property-handler';
import { findField, findLibraryItem, setAutoSort } from './hypercube-utils';

// Maximum number of active dimensions + disabled dimensions
const TOTAL_MAX_DIMENSIONS = 1000; // Maximum number of active measures + disabled measures
const TOTAL_MAX_MEASURES = 1000;

function getHyperCube(layout, path) {
  if (!layout) {
    return [];
  }
  return path && utils.getValue(layout, path) ? utils.getValue(layout, path).qHyperCube : layout.qHyperCube;
}

class HyperCubeHandler extends DataPropertyHandler {
  constructor(opts) {
    super(opts);
    this.path = opts.path;
  }

  setProperties(properties) {
    if (!properties) {
      return;
    }

    super.setProperties(properties);

    this.hcProperties = this.path
      ? utils.getValue(properties, `${this.path ? `${this.path}.` : ''}qHyperCubeDef`)
      : properties.qHyperCubeDef;

    if (!this.hcProperties) {
      return;
    }

    // Set defaults
    if (!this.hcProperties.qDimensions) {
      this.hcProperties.qDimensions = [];
    }
    if (!this.hcProperties.qMeasures) {
      this.hcProperties.qMeasures = [];
    }
    if (!this.hcProperties.qInterColumnSortOrder) {
      this.hcProperties.qInterColumnSortOrder = [];
    }
    if (!this.hcProperties.qLayoutExclude) {
      this.hcProperties.qLayoutExclude = {};
    }
    if (!this.hcProperties.qLayoutExclude.qHyperCubeDef) {
      this.hcProperties.qLayoutExclude.qHyperCubeDef = {};
    }
    if (!this.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions) {
      this.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions = [];
    }
    if (!this.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures) {
      this.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures = [];
    }

    if (
      this.hcProperties.isHCEnabled &&
      this.hcProperties.qDynamicScript.length === 0 &&
      this.hcProperties.qMode === 'S'
    ) {
      // this is only for line chart with forecast
      this.hcProperties.qDynamicScript = [];
    }

    // Set auto-sort property (compatibility 0.85 -> 0.9),
    // can probably be removed in 1.0
    this.hcProperties.qDimensions.forEach((dimension) => {
      if (dimension.autoSort !== undefined) {
        dimension.qDef.autoSort = dimension.autoSort;
        delete dimension.autoSort;
      }
    });
    this.hcProperties.qMeasures.forEach((measure) => {
      if (measure.autoSort !== undefined) {
        measure.qDef.autoSort = measure.autoSort;
        delete measure.autoSort;
      }
    });
  }

  // ------------ DIMENSIONS ------------

  getDimensions() {
    return this.hcProperties ? this.hcProperties.qDimensions : [];
  }

  getAlternativeDimensions() {
    return this.hcProperties?.qLayoutExclude?.qHyperCubeDef?.qDimensions ?? [];
  }

  getDimensionLayouts() {
    const hc = getHyperCube(this.layout, this.path);
    return hc ? hc.qDimensionInfo : [];
  }

  getDimensionLayout(cId) {
    return this.getDimensionLayouts().filter((item) => cId === item.cId)[0];
  }

  addDimension(dimension, alternative, idx) {
    const dimensions = this.getDimensions();
    const self = this;

    if (!dimension.qDef.cId) {
      dimension.qDef.cId = uid();
    }

    if (!dimension.qOtherTotalSpec) {
      dimension.qOtherTotalSpec = {};
    }

    if (alternative) {
      idx = idx !== undefined ? idx : this.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions.length;
      this.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions.splice(idx, 0, dimension);
      return Promise.resolve(dimension);
    }
    if (dimensions.length < this.maxDimensions()) {
      idx = idx !== undefined ? idx : dimensions.length;
      dimensions.splice(idx, 0, dimension);
      return this.autoSortDimension(dimension).then(() => {
        arrayUtil.indexAdded(
          self.hcProperties.qInterColumnSortOrder,
          typeof idx !== 'undefined' ? idx : dimensions.length - 1
        );

        if (typeof self.dimensionDefinition.add === 'function') {
          return Promise.resolve(self.dimensionDefinition.add.call(self, dimension, self.properties, self)).then(
            () => dimension
          );
        }

        return dimension;
      });
    }
    if (dimensions.length < TOTAL_MAX_DIMENSIONS) {
      idx = this.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions.length;
      this.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions.splice(idx, 0, dimension);
      return Promise.resolve(dimension);
    }
    return Promise.resolve();
  }

  async addDimensions(dimensions, alternative = false) {
    const self = this;
    const existingDimensions = this.getDimensions();
    const initialLength = existingDimensions.length;
    const existingAltDimensions = this.getAlternativeDimensions();
    let addedActive = 0;
    const addedDimensions = [];

    await Promise.all(
      dimensions.map(async (dim) => {
        // Adding more dimensions than TOTAL_MAX_DIMENSIONS is not allowed
        const totalDimensions = existingAltDimensions.length + existingDimensions.length;
        if (totalDimensions >= TOTAL_MAX_DIMENSIONS) return;

        if (!dim.qDef.cId) {
          dim.qDef.cId = uid();
        }

        if (!dim.qOtherTotalSpec) {
          dim.qOtherTotalSpec = {};
        }

        // Add new dimension to excluded layout if maxDimensions <= nbr of dimensions < TOTAL_MAX_DIMENSIONS
        const alt =
          alternative ||
          (self.maxDimensions() <= existingDimensions.length && existingDimensions.length < TOTAL_MAX_DIMENSIONS);

        if (alt) {
          const idx = this.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions.length;
          this.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions.splice(idx, 0, dim);
          addedDimensions.push(dim);
        } else if (existingDimensions.length < self.maxDimensions()) {
          await self.autoSortDimension(dim);
          // Dimension sort
          arrayUtil.indexAdded(self.hcProperties.qInterColumnSortOrder, initialLength + addedActive);
          existingDimensions.push(dim);
          addedDimensions.push(dim);
          addedActive++;
          if (typeof self.dimensionDefinition.add === 'function') {
            self.dimensionDefinition.add.call(self, dim, self.properties, self);
          }
        }
      })
    );
    return addedDimensions;
  }

  reinsertDimension(dimension, alternative, idx) {
    const dimensions = this.getDimensions();
    const self = this;

    if (!dimension.qDef.cId) {
      dimension.qDef.cId = uid();
    }
    if (alternative) {
      idx = idx !== undefined ? idx : this.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions.length;
      this.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions.splice(idx, 0, dimension);

      if (typeof self.dimensionDefinition.move === 'function') {
        return Deferred.when(self.dimensionDefinition.move.call(self, dimension, self.properties, self)).then(
          () => dimension
        );
      }
    } else if (dimensions.length < this.maxDimensions()) {
      idx = idx !== undefined ? idx : dimensions.length;
      dimensions.splice(idx, 0, dimension);

      arrayUtil.indexAdded(
        self.hcProperties.qInterColumnSortOrder,
        typeof idx !== 'undefined' ? idx : dimensions.length - 1
      );

      if (typeof self.dimensionDefinition.move === 'function') {
        return Deferred.when(self.dimensionDefinition.move.call(self, dimension, self.properties, self)).then(
          () => dimension
        );
      }
    } else if (dimensions.length < TOTAL_MAX_DIMENSIONS) {
      idx = this.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions.length;
      this.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions.splice(idx, 0, dimension);
    }
    return Promise.resolve(dimension);
  }

  removeDimension(idx, alternative) {
    let dimension;

    if (!alternative) {
      [dimension] = this.hcProperties.qDimensions.splice(idx, 1);
      arrayUtil.indexRemoved(this.hcProperties.qInterColumnSortOrder, idx);

      if (typeof this.dimensionDefinition.remove === 'function') {
        return Promise.when(this.dimensionDefinition.remove.call(null, dimension, this.properties, this, idx));
      }
    } else {
      dimension = this.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions.splice(idx, 1);
      if (typeof this.dimensionDefinition.remove === 'function') {
        dimension.isAlternative = true;
        return Promise.resolve(this.dimensionDefinition.remove.call(null, dimension, this.properties, this, idx)).then(
          () => delete dimension.isAlternative
        );
      }
    }
    return Promise.resolve(dimension);
  }

  // TODO: Test it, not tested yet
  async removeDimensions(indexes, alternative) {
    if (indexes.length === 0) return [];
    let deleted = [];
    // Start deleting from the end of the list first otherwise the idx is messed up
    const sortedIndexes = [...indexes].sort((a, b) => b - a);
    if (alternative) {
      const { qDimensions } = this.hcProperties.qLayoutExclude.qHyperCubeDef;
      // Keep the original deleted order
      deleted = qDimensions.filter((_, idx) => indexes.includes(idx));
      await Promise.all(
        sortedIndexes.map(async (idx) => {
          const dimension = qDimensions.splice(idx, 1)[0];
          if (typeof this.dimensionDefinition.remove === 'function' && dimension) {
            dimension.isAlternative = true;
            await this.dimensionDefinition.remove.call(null, dimension, this.properties, this, idx);
            delete dimension.isAlternative;
          }
        })
      );
    } else {
      // Keep the original deleted order
      deleted = this.hcProperties.qDimensions.filter((_, idx) => indexes.includes(idx));
      await Promise.all(
        sortedIndexes.map(async (idx) => {
          const dimension = this.hcProperties.qDimensions.splice(idx, 1)[0];
          arrayUtil.indexRemoved(this.hcProperties.qInterColumnSortOrder, idx);

          if (typeof this.dimensionDefinition.remove === 'function') {
            await this.dimensionDefinition.remove.call(null, dimension, this.properties, this, idx);
          }
        })
      );
    }
    return deleted;
  }

  // ------------ MEASURES ------------

  getMeasures() {
    return this.hcProperties ? this.hcProperties.qMeasures : [];
  }

  getAlternativeMeasures() {
    return this.hcProperties?.qLayoutExclude?.qHyperCubeDef?.qMeasures ?? [];
  }

  getMeasureLayouts() {
    const hc = getHyperCube(this.layout, this.path);
    return hc ? hc.qMeasureInfo : [];
  }

  getMeasureLayout(cId) {
    return this.getMeasureLayouts().filter((item) => cId === item.cId)[0];
  }

  addMeasure(measure, alternative, idx) {
    const measures = this.getMeasures();
    const self = this;

    if (!measure.qDef.cId) {
      measure.qDef.cId = uid();
    }

    if (alternative) {
      idx = idx !== undefined ? idx : this.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures.length;
      this.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures.splice(idx, 0, measure);
      return Promise.resolve(measure);
    }
    idx = idx !== undefined ? idx : measures.length;
    if (measures.length < this.maxMeasures()) {
      measures.splice(idx, 0, measure);

      return this.autoSortMeasure(measure).then(() => {
        arrayUtil.indexAdded(
          self.hcProperties.qInterColumnSortOrder,
          self.getDimensions().length + measures.length - 1
        );

        if (typeof self.measureDefinition.add === 'function') {
          return Promise.resolve(self.measureDefinition.add.call(null, measure, self.properties, self)).then(
            () => measure
          );
        }

        return measure;
      });
    }
    if (measures.length < TOTAL_MAX_MEASURES) {
      idx = this.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures.length;
      this.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures.splice(idx, 0, measure);
      return Promise.resolve(measure);
    }
    return Promise.resolve();
  }

  addMeasures(measures, alternative = false) {
    const self = this;
    const existingMeasures = self.getMeasures();
    const existingAltMeasures = self.getAlternativeMeasures();
    const initialLength = existingMeasures.length;
    const dimensions = self.getDimensions();
    const addedMeasures = [];
    let addedActive = 0;
    measures.every((measure) => {
      // Adding more measures than TOTAL_MAX_MEASURES is not allowed and we expect self.maxMeasures() to always be <= TOTAL_MAX_MEASURES
      const totalMeasures = existingMeasures.length + existingAltMeasures.length;
      if (totalMeasures >= TOTAL_MAX_MEASURES) return false; // break out of the loop

      if (!measure.qDef.cId) {
        measure.qDef.cId = uid();
      }
      // add new measure to excluded layout if self.maxMeasures <= nbr of measures < TOTAL_MAX_MEASURES
      const alt =
        alternative || (self.maxMeasures() <= existingMeasures.length && existingMeasures.length < TOTAL_MAX_MEASURES);

      if (alt) {
        const idx = this.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures.length;
        this.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures.splice(idx, 0, measure);
        addedMeasures.push(measure);
      } else if (existingMeasures.length < self.maxMeasures()) {
        measure.qSortBy = {
          qSortByLoadOrder: 1,
          qSortByNumeric: -1,
        };
        arrayUtil.indexAdded(self.hcProperties.qInterColumnSortOrder, dimensions.length + initialLength + addedActive);
        // Push the measure before we invoke the add-call since that depends on the new measure being in self.properties
        existingMeasures.push(measure);
        addedMeasures.push(measure);
        addedActive++;
        if (typeof self.measureDefinition.add === 'function') {
          self.measureDefinition.add.call(null, measure, self.properties, self);
        }
      }
      return true;
    });
    return addedMeasures;
  }

  // ------------ Sorting ------------

  getSorting() {
    return this.hcProperties.qInterColumnSortOrder;
  }

  setSorting(ar) {
    if (ar && ar.length === this.hcProperties.qInterColumnSortOrder.length) {
      this.hcProperties.qInterColumnSortOrder = ar;
    }
  }

  autoSortDimension(dimension) {
    const self = this;

    if (dimension.qLibraryId) {
      return this.app.getDimensionList().then((dimensionList) => {
        const libDim = findLibraryItem(dimension.qLibraryId, dimensionList);
        if (libDim) {
          setAutoSort(libDim.qData.info, dimension, self);
        }
        return dimension;
      });
    }
    return this.app.getFieldList().then((fieldList) => {
      const field = findField(dimension.qDef.qFieldDefs[0], fieldList);
      if (field) {
        setAutoSort([field], dimension, self);
      }
      return dimension;
    });
  }

  // --------------- OTHER FUNCTIONS ----------------

  getFilters() {
    return this.properties?.filters ?? [];
  }

  getFilter(id) {
    const filters = this.getFilters();
    return filters.find((filter) => filter.id === id);
  }

  getLabels() {
    // Find labels that could be used to refer to measures in the same hypercube
    // for now only support explicit named inline measures
    return this.getMeasures()
      .filter((m) => !m.qLibraryId && !!m.qDef.qLabel)
      .map((m) => m.qDef.qLabel);
  }

  // addFilterField(item) {
  //   const tags = item?.qTags ?? item?.tags;
  //   const isNumeric = Array.isArray(tags) && tags.includes('$numeric');
  //   const values = [];
  //   const filtersList = Array.isArray(this.properties.filters) ? this.properties.filters : [];
  //   const newFilter = {
  //     type: 'values',
  //     field: item.name ?? item.label ?? item.field,
  //     options: {
  //       values,
  //     },
  //     exclude: false,
  //     id: crypto.randomUUID(),
  //     isNumeric,
  //   };
  //   filtersList.push(newFilter);
  //   this.properties.filters = filtersList;
  //   this.properties.qHyperCubeDef.qContextSetExpression = generateSetExpression(filtersList);
  //   return newFilter;
  // }

  // IsHCInStraightMode() {
  //   return this.hcProperties.qMode === 'S';
  // }

  // removeFilterField(idx) {
  //   const filters = this.getFilters();
  //   filters.splice(idx, 1);
  //   if (this.properties) {
  //     this.properties.qHyperCubeDef.qContextSetExpression = generateSetExpression(filters);
  //   }
  //   return filters;
  // }

  // addFilters(filters) {
  //   const self = this;
  //   const addedFilters = [];
  //   for (const filter of filters) {
  //     addedFilters.push(self.addFilterField(filter));
  //   }
  //   return addedFilters;
  // }

  // removeFilters(indexes) {
  //   if (indexes.length === 0) return [];
  //   let deleted = [];
  //   // Start deleting from the end of the list first otherwise the idx is messed up
  //   const sortedIndexes = [...indexes].sort((a, b) => b - a);
  //   const filters = this.getFilters();
  //   // Keep the original deleted order
  //   deleted = filters.filter((_, idx) => indexes.includes(idx));
  //   for (const idx of sortedIndexes) {
  //     this.removeFilterField(idx);
  //   }
  //   return deleted;
  // }

  // setHCEnabled(value) {
  //   // this flag indicate whether we enabled HC modifier and have at least one script
  //   if (this.hcProperties) {
  //     this.hcProperties.isHCEnabled = value;
  //   }
  // }

  // getDynamicScripts() {
  //   return this.hcProperties?.qDynamicScript || [];
  // }

  // getDimensionLayout(cId) {
  //   return this.getDimensionLayouts().filter((item) => cId === item.cId)[0];
  // }

  // reinsertMeasure(measure, alternative, idx) {
  //   const measures = this.getMeasures();
  //   const self = this;

  //   if (!measure.qDef.cId) {
  //     measure.qDef.cId = util.generateId();
  //   }

  //   if (alternative) {
  //     idx = idx !== undefined ? idx : this.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures.length;
  //     this.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures.splice(idx, 0, measure);
  //   } else {
  //     idx = idx !== undefined ? idx : measures.length;
  //     if (measures.length < this.maxMeasures()) {
  //       measures.splice(idx, 0, measure);
  //       arrayUtils.indexAdded(
  //         self.hcProperties.qInterColumnSortOrder,
  //         self.getDimensions().length + measures.length - 1,
  //       );
  //       if (typeof self.measureDefinition.move === 'function') {
  //         return Deferred.when(self.measureDefinition.move.call(null, measure, self.properties, self, true)).then(
  //           () => measure,
  //         );
  //       }
  //     } else if (measures.length < TOTAL_MAX_MEASURES) {
  //       idx = this.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures.length;
  //       this.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures.splice(idx, 0, measure);
  //     }
  //   }
  //   return Deferred.resolve(measure);
  // }

  // replaceDimension(index, dimension) {
  //   const dimensions = this.getDimensions();
  //   const oldDimension = dimensions[index];
  //   const self = this;

  //   return this.autoSortDimension(dimension).then(() => {
  //     dimension.qDef.cId = util.generateId();
  //     dimensions[index] = dimension;

  //     if (typeof self.dimensionDefinition.replace === 'function') {
  //       self.dimensionDefinition.replace.call(null, dimension, oldDimension, index, self.properties, self);
  //     }

  //     return dimension;
  //   });
  // }

  // replaceMeasure(index, measure) {
  //   const measures = this.getMeasures();
  //   const oldMeasure = measures[index];
  //   const self = this;

  //   return this.autoSortMeasure(measure).then(() => {
  //     measure.qDef.cId = util.generateId();
  //     measures[index] = measure;

  //     if (typeof self.measureDefinition.replace === 'function') {
  //       self.measureDefinition.replace.call(null, measure, oldMeasure, index, self.properties, self);
  //     }

  //     return measure;
  //   });
  // }

  // autoSortMeasure(measure) {
  //   measure.qSortBy = {
  //     qSortByLoadOrder: 1,
  //     qSortByNumeric: -1,
  //   };
  //   return Deferred.resolve(measure);
  // }

  // removeMeasure(idx, alternative) {
  //   let measure;

  //   if (!alternative) {
  //     measure = this.hcProperties.qMeasures.splice(idx, 1)[0];
  //     arrayUtils.indexRemoved(this.hcProperties.qInterColumnSortOrder, this.getDimensions().length + idx);

  //     if (typeof this.measureDefinition.remove === 'function') {
  //       return Deferred.when(this.measureDefinition.remove.call(null, measure, this.properties, this, idx));
  //     }
  //   } else {
  //     measure = this.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures.splice(idx, 1)[0];
  //   }

  //   return Deferred.resolve(measure);
  // }

  // async removeMeasures(indexes, alternative) {
  //   if (indexes.length === 0) return [];
  //   let deleted = [];
  //   if (alternative) {
  //     const { qMeasures } = this.hcProperties.qLayoutExclude.qHyperCubeDef;
  //     deleted = qMeasures.filter((_, idx) => indexes.includes(idx));
  //     const remain = qMeasures.filter((_, idx) => !indexes.includes(idx));
  //     this.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures = remain;
  //   } else {
  //     // Keep the original deleted order
  //     deleted = this.hcProperties.qMeasures.filter((_, idx) => indexes.includes(idx));
  //     // Start deleting from the end of the list first otherwise the idx is messed up
  //     const sortedIndexes = [...indexes].sort((a, b) => b - a);
  //     for await (const idx of sortedIndexes) {
  //       const measure = this.hcProperties.qMeasures.splice(idx, 1)[0];
  //       arrayUtils.indexRemoved(this.hcProperties.qInterColumnSortOrder, this.getDimensions().length + idx);
  //       if (typeof this.measureDefinition.remove === 'function') {
  //         await this.measureDefinition.remove.call(null, measure, this.properties, this, idx);
  //       }
  //     }
  //   }
  //   return deleted;
  // }

  // moveDimension(fromIndex, toIndex) {
  //   const dimensions = this.getDimensions();
  //   const disabledDimensions = this.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions;
  //   let disabledFromIdx;
  //   let disabledToIdx;
  //   let dimension;

  //   if (fromIndex < dimensions.length && toIndex < dimensions.length) {
  //     // Moving within enabled measures
  //     arrayUtils.move(dimensions, fromIndex, toIndex);
  //   } else if (fromIndex < dimensions.length && toIndex >= dimensions.length) {
  //     // Moving from enabled to disabled
  //     disabledToIdx = toIndex - dimensions.length;

  //     dimension = disabledDimensions.splice(0, 1)[0];
  //     dimensions.push(dimension);

  //     dimension = dimensions.splice(fromIndex, 1)[0];
  //     disabledDimensions.splice(disabledToIdx, 0, dimension);
  //   } else if (fromIndex >= dimensions.length && toIndex < dimensions.length) {
  //     // Moving from disabled to enabled
  //     disabledFromIdx = fromIndex - dimensions.length;

  //     dimension = dimensions.splice(dimensions.length - 1, 1)[0];
  //     disabledDimensions.splice(0, 0, dimension);

  //     dimension = disabledDimensions.splice(disabledFromIdx + 1, 1)[0];
  //     dimensions.splice(toIndex, 0, dimension);
  //   } else {
  //     // Moving within disabled
  //     disabledFromIdx = fromIndex - dimensions.length;
  //     disabledToIdx = toIndex - dimensions.length;
  //     arrayUtils.move(disabledDimensions, disabledFromIdx, disabledToIdx);
  //   }

  //   return Deferred.resolve(dimension);
  // }

  // moveMeasure(fromIndex, toIndex) {
  //   const measures = this.getMeasures();
  //   const disabledMeasures = this.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures;
  //   let disabledFromIdx;
  //   let disabledToIdx;
  //   let measure;

  //   if (fromIndex < measures.length && toIndex < measures.length) {
  //     // Moving within enabled measures
  //     arrayUtils.move(measures, fromIndex, toIndex);
  //   } else if (fromIndex < measures.length && toIndex >= measures.length) {
  //     // Moving from enabled to disabled
  //     disabledToIdx = toIndex - measures.length;

  //     measure = disabledMeasures.splice(0, 1)[0];
  //     measures.push(measure);

  //     measure = measures.splice(fromIndex, 1)[0];
  //     disabledMeasures.splice(disabledToIdx, 0, measure);
  //   } else if (fromIndex >= measures.length && toIndex < measures.length) {
  //     // Moving from disabled to enabled
  //     disabledFromIdx = fromIndex - measures.length;

  //     measure = measures.splice(measures.length - 1, 1)[0];
  //     disabledMeasures.splice(0, 0, measure);

  //     measure = disabledMeasures.splice(disabledFromIdx + 1, 1)[0];
  //     measures.splice(toIndex, 0, measure);
  //   } else {
  //     // Moving within disabled
  //     disabledFromIdx = fromIndex - measures.length;
  //     disabledToIdx = toIndex - measures.length;
  //     arrayUtils.move(disabledMeasures, disabledFromIdx, disabledToIdx);
  //   }

  //   return Deferred.resolve(measure);
  // }

  // changeSorting(fromIdx, toIdx) {
  //   arrayUtils.move(this.hcProperties.qInterColumnSortOrder, fromIdx, toIdx);
  // }
}

export default HyperCubeHandler;
