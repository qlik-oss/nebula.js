#! /usr/bin/env node
import { globbySync } from 'globby';
import { fileURLToPath } from 'node:url';
import fs from 'fs';
import path from 'path';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LOCALES_DIR = path.resolve(__dirname, '../locales');
const LOCALES_FILES = globbySync([`${LOCALES_DIR}/*.json`]);
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
    return acc;
  }, merged);
}

fs.writeFileSync(ALL, JSON.stringify(merged, ' ', 2));
