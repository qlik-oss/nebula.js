import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EngineConnectView from './src/views/EngineConnectView';
import SupernovaViewer from './src/views/SupernovaViewer';

function App() {
  const Stack = createNativeStackNavigator();

  return (
    <React.Suspense fallback={<Text>Loading</Text>}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="EngineConnectView" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="EngineConnectView" component={EngineConnectView} />
          <Stack.Screen name="SupernovaView" component={SupernovaViewer} />
        </Stack.Navigator>
      </NavigationContainer>
    </React.Suspense>
  );
}

export default App;
