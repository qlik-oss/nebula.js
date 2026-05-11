/**
 * Minimal QIX (Qlik engine) WebSocket mock for Playwright tests.
 *
 * Handles just enough of the JSON-RPC-over-WebSocket protocol to make
 * the serve /dev UI render a visualization without a real Qlik engine.
 *
 * Handle conventions:
 *   -1 = Global (engine root)
 *    1 = Doc (opened app)
 *   2+ = GenericObjects (visualization instances)
 */

function handleRequest(req, allocHandle) {
  switch (req.method) {
    // ── Global (handle -1) ──────────────────────────────────────────────
    case 'OpenDoc':
      return { qReturn: { qType: 'Doc', qHandle: 1 } };

    case 'GetDocList':
      return { qDocList: [] };

    case 'GetConfiguration':
      return { qConfig: { qFeatures: { qIsDesktop: false } } };

    // ── Doc (handle 1) ──────────────────────────────────────────────────
    case 'CreateSessionObject': {
      const handle = allocHandle();
      return { qReturn: { qType: 'GenericObject', qHandle: handle } };
    }

    case 'DestroySessionObject':
      return { qSuccess: true };

    // ── GenericObject (handle 2+) ───────────────────────────────────────
    case 'GetProperties':
    case 'GetFullPropertyTree':
      return {
        qProp: {
          qInfo: { qId: 'sn-obj-1', qType: 'sn-serve-test' },
          visualization: 'sn-serve-test',
        },
      };

    case 'GetLayout':
      return {
        qLayout: {
          qInfo: { qId: 'sn-obj-1', qType: 'sn-serve-test' },
          visualization: 'sn-serve-test',
          qSelectionInfo: { qInSelections: false },
        },
      };

    case 'SetProperties':
      return { qSuccess: true };

    // ── Session / event subscriptions (enigma internals) ───────────────
    case 'GetInteract':
    case 'On':
    case 'Off':
    default:
      return {};
  }
}

/**
 * Attaches the QIX mock to a Playwright WebSocketRoute.
 * Call this inside page.routeWebSocket() handler.
 *
 * @param {import('@playwright/test').WebSocketRoute} ws
 */
export default function mockQixEngine(ws) {
  let nextHandle = 2;

  ws.onMessage((message) => {
    let req;
    try {
      req = JSON.parse(message);
    } catch {
      return;
    }

    const result = handleRequest(req, () => nextHandle++);
    ws.send(
      JSON.stringify({
        jsonrpc: '2.0',
        id: req.id,
        result,
      })
    );
  });
}
