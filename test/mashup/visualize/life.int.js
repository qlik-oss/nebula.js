describe('object lifecycle', () => {
  const waitForTextStatus = async (selector, text, options = { timeout: 1000 }) => {
    await page.waitForSelector(selector, { visible: true });
    await page.waitForFunction(
      (s, t) => document.querySelector(s) && document.querySelector(s).textContent === t,
      options,
      `${selector}`,
      text
    );
  };
  before(async () => {
    await page.goto(`${process.env.BASE_URL}/visualize/life.html`);
    await page.waitForSelector('button[data-phase="init-as-bad-type"]', { visible: true });
  });

  it('should fail to load unknown type', async () => {
    await page.click('button[data-phase="init-as-bad-type"]');
    await waitForTextStatus(
      '[data-tid="error-title"]',
      "Could not find a version of 'voooz' that supports current object version. Did you forget to register voooz?"
    );
  });

  it('should show requirements for known type', async () => {
    await page.click('button[data-phase="set-proper-type"]');
    await waitForTextStatus('[data-tid="error-title"]', 'Incomplete visualization');
  });

  // need to fix calc condition view first
  it('should show calculation unfulfilled', async () => {
    await page.click('button[data-phase="set-calc-condition"]');
    await waitForTextStatus('[data-tid="error-title"]', 'The calculation condition is not fulfilled');
  });

  it('should render when requirements are fulfilled', async () => {
    await page.click('button[data-phase="fulfill-requirements"]');
    await waitForTextStatus('.rendered', 'Success!');
  });

  it('should render long running query', async () => {
    await page.click('button[data-phase="long-running-query"]');

    // the cancel button should appear after 2000ms
    // TODO - fix error thrown when long running query is cancelled
    // await waitForTextStatus('.njs-cell button', 'Cancel', { timeout: 2500 });
    // await page.click('.njs-cell button');
    // await waitForTextStatus('.njs-cell button', 'Retry');

    await waitForTextStatus('.pages', '4001', { timeout: 5000 });
  });

  it('should destroy', async () => {
    await page.click('button[data-phase="destroy"]');
    // wait for some time to ensure destroy has been run and no errors are thrown
    await page.waitFor(100);
  });
});
