#! /usr/bin/env node

const fs = require('fs');
const path = require('path');
const globby = require('globby');

const LOCALES_DIR = path.resolve(__dirname, '../locales');
const LOCALES_FILES = globby.sync([`${LOCALES_DIR}/*.json`]);
const LOCALE_PKG_DIR = path.resolve(__dirname, '..');
const ALL = path.resolve(`${LOCALE_PKG_DIR}`, 'all.json');

const LOCALES = {
  'en-US': 'en-US',
  en: 'en-US',
  de: 'de-DE',
  fr: 'fr-FR',
  it: 'it-IT',
  ja: 'ja-JP',
  ko: 'ko-KR',
  nl: 'nl-NL',
  pl: 'pl-PL',
  pt: 'pt-BR',
  ru: 'ru-RU',
  sv: 'sv-SE',
  tr: 'tr-TR',
  'zh-CN': 'zh-CN',
  'zh-TW': 'zh-TW',
  es: 'es-ES',
};

const merged = {};

for (const file of LOCALES_FILES) {
  const short = path.parse(file).name;
  const locale = LOCALES[short];
  const content = JSON.parse(fs.readFileSync(file, 'utf8'));

  Object.keys(content).reduce((acc, curr) => {
    const key = curr.replace(/\./g, '_');
    if (!acc[key]) {
      acc[key] = {
        id: curr,
      };
    }
    if (!acc[key].locale) {
      acc[key].locale = {};
    }
    acc[key].locale[locale] = content[curr].value;
    const localeObj = acc[key].locale[locale];
    Object.keys(acc[key].locale[locale])
      .sort()
      .reduce((a, c) => {
        a[c] = localeObj[c]; // eslint-disable-line no-param-reassign
        return a;
      }, localeObj);
    return acc;
  }, merged);
}

fs.writeFileSync(ALL, JSON.stringify(merged, ' ', 2));
