import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Supernova } from '@qlik/react-native-carbon';
import horizon from '@qlik-trial/sense-themes-default/dist/horizon/theme.json';
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

const SupernovaView = (params) => (
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

export default React.memo(SupernovaView);
