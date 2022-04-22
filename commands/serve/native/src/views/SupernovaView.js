import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAtom } from 'jotai';
import { Supernova } from '@qlik/react-native-carbon';
import horizon from '@qlik-trial/sense-themes-default/dist/horizon/theme.json';
import enigmaSettingsAtom from '../atoms/enigmaSettingsAtom';
import sn from '../sn/sn.js';
// import snapshooter from '../../../lib/snapshot-server';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  inner: {
    flex: 1,
    margin: 10,
  },
  activity: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const SupernovaView = (params) => {
  console.log('sn function object', sn());
  const [enigmaSettings] = useAtom(enigmaSettingsAtom);
  const invalidMessage = {
    value: 'invalidParameters',
    comment: 'invalid or incomplete data passed to supernova',
  };

  const handleOnLongPress = () => {
    console.log('long press occured');
  };

  console.log('params.connection: ', params.connection);

  return (
    <View style={[styles.container]}>
      <Supernova
        sn={sn}
        style={styles.supernova}
        app={params.connection.app}
        fields={params.fields}
        measures={params.measures}
        theme={horizon}
      />
    </View>
  );

  // pass in fields instead of id
  /*
  return (
    <View style={[styles.container]}>
      <Supernova
        testID="supernova"
        fields={['AsciiNum', 'Dim1']}
        sn={sn()}
        app={params.appData}
        theme={horizon}
        style={styles.inner}
        showLegend={params.fullScreen}
        disableLoadAnimations={params.fullScreen ? true : undefined}
        onLongPress={handleOnLongPress}
        invalidMessage={invalidMessage}
      />
    </View>
  );
  */
};

export default React.memo(SupernovaView);

// need to add theme={themeObject}

// object={}
// loadLayout={}
