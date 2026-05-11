import { test, expect } from '@playwright/test';
import mockQixEngine from '../mock-qix';

const BASE = 'http://localhost:8700';

// URL that navigates directly to the /dev route with a local (noauth) engine.
// The appId is embedded in the engine_url path (/app/<id>) because
// getConnectionInfo() only extracts appId from parseEngineURL's path match —
// a separate &app= param is only honoured when engine_url is absent.
const DEV_URL = `${BASE}/dev?engine_url=ws://localhost:9076/app/test-app-id`;

// Inject a minimal supernova so the serve UI can render a visualization
// without loading a real chart bundle.
const INJECT_SUPERNOVA = () => {
  // eslint-disable-next-line no-undef
  window['sn-serve-test'] = function snServeTest() {
    return {
      qae: {
        properties: {
          initial: {
            qInfo: { qType: 'sn-serve-test' },
            visualization: 'sn-serve-test',
          },
        },
      },
      component() {
        return {
          mounted() {
            this.element.style.cssText =
              'width:100%;height:100%;background:#1a6496;display:flex;align-items:center;justify-content:center;color:#fff;font-family:sans-serif;font-size:20px;border-radius:4px';
            this.element.textContent = 'Mock Visualization';
          },
          beforeDestroy() {
            this.element.textContent = '';
          },
        };
      },
    };
  };
};

test.describe('serve /dev route visual tests', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ page }) => {
    // Inject the mock supernova before any page scripts run
    await page.addInitScript(INJECT_SUPERNOVA);

    // Mock the QIX engine WebSocket — the serve UI opens a noauth connection
    // to ws://localhost:9076/app/test-app-id via @qlik/api/qix openAppSession
    await page.routeWebSocket('ws://localhost:9076/**', mockQixEngine);
  });

  test('toolbar renders with Create/Edit tabs and controls', async ({ page }) => {
    await page.goto(DEV_URL);

    // Wait for the toolbar to appear — it renders independently of the engine connection
    const toolbar = page.locator('[class*="MuiToolbar"]').first();
    await toolbar.waitFor({ state: 'visible', timeout: 15000 });

    await expect(page).toHaveScreenshot('toolbar.png', { fullPage: false });
  });

  test('Create tab shows the visualization stage', async ({ page }) => {
    await page.goto(DEV_URL);

    // The stage renders once the supernova type is resolved and the app is open.
    // The mock engine responds to CreateSessionObject so the chart shell renders.
    // Fall back to waiting for the engine connection to resolve (spinner disappears)
    await page
      .locator('[class*="CircularProgress"]')
      .waitFor({ state: 'hidden', timeout: 20000 })
      .catch(() => {});

    await expect(page).toHaveScreenshot('create-tab.png', { fullPage: false });
  });

  test('Edit tab shows object collection', async ({ page }) => {
    await page.goto(DEV_URL);

    // Switch to Edit tab
    await page.locator('[aria-label="Navigation"] [role="tab"]').nth(1).click();
    await expect(page.locator('[aria-label="Navigation"] [role="tab"]').nth(1)).toHaveAttribute(
      'aria-selected',
      'true'
    );

    await expect(page).toHaveScreenshot('edit-tab.png', { fullPage: false });
  });

  test('dark mode toggles the background colour', async ({ page }) => {
    await page.goto(DEV_URL);

    // Click the light/dark toggle icon button (only present when no custom themes)
    await page.locator('[title="Toggle light/dark mode"]').click();
    await expect(page).toHaveScreenshot('dark-mode.png', { fullPage: false });
  });
});
