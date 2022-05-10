import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { useAtom } from 'jotai';
import MultiSelect from 'react-native-multiple-select';
import { fieldsAtom, selectedFieldsAtom, measuresAtom } from '../atoms/FieldsAndMeasuresAtom';
import AppTemplate from './AppTemplate';

const titleImage = require('../assets/images/nebulaLogo.png');

const styles = {
  container: {
    flex: 1,
    overflow: 'scroll',
    backgroundColor: 'rgba(0,0,0,0)',
  },
  measureBox: {
    borderWidth: 2,
    borderColor: '#000',
    margin: 20,
    padding: 10,
  },
  measureText: {
    backgroundColor: '#CCCCCC',
    margin: 10,
    marginLeft: 20,
    marginRight: 20,
    padding: 10,
    paddingLeft: 30,
    flex: 4,
  },
  existingMeasure: {
    flexDirection: 'row',
    display: 'flex',
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
  deleteButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 9,
    marginBottom: 9,
    marginRight: 20,
    borderRadius: 10,
    backgroundColor: 'white',
  },
};

const FieldsView = () => {
  const [fields] = useAtom(fieldsAtom);
  const [selectedFields, setSelectedFields] = useAtom(selectedFieldsAtom);
  const multiSelect = useRef();

  const onSelectedFieldsChange = (sf) => {
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
  const [measures, setMeasures] = useAtom(measuresAtom);
  const [newMeasureSelectedFields, setNewMeasureSelectedFields] = useState([]); // needed for the multiselect
  const [newMeasureState, setNewMeasureState] = useState({ func: [0], fields: [] }); // func needs to be an array to be compatable with multiselect
  const [isCreating, setIsCreating] = useState(false);
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

  // handles a change to the selected function
  const onFuncChange = (newFunc) => {
    const nextMeasureState = { ...newMeasureState, func: newFunc };
    setNewMeasureState(nextMeasureState);
    setSelectedFunc(newFunc[0]); // force rerender
  };

  // handles a change to the selected list of fields
  const onSelectedFieldsChange = (sm) => {
    const measureState = newMeasureState;
    setNewMeasureState({ ...measureState, fields: sm });
    setNewMeasureSelectedFields([...sm]);
  };

  // gets a measure object from measureFunctions by id
  const getNewMeasureFunction = () => measureFunctions.filter((m) => m.id === newMeasureState.func[0])[0];

  const getFieldsById = (ids) => fields.filter((f) => ids.includes(f.id));

  // prints the current new measure as a string
  const printNewMeasure = () => {
    const fieldsList = newMeasureState.fields.reduce(
      (fieldString, currentField) => `${fieldString} ${getFieldsById([currentField])[0].name},`,
      ''
    );
    return `funcString([${fieldsList.slice(0, -1)}])`;
  };

  // handles "add measure" button press
  const handleAddMeasurePress = () => {
    const mFunctionObject = getNewMeasureFunction();
    const newMeasuresAtomValue = [
      ...measures,
      {
        func: mFunctionObject.text,
        fields: newMeasureState.fields,
        text: printNewMeasure(),
      },
    ];
    setMeasures(newMeasuresAtomValue);
    setNewMeasureSelectedFields([]);
    setNewMeasureState({ func: [0], fields: [] });
    setIsCreating(false);
  };

  const handleDeleteMeasure = (text) => {
    const newMeasureList = measures.filter((m) => m.text !== text);
    setMeasures(newMeasureList);
  };

  if (measures === undefined || fields === undefined) {
    return (
      <View>
        <Text styles={styles.subHeading}>Loading</Text>
      </View>
    );
  }

  return (
    <View style={styles.fieldsContainer}>
      <Text style={styles.subHeading}> Select Measures </Text>
      {measures.map((m) => (
        <View style={styles.existingMeasure}>
          <Text key={m.id} style={styles.measureText}>
            {' '}
            {m.text}{' '}
          </Text>
          <Pressable style={styles.deleteButton} onPress={() => handleDeleteMeasure(m.text)}>
            <Text>X</Text>
          </Pressable>
        </View>
      ))}

      {isCreating ? (
        <View style={styles.measureBox}>
          <Text> Select Function </Text>
          <MultiSelect
            items={measureFunctions}
            uniqueKey="id"
            onSelectedItemsChange={onFuncChange}
            selectedItems={newMeasureState.func}
            ref={functionSelect}
            searchInputPlaceholderText="Choose Function"
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
            onSelectedItemsChange={onSelectedFieldsChange}
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
          <Text style={styles.measureText}> {printNewMeasure()} </Text>
          <Pressable
            style={({ pressed }) => (pressed ? styles.buttonSmallPressed : styles.buttonSmall)}
            onPress={() => {
              handleAddMeasurePress();
            }}
          >
            <Text style={styles.buttonTextSmall}>Add Measure</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={({ pressed }) => (pressed ? styles.buttonSmallPressed : styles.buttonSmall)}
          onPress={() => {
            setIsCreating(true);
          }}
        >
          <Text style={styles.buttonTextSmall}>+ Create New Meausure</Text>
        </Pressable>
      )}
    </View>
  );
};

const FieldsAndMeasuresView = ({ navigation, route }) => {
  const [fields, setFields] = useAtom(fieldsAtom);
  const [measures, setMeasures] = useAtom(measuresAtom);
  const [, setSelectedFields] = useAtom(selectedFieldsAtom);

  const goToSupernovaViewer = () => {
    navigation.navigate('SupernovaViewer', {
      connection: route.params.connection,
      fields,
      measures,
    });
  };

  const goBack = async () => {
    setMeasures([]);
    setFields([]);
    setSelectedFields([]);
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
