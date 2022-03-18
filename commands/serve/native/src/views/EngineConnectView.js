import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, Pressable, Image } from 'react-native';
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
  const [visId, setVisId] = useState('sn-table');
  const [connectionRequested, setConnectionRequested] = useState(false);

  // connect to app when global state is updated
  const connection = useConnectToApp(connectionRequested);

  useEffect(() => {
    if (!connection) return;
    if (connection.error) {
      console.log('connection.error is true');
      console.log('Connection: ', connection);
      setError(connection.error);
      setConnectionRequested(false);
      return;
    }
    navigation.navigate('StepThree', {
      connection,
    });
  }, [connection]);

  const requestConnection = () => {
    setEnigmaSettings({
      apiKey,
      tenantURL: tenant,
      appId,
      visId,
    });
    setConnectionRequested(true);
  };

  return (
    <AppTemplate useScrollView>
      <View style={styles.container}>
        <Image style={styles.titleImage} source={titleImage} />
        <Text style={styles.titleText}> Step 1: Connect to an engine </Text>
        <TextInput
          style={styles.inputText}
          value={tenant}
          placeholder="Tenant URL (example: ecdp1.us.qlikcloud.com)"
          onChangeText={(newText) => setTenant(newText)}
        />
        <TextInput
          style={styles.inputText}
          value={appId}
          placeholder="App Id (example: ef6c25de-f02a-4fbd-917e-ead6ee102932)"
          onChangeText={(newText) => setAppId(newText)}
        />
        <TextInput
          multiline
          numberOfLines={5}
          style={styles.inputText}
          value={apiKey}
          placeholder="API Key (example: sjzvooiaevpbawefh38ergb2438)"
          onChangeText={(newText) => setApiKey(newText)}
        />
        <TextInput
          style={styles.inputText}
          value={visId}
          placeholder="Visualization Id (example: kpi)"
          onChangeText={(newText) => setVisId(newText)}
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
          <Text style={styles.subHeading}> WebSocket URL </Text>
          <Text style={styles.simpleText}>
            The development server needs to connect to and communicate with the Qlik Associative Engine running within
            any of Qlik&apos;s product offerings. The connection is done through the WebSocket protocol using a
            WebSocket URL format that differs slightly between products. Enter the WebSocket URL that corresponds to the
            Qlik product you are using.{'\n'}
            {'\n'}
          </Text>

          <Text style={styles.subHeading}> Qlik Cloud Services </Text>
          <Text style={styles.simpleText}>
            WebSocket URL format: {'\n'}
            {'wss://<tenant>.<region>'}.qlikcloud.com?qlik-web-integration-id={'<web-integration-id>'} {'\n'}
            {'\n'}
            Example: {'\n'}wss://qlik.eu.qlikcloud.com?qlik-web-integration-id=xxx {'\n'}
            {'\n'}
            The qlik-web-integration-id must be present in order for QCS to confirm that the request originates from a
            whitelisted domain. {'\n'}
            {'\n'}
            For more info, visit Managing web integrations.{'\n'}
            {'\n'}
          </Text>
        </View>
      </View>
    </AppTemplate>
  );
};

/* const stringifyCyclicStructure = (obj)  => {
    var seen = []
    console.log(JSON.stringify(obj, (key, val) => {
        if (val != null && typeof val == "object") {
            if (seen.indexOf(val) >= 0) {
                return;
            }
            seen.push(val);
        }
        return val;
    }, 2));
} */

export default EngineConnectView;
