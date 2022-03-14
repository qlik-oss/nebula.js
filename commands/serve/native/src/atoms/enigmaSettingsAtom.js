import { atomWithStorage } from 'jotai/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const defaultSettings = {
  apiKey:
    'eyJhbGciOiJFUzM4NCIsImtpZCI6IjAxNGU5YTAyLTMwZDktNDUxMC1hNjdlLWZlYzhlZWVjYWZjNCIsInR5cCI6IkpXVCJ9.eyJzdWJUeXBlIjoidXNlciIsInRlbmFudElkIjoidXZTMjlKMjIzSG9jdkxoaGlRdXpxa0R6R05Ud2hfdHYiLCJqdGkiOiIwMTRlOWEwMi0zMGQ5LTQ1MTAtYTY3ZS1mZWM4ZWVlY2FmYzQiLCJhdWQiOiJxbGlrLmFwaSIsImlzcyI6InFsaWsuYXBpL2FwaS1rZXlzIiwic3ViIjoiQ2J1LWU4MVpPMzlTLXN2Z3hPUUxUVjZsaFVTclZqOW0ifQ.vxFdBKQ0IBHXOO-I1CK5sN49JA2-REO44SfhkMD01e9heKiVlDe4wTB-n-Lom6sNlCK4shEuCh0KTNIaYDeGhJ2CbfKVW4fGFU_j5yNqvnyHyAlDW8-7TiWXKCRsH3iS',
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
