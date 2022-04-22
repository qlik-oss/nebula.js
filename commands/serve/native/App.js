import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EngineConnectView from './src/views/EngineConnectView';
import FieldsAndMeasures from './src/views/FieldsAndMeasures';
import SupernovaViewer from './src/views/SupernovaViewer';

function App() {
  const Stack = createNativeStackNavigator();

  return (
    <React.Suspense fallback={<Text>Loading</Text>}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="EngineConnectView" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="EngineConnectView" component={EngineConnectView} />
          <Stack.Screen name="FieldsAndMeasures" component={FieldsAndMeasures} />
          <Stack.Screen name="SupernovaViewer" component={SupernovaViewer} />
        </Stack.Navigator>
      </NavigationContainer>
    </React.Suspense>
  );
}

export default App;
