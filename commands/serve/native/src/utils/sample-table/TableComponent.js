import { atom, useAtom } from 'jotai';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import React, { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { cellsAtom, dataCellsAtom, modelAtom } from './atoms';
import DataCell from './DataCell';

export const TableComponent = ({ layout, model }) => {
  const setTabelModel = useUpdateAtom(modelAtom);
  const dataPages = useAtomValue(cellsAtom);
  const [dataCells, setDataCells] = useAtom(dataCellsAtom);

  useEffect(() => {
    setTabelModel(model);
  }, [model, setTabelModel]);

  useEffect(() => {
    if (dataPages) {
      const data = dataPages[0].qMatrix.map((el) => atom(el));
      setDataCells(data);
    }
  }, [dataPages, setDataCells]);

  useEffect(() => {}, [layout, model]);

  const renderItem = useCallback(({ item }) => {
    return <DataCell cell={item} />;
  }, []);

  const keyExtractor = useCallback((item, index) => index, []);

  return (
    <View style={{ flex: 1, backgroundColor: 'blue', justifyContent: 'center' }}>
      <FlatList data={dataCells} renderItem={renderItem} keyExtractor={keyExtractor} />
    </View>
  );
};
