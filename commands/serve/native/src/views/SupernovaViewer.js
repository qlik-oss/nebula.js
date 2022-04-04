import React from 'react';
import { View, StyleSheet, Image, Pressable, Text } from 'react-native';
import AppTemplate from './AppTemplate';
import SupernovaView from './SupernovaView';

const titleImage = require('../assets/images/nebulaLogo.png');

const styles = StyleSheet.create({
  viewer: {
    flex: 1,
    padding: 20,
    margin: 20,
    backgroundColor: '#FFFFFF',
  },
  titleImage: {
    width: '100%',
    height: 100,
  },
});

const SupernovaViewer = ({ navigation, route }) => {
  const goBack = () => {
    navigation.navigate('StepOne');
  };

  return (
    <AppTemplate useScrollView>
      <Image style={styles.titleImage} source={titleImage} />
      <View>
        <Pressable onPress={() => goBack()}>
          <Text>Go Back</Text>
        </Pressable>
      </View>
      <View style={styles.viewer}>
        <SupernovaView appData={route.params.connection.app} fullScreen={false} />
      </View>
    </AppTemplate>
  );
};

export default SupernovaViewer;
