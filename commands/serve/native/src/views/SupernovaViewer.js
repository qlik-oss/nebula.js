import React from 'react';
import { View, StyleSheet, Image, Pressable, Text } from 'react-native';
import AppTemplate from './AppTemplate';
import SupernovaView from './SupernovaView';
import { measuresAtom } from '../atoms/FieldsAndMeasuresAtom';
import { fieldsAtom } from '../atoms/FieldsAndMeasuresAtom';
import { useAtom } from 'jotai';
const titleImage = require('../assets/images/nebulaLogo.png');

const styles = StyleSheet.create({
  viewer: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
    margin: 20,
    backgroundColor: '#FFFFFF',
  },
  titleImage: {
    width: '100%',
    height: 100,
  },
  backButtonContainer: {
    backgroundColor: 'yellow',
    padding: 20,
    marginTop: 20,
    marginLeft: 20,
    marginRight: 20,
    alignItems: 'center',
  },
});

const SupernovaViewer = ({ navigation, route }) => {
  const [measures] = useAtom(measuresAtom);
  const [fields] = useAtom(fieldsAtom);

  const goBack = () => {
    navigation.navigate('FieldsAndMeasures', {
      connection: route.params.connection,
    });
  };
  console.log('measures: ', measures);
  console.log('fields: ', fields);
  // returns an array of strings where each item is a representation of a field
  const formatFields = () => {
    const arrayOfStrings = fields.map((f) => f.name);
    return arrayOfStrings;
  };
  // returns an array of strings where each item is a representation of a measure
  const formatMeasures = () => {
    const arrayOfStrings = measures.map((m) => m.text);
    return arrayOfStrings;
  };
  return (
    <AppTemplate>
      <Image style={styles.titleImage} source={titleImage} />
      <View style={styles.backButtonContainer}>
        <Pressable onPress={() => goBack()}>
          <Text>Go Back</Text>
        </Pressable>
      </View>
      <View style={styles.viewer}>
        <SupernovaView
          connection={route.params.connection}
          fields={formatFields()}
          measures={formatMeasures()}
          fullScreen={false}
        />
      </View>
    </AppTemplate>
  );
};

export default SupernovaViewer;
