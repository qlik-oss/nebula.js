import { useAtom } from 'jotai';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DataCell = ({ cell }) => {
  const [item, setItem] = useAtom(cell);

  console.log('item', item);

  return <View style={styles.cell} />;
};

const styles = StyleSheet.create({
  cell: {
    borderWidth: 1,
    height: 42,
    width: '100%',
    marginVertical: 4,
  },
});

export default React.memo(DataCell);
