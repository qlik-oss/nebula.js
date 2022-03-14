import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useAtom } from 'jotai';
import { Supernova } from '@qlik/react-native-carbon';
import treemap from '@qlik-trial/sn-treemap';
import snTable from '@nebula.js/sn-table';
// import { supernova as kpi } from '@qlik/sn-native-kpi';
import enigmaSettingsAtom from '../atoms/enigmaSettingsAtom';

const tempTheme = 'tempTheme';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  inner: {
    flex: 1,
  },
  activity: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const getSn = (layout, item) => {
  if (!layout) return null;
  const type = layout.visualization || item.type;
  switch (type) {
    case 'kpi': {
      return '__kpi';
    }
    case 'table': {
      return snTable;
    }
    case 'treemap': {
      return treemap;
    }
    default: {
      return null;
    }
  }
};

const SupernovaView = ({ appData, fullScreen }) => {
  const [enigmaSettings] = useAtom(enigmaSettingsAtom);

  const invalidMessage = {
    value: 'invalidParameters',
    comment: 'invalid or incomplete data passed to supernova',
  };

  const handleOnLongPress = () => {
    console.log('long press occured');
  };

  return (
    <View style={[styles.container]}>
      <Supernova
        testID="supernova"
        id={enigmaSettings.appId}
        sn={getSn({ visualization: 'table' }, appData)}
        app={appData}
        theme={tempTheme}
        style={styles.inner}
        onLongPress={handleOnLongPress}
        showLegend={fullScreen}
        disableLoadAnimations={fullScreen ? true : undefined}
        invalidMessage={invalidMessage}
      />
    </View>
  );
};

export default React.memo(SupernovaView);

// need to add theme={themeObject}
