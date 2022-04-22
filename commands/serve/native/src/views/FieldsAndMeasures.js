import { filterType } from 'jimp';
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useAtom } from 'jotai';
import AppTemplate from './AppTemplate';
import MultiSelect from 'react-native-multiple-select';

const titleImage = require('../assets/images/nebulaLogo.png');

const styles = {
  constainer: {
    flex: 1,
    overflow: 'scroll',
    backgroundColor: 'rgba(0,0,0,0)',
  },
};

const FieldsView = () => {
  const [fields, setFields] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);
  const sampleFields = [
    { id: 0, name: 'Dim1' },
    { id: 1, name: 'Dim2' },
    { id: 2, name: 'Dim3' },
    { id: 3, name: 'Dim4' },
  ];
  useEffect(() => {
    // fetch the fields from the connection
    // assign them to the fields state
    setFields(sampleFields);
  }, []);

  const onSelectedFieldsChange = (selectedFields) => {
    setSelectedFields(selectedFields);
  };

  if (fields === undefined || selectedFields === undefined) {
    return (
      <View>
        <Text>Loading</Text>
      </View>
    );
  }

  return (
    <View>
      <Text> Select Fields </Text>
      {<MultiSelect items={fields} uniqueKey="id" onSelectedItemsChange={onSelectedFieldsChange} />}
    </View>
  );
};

const MeasuresView = () => {};

const FieldsAndMeasuresView = ({ navigation, route }) => {
  return (
    <AppTemplate>
      <View>
        <FieldsView />
        <Pressable
          style={({ pressed }) => (pressed ? styles.buttonPressed : styles.button)}
          disabled={tenant === '' || appId === '' || apiKey === ''}
          onPress={() => goToSupernovaViewer()}
        >
          <Text style={styles.buttonText}> Confirm </Text>
        </Pressable>
      </View>
    </AppTemplate>
  );
};
