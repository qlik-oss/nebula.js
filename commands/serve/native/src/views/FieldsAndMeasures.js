import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { useAtom } from 'jotai';
import { fieldsAtom, selectedFieldsAtom, measuresAtom, selectedMeasuresAtom } from '../atoms/FieldsAndMeasuresAtom';
import AppTemplate from './AppTemplate';
import MultiSelect from 'react-native-multiple-select';

const titleImage = require('../assets/images/nebulaLogo.png');

const styles = {
  container: {
    flex: 1,
    overflow: 'scroll',
    backgroundColor: 'rgba(0,0,0,0)',
  },
  fieldsContainer: {
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
    borderColor: '#000000',
    borderWidth: 3,
  },
  titleText: {
    fontFamily: 'Montserrat',
    fontWeight: 'bold',
    width: '100%',
    textAlign: 'center',
    fontSize: 20,
    backgroundColor: 'rgba(0,0,0,0)',
    padding: 5,
  },
  titleImage: {
    width: '100%',
    height: 100,
  },
  subHeading: {
    fontFamily: 'Montserrat',
    padding: 10,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: 'white',
    color: 'black',
    margin: 10,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: 'white',
  },
  buttonPressed: {
    backgroundColor: '#EEEEEE',
    color: 'black',
    margin: 10,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: '#990997',
  },
  buttonText: {
    fontFamily: 'Montserrat',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 15,
  },
};

const FieldsView = () => {
  const [fields, setFields] = useAtom(fieldsAtom);
  const [selectedFields, setSelectedFields] = useAtom(selectedFieldsAtom);
  const multiSelect = useRef();
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
  }, [selectedFields]);

  const onSelectedFieldsChange = (sf) => {
    console.log('sf: ', sf);
    setSelectedFields([...sf]);
  };

  if (fields === undefined || selectedFields === undefined) {
    return (
      <View>
        <Text styles={styles.subHeading}>Loading</Text>
      </View>
    );
  }
  return (
    <View style={styles.fieldsContainer}>
      <Text style={styles.subHeading}> Select Fields </Text>
      <MultiSelect
        items={fields}
        uniqueKey="id"
        onSelectedItemsChange={onSelectedFieldsChange}
        selectedItems={selectedFields}
        ref={multiSelect}
        selectText={`\t Choose Fields`}
        searchInputStyle={{ color: '#333333', margin: 5, padding: 10 }}
        styleInputGroup={{ paddingRight: 20 }}
        styleListContainer={{ paddingLeft: 20 }}
        styleMainWrapper={{ padding: 20 }}
        tagBorderColor="#CCC"
        tagTextColor="#CCC"
        tagRemoveIconColor="#CCC"
      />
    </View>
  );
};

const MeasuresView = () => {
  const [measures, setMeasures] = useAtom(measuresAtom);
  const [selectedMeasures, setSelectedMeasures] = useAtom(selectedMeasuresAtom);
  const measuresSelect = useRef();
  const sampleMeasures = [
    { id: 0, name: 'Dim1' },
    { id: 1, name: 'Dim2' },
    { id: 2, name: 'Dim3' },
    { id: 3, name: 'Dim4' },
  ];
  useEffect(() => {
    // fetch the fields from the connection
    // assign them to the fields state
    setMeasures(sampleMeasures);
  }, [selectedMeasures]);

  const onSelectedMeasuresChange = (sm) => {
    setSelectedMeasures([...sm]);
  };

  if (measures === undefined || selectedMeasures === undefined) {
    return (
      <View>
        <Text styles={styles.subHeading}>Loading</Text>
      </View>
    );
  }
  return (
    <View style={styles.fieldsContainer}>
      <Text style={styles.subHeading}> Select Measures </Text>
      <MultiSelect
        items={measures}
        uniqueKey="id"
        onSelectedItemsChange={onSelectedMeasuresChange}
        selectedItems={selectedMeasures}
        ref={measuresSelect}
        selectText={`\t Choose Measures`}
        searchInputStyle={{ color: '#3232a8', margin: 5, padding: 10 }}
        styleInputGroup={{ paddingRight: 20 }}
        styleListContainer={{ paddingLeft: 20 }}
        styleMainWrapper={{ padding: 20 }}
        tagBorderColor="#CCC"
        tagTextColor="#CCC"
        tagRemoveIconColor="#CCC"
      />
    </View>
  );
};

const FieldsAndMeasuresView = ({ navigation, route }) => {
  const [fields] = useAtom(fieldsAtom);
  const [measures] = useAtom(measuresAtom);

  const goToSupernovaViewer = () => {
    console.log('going to supernova viewer');
    navigation.navigate('SupernovaViewer', {
      connection: route.params.connection,
      fields: fields,
      measures: measures,
    });
  };

  return (
    <AppTemplate>
      <View style={styles.container}>
        <Image style={styles.titleImage} source={titleImage} />
        <Text style={styles.titleText}> Choose Fields and Measures </Text>
        <FieldsView />
        <MeasuresView />
        <Pressable
          style={({ pressed }) => (pressed ? styles.buttonPressed : styles.button)}
          onPress={() => goToSupernovaViewer()}
        >
          <Text style={styles.buttonText}> Confirm </Text>
        </Pressable>
        <Pressable style={({ pressed }) => (pressed ? styles.buttonPressed : styles.button)} onPress={() => goBack()}>
          <Text style={styles.buttonText}> Go Back </Text>
        </Pressable>
      </View>
    </AppTemplate>
  );
};

export default FieldsAndMeasuresView;
