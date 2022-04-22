import { atom } from 'jotai';

export const modelAtom = atom(undefined);
export const modelPage = atom({ qLeft: 0, qTop: 0, qHeight: 100, qWidth: 100 });
export const cellAtom = atom(undefined);
export const dataCellsAtom = atom([]);

export const cellsAtom = atom(async (get) => {
  try {
    const model = await get(modelAtom);
    if (model) {
      const page = get(modelPage);
      const dataPages = await model.getHyperCubeData('/qHyperCubeDef', [page]);
      return dataPages;
    }
  } catch (error) {
    console.log('error fetching data pages', error);
    throw error;
  }
  return undefined;
});
