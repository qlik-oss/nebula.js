import fs from 'fs';
import path from 'path';

import { chromium } from '@playwright/test';

import { writeSmokeFiles } from '../smoke-fixture.js';

const getDefaultExport = (mod) => mod.default || mod;

const loadServe = async () => {
  try {
    return getDefaultExport(await import('@nebula.js/cli-serve/lib/serve.js'));
  } catch (primaryError) {
    try {
      const fallbackUrl = new URL('../../../serve/lib/serve.js', import.meta.url);
      return getDefaultExport(await import(fallbackUrl.href));
    } catch (fallbackError) {
      throw new Error(`Smoke step could not load cli-serve: ${fallbackError.message || primaryError.message}`);
    }
  }
};

export const runSmokeStep = async ({ cwd, type, entry, dataRequirements, smokeTimeout }) => {
  let serve;
  try {
    serve = await loadServe();
  } catch (error) {
    return {
      ok: false,
      skipped: true,
      details: error.message,
    };
  }

  const smokeFiles = writeSmokeFiles({ type, dataRequirements });
  let server;
  let browser;

  try {
    server = await serve({
      cwd,
      config: smokeFiles.configFile,
      entry,
      type,
      open: false,
      build: true,
      fixturePath: smokeFiles.fixtureRoot,
    });

    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const fixtureName = `./${path.basename(smokeFiles.fixtureFile)}`;

    await page.goto(`${server.url}/eRender.html?fixture=${encodeURIComponent(fixtureName)}`, {
      waitUntil: 'domcontentloaded',
      timeout: smokeTimeout,
    });

    await page.waitForFunction(() => window.__NEBULA_VALIDATE_ON_RENDER__ === true, {
      timeout: smokeTimeout,
    });

    return {
      ok: true,
      skipped: false,
      details: 'Fixture rendered and onRender was called',
    };
  } catch (error) {
    return {
      ok: false,
      skipped: false,
      details: error.message,
    };
  } finally {
    if (browser) {
      await browser.close();
    }
    if (server && server.close) {
      await server.close();
    }
    fs.rmSync(smokeFiles.fixtureRoot, { recursive: true, force: true });
  }
};
