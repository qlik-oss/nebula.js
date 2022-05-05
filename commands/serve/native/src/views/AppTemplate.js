import React from 'react';
import { StyleSheet, View, ScrollView, StatusBar, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    paddingTop: 20,
    flexDirection: 'column',
    borderWidth: 5,
    borderColor: 'red',
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#1A1A1A',
    paddingTop: 20,
    flexDirection: 'column',
    borderWidth: 5,
    borderColor: 'red',
  },
  linearGradient: {
    minHeight: Dimensions.get('window').height,
    paddingBottom: 50,
  },
});

const AppTemplate = ({ useScrollView, children }) => {
  if (useScrollView)
    return (
      <ScrollView style={styles.containerScroll}>
        <StatusBar translucent backgroundColor="#1A1A1A" barStyle="light-content" color="#FFFFFF" />
        <LinearGradient colors={['#990997', '#f2af29']} style={styles.linearGradient}>
          {children}
        </LinearGradient>
      </ScrollView>
    );
  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="#1A1A1A" barStyle="light-content" color="#FFFFFF" />
      <LinearGradient style={{ flex: 1 }} colors={['#990997', '#f2af29']}>
        {children}
      </LinearGradient>
    </View>
  );
};

export default AppTemplate;
