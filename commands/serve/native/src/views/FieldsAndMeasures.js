import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { useAtom } from 'jotai';
import { fieldsAtom, selectedFieldsAtom, measuresAtom, selectedMeasuresAtom } from '../atoms/FieldsAndMeasuresAtom';
import AppTemplate from './AppTemplate';
import MultiSelect from 'react-native-multiple-select';
import { Picker } from '@react-native-picker/picker';

const titleImage = require('../assets/images/nebulaLogo.png');

const styles = {
  container: {
    flex: 1,
    overflow: 'scroll',
    backgroundColor: 'rgba(0,0,0,0)',
  },
  measureBox: {
    borderWidth: 2,
    borderColor: '#CCC',
    margin: 20,
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
  buttonSmall: {
    margin: 20,
    marginTop: 5,
    backgroundColor: '#FFFFFF',
  },
  buttonSmallPressed: {
    margin: 20,
    marginTop: 5,
    backgroundColor: '#EEEEEE',
  },
  buttonText: {
    fontFamily: 'Montserrat',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 15,
  },
  buttonTextSmall: {
    fontFamily: 'Montserrat',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 10,
  },
};

const FieldsView = () => {
  const [fields] = useAtom(fieldsAtom);
  const [selectedFields, setSelectedFields] = useAtom(selectedFieldsAtom);
  const multiSelect = useRef();

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
      <Text style={styles.subHeading}> Select Dimensions </Text>
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
  const [fields] = useAtom(fieldsAtom);
  const [measures] = useAtom(measuresAtom);
  const [newMeasureSelectedFields, setNewMeasureSelectedFields] = useState([]);
  const [newMeasureState, setNewMeasureState] = useState({ func: [0], fields: ['Dim1'] });
  const [, setSelectedFunc] = useState(0); // used to force rerender on newMeasureState change
  const measuresSelect = useRef();
  const functionSelect = useRef();

  const measureFunctions = [
    { id: 0, name: `\tSum`, text: 'Sum' },
    { id: 1, name: `\tCount`, text: 'Count' },
    { id: 2, name: `\tAvg`, text: 'Avg' },
    { id: 3, name: `\tMin`, text: 'Min' },
    { id: 4, name: `\tMax`, text: 'Max' },
  ];

  useEffect(() => {}, [newMeasureState.func]);

  const onFuncChange = (newFunc) => {
    console.log('newFunc: ', newFunc);
    let nextMeasureState = newMeasureState;
    nextMeasureState.func = newFunc;
    setNewMeasureState(nextMeasureState);
    setSelectedFunc(newFunc[0]);
  };

  const onSelectedMeasuresChange = (sm) => {
    setNewMeasureSelectedFields([...sm]);
  };

  const printFullMeasure = () => {
    const funcString = measureFunctions.filter((m) => m.id === newMeasureState.func[0])[0].text;
    console.log('funcString: ', funcString);
    const fieldsList = selectedMeasures.reduce((fieldString, currentField) => fieldString + currentField + ',', '');
    console.log('fieldListString: ', fieldsList);
  };

  if (measures === undefined || selectedMeasures === undefined) {
    return (
      <View>
        <Text styles={styles.subHeading}>Loading</Text>
      </View>
    );
  }

  console.log(newMeasureState.func);
  console.log(selectedMeasures);
  return (
    <View style={styles.fieldsContainer}>
      <Text style={styles.subHeading}> Select Measures </Text>

      <View style={styles.measureBox}>
        <Text> Select Function </Text>
        <MultiSelect
          items={measureFunctions}
          uniqueKey="id"
          onSelectedItemsChange={onFuncChange}
          selectedItems={newMeasureState.func}
          ref={functionSelect}
          searchInputPlaceholderText={'Choose Function'}
          searchInputStyle={{ color: '#3232a8', margin: 5, padding: 10 }}
          styleInputGroup={{ paddingRight: 20, paddingLeft: 20 }}
          styleListContainer={{ paddingLeft: 20 }}
          styleMainWrapper={{ padding: 20, paddingBottom: 0, paddingTop: 10 }}
          single
        />
        <Text> Select Fields </Text>
        <MultiSelect
          items={fields}
          uniqueKey="id"
          onSelectedItemsChange={onSelectedMeasuresChange}
          selectedItems={newMeasureSelectedFields}
          ref={measuresSelect}
          selectText={`\t Choose Fields`}
          searchInputStyle={{ color: '#3232a8', margin: 5, padding: 10 }}
          styleInputGroup={{ paddingRight: 20 }}
          styleListContainer={{ paddingLeft: 20 }}
          styleMainWrapper={{ padding: 20, paddingBottom: 0, paddingTop: 10 }}
          hideTags
        />
        <Text> Measure </Text>
        <Text> {printFullMeasure()} </Text>
      </View>
      <Pressable style={({ pressed }) => (pressed ? styles.buttonSmallPressed : styles.buttonSmall)}>
        <Text style={styles.buttonTextSmall}>+ Create New Meausure</Text>
      </Pressable>
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

  const goBack = () => {
    console.log('Going back to egine connect view');
    route.params.connection.app.session.close();
    navigation.navigate('EngineConnectView');
  };

  return (
    <AppTemplate useScrollView>
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
