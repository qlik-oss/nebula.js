import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, Pressable, Image, LogBox } from 'react-native';
import { useAtom } from 'jotai';
import AppTemplate from './AppTemplate';
import { testKey2 } from '../utils/testKey';
import enigmaSettingsAtom from '../atoms/enigmaSettingsAtom';
import useConnectToApp from '../utils/useConnectToApp';

const titleImage = require('../assets/images/nebulaLogo.png');

const styles = {
  container: {
    flex: 1,
    overflow: 'scroll',
    backgroundColor: 'rgba(0,0,0,0)',
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
  subHeading: {
    fontFamily: 'Montserrat',
    padding: 10,
    fontWeight: 'bold',
  },
  simpleText: {
    fontFamily: 'Montserrat',
    marginLeft: 15,
    marginRight: 15,
    textAlign: 'left',
    backgroundColor: 'rgba(0,0,0,0)',
  },
  inputText: {
    padding: 10,
    backgroundColor: 'white',
    margin: 10,
    marginTop: 0,
  },
  titleImage: {
    width: '100%',
    height: 100,
  },
  button: {
    backgroundColor: 'white',
    color: 'black',
    margin: 10,
    borderWidth: 1,
    borderColor: 'white',
  },
  buttonPressed: {
    backgroundColor: '#EEEEEE',
    color: 'black',
    margin: 10,
    borderWidth: 1,
    borderColor: '#990997',
  },
  buttonText: {
    fontFamily: 'Montserrat',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 15,
  },
  errorPrompt: {},
};

const EngineConnectView = ({ navigation }) => {
  // global state
  const [, setEnigmaSettings] = useAtom(enigmaSettingsAtom);
  // local state
  const [tenant, setTenant] = useState('ecdp1.us.qlikcloud.com');
  const [appId, setAppId] = useState('375b58fb-ed16-4c50-a291-719f5e9295fb');
  const [apiKey, setApiKey] = useState(testKey2);
  const [error, setError] = useState(null);
  const [connectionRequested, setConnectionRequested] = useState(false);

  // connect to app when global state is updated
  const connection = useConnectToApp(connectionRequested);

  useEffect(() => {
    LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
    if (!connection) return;
    if (connection.error) {
      setError(connection.error);
      setConnectionRequested(false);
      return;
    }

    navigation.navigate('FieldsAndMeasures', {
      connection,
    });
  }, [connection]);

  const requestConnection = () => {
    setEnigmaSettings({
      apiKey,
      tenantURL: tenant,
      appId,
    });
    setConnectionRequested(true);
  };

  return (
    <AppTemplate useScrollView>
      <View style={styles.container}>
        <Image style={styles.titleImage} source={titleImage} />
        <Text style={styles.titleText}> Step 1: Connect to an engine </Text>
        <Text style={styles.subHeading}> Tenant URL </Text>
        <TextInput
          style={styles.inputText}
          value={tenant}
          placeholder="Tenant URL (example: ecdp1.us.qlikcloud.com)"
          onChangeText={(newText) => setTenant(newText)}
        />
        <Text style={styles.subHeading}> App ID </Text>
        <TextInput
          style={styles.inputText}
          value={appId}
          placeholder="App Id (example: ef6c25de-f02a-4fbd-917e-ead6ee102932)"
          onChangeText={(newText) => setAppId(newText)}
        />
        <Text style={styles.subHeading}> API Key </Text>
        <TextInput
          multiline
          numberOfLines={5}
          style={styles.inputText}
          value={apiKey}
          placeholder="API Key (example: sjzvooiaevpbawefh38ergb2438)"
          onChangeText={(newText) => setApiKey(newText)}
        />
        {error && (
          <View>
            <Text style={styles.errorPrompt}> {error.message} </Text>
          </View>
        )}
        <Pressable
          style={({ pressed }) => (pressed ? styles.buttonPressed : styles.button)}
          disabled={tenant === '' || appId === '' || apiKey === ''}
          onPress={() => requestConnection()}
        >
          <Text style={styles.buttonText}>Connect</Text>
        </Pressable>
        <View>
          <Text style={styles.subHeading}> How to find your tenant URL: </Text>
          <Text style={styles.simpleText}>
            Log into the hub and copy the URL {'\n'}
            (omit https://) ex: ecdp1.us.qlikcloud.com {'\n'}
          </Text>
          <Text style={styles.subHeading}> How to find your AppId: </Text>
          <Text style={styles.simpleText}>
            1. Open the hub in a browser window. {'\n'}
            2. Open the app you want to connect to. {'\n'}
            3. When the Qlik Sense app has opened, the app ID is visible in the URL: .../sense/app/{'<appId>'}. {'\n'}
          </Text>
          <Text style={styles.subHeading}> How to find your API Key: </Text>
          <Text style={styles.simpleText}>
            1. Open the hub and go to the management console {'\n'}
            2. Click on API keys under Integration {'\n'}
            3. If you are an admin, click &apos;Generate new key&apos; {'\n'}
            4. Copy the generated key
          </Text>
          <Text>
            {'\n'}
            {'\n'}
          </Text>
        </View>
      </View>
    </AppTemplate>
  );
};

export default EngineConnectView;
