import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const defaultSettings = {
  apiKey:
    'eyJhbGciOiJFUzM4NCIsImtpZCI6IjVkZTBlYzE2LTNmMzktNGU5ZS1hYmIwLTJhZTk0Y2QxNWE5NyIsInR5cCI6IkpXVCJ9.eyJzdWJUeXBlIjoidXNlciIsInRlbmFudElkIjoidXZTMjlKMjIzSG9jdkxoaGlRdXpxa0R6R05Ud2hfdHYiLCJqdGkiOiI1ZGUwZWMxNi0zZjM5LTRlOWUtYWJiMC0yYWU5NGNkMTVhOTciLCJhdWQiOiJxbGlrLmFwaSIsImlzcyI6InFsaWsuYXBpL2FwaS1rZXlzIiwic3ViIjoiQ2J1LWU4MVpPMzlTLXN2Z3hPUUxUVjZsaFVTclZqOW0ifQ.8YXX36K9Pu2badnWFHu0eo4RnE8eyL1JKpVxvHKxCaigrvks_K1-3rCtW_UlXFJVgP1xqKtYAFGNhaFqwUKV4NZttqN57dYk5teH2Gqt6bkRnKgh4DBtsxbXFE_U70JW',
  tenantURL: 'ecdp1.us.qlikcloud.com',
  appId: '375b58fb-ed16-4c50-a291-719f5e9295fb',
  visId: 'sn-table',
};

class AsyncStorageWrapper {
  static async getItem(key) {
    console.log('getting item', key);
    let config;
    try {
      const temp = await AsyncStorage.getItem(key);
      if (temp) {
        config = JSON.parse(temp);
      }
    } catch (err) {
      console.log('failed to get', err);
    }
    return config;
  }

  static async setItem(key, value) {
    const itemSet = await AsyncStorage.setItem(key, JSON.stringify(value));
    return itemSet;
  }

  static async removeItem(key) {
    try {
      const temp = await AsyncStorage.getItem(key);
      if (temp) {
        await AsyncStorage.setItem(key, '');
        return true;
      }
    } catch (err) {
      console.log('failed to remove', err);
    }
    return false;
  }
}

const enigmaSettingsAtom = atomWithStorage('@config', defaultSettings, AsyncStorageWrapper);

export default enigmaSettingsAtom;
