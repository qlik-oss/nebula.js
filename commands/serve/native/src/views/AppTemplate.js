import React from 'react';
import { StyleSheet, View, ScrollView, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    paddingTop: 20,
    flexDirection: 'column',
  },
});

const AppTemplate = ({ useScrollView, children }) => {
  if (useScrollView)
    return (
      <ScrollView style={styles.container}>
        <StatusBar translucent backgroundColor="#1A1A1A" barStyle="light-content" color="#FFFFFF" />
        <LinearGradient colors={['#990997', '#f2af29']}>{children}</LinearGradient>
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
