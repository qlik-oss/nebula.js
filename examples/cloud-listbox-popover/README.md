# cloud-listbox-popover

A test mashup for verifying how a listbox behaves when embedded in a popover via `embed.field().mount()` against a Qlik cloud tenant.

## Prerequisites

- Node.js and Yarn installed
- Access to a Qlik cloud tenant with a web integration ID whitelisted for `http://localhost:1234`

> **Note:** This example is always wired to the **local** nebula.js source via `resolutions` in `package.json`. Stardust loads from `dist/stardust.dev.js` — changes to source only take effect after rebuilding (see Part 2).

---

## Part 1 — Setup and start

### 1. Configure the tenant

Open your app on the tenant. Copy the tenant hostname and app UUID from the URL:
```
https://<tenant>/sense/app/<APP_ID>/...
```

Edit `connect.js` and fill in the three values:
```js
const TENANT = 'your-tenant.eu.qlik.com';
const WEB_INTEGRATION_ID = 'your-web-integration-id';
const APP_ID = 'your-app-id-here';
```

Create the web integration in the Qlik Management Console (**Web integrations → Create new**) and add `http://localhost:1234` as an allowed origin.

### 2. Set the field name

Edit `index.js` and set `FIELD` to any dimension that exists in your app:
```js
const FIELD = 'Alpha';
```

### 3. Install dependencies

```sh
cd examples/cloud-listbox-popover
yarn install
```

### 4. Start the server

```sh
kill $(lsof -ti :1234) 2>/dev/null; yarn start
```

Opens at `http://localhost:1234`. On first load you will be redirected to the Qlik login page — sign in and you will be sent back automatically. Press `Cmd+Shift+R` to bypass the cache.

---

## Part 2 — After making a local change

Parcel does not watch `dist/` or `node_modules/`, so it must be restarted after every source rebuild. The `rebuild` script does all three steps in one go: rebuilds stardust with rollup, kills the old Parcel process, clears its cache, and starts fresh.

```sh
cd examples/cloud-listbox-popover
yarn run rebuild
```

> **Important:** Use `yarn run rebuild`, not `yarn rebuild`. In yarn berry, `yarn rebuild` is a built-in command that rebuilds native addons — it will not run the script above.

Hard-refresh the browser once it opens: `Cmd+Shift+R`.

> **Tip:** Console logs inside a component's render function only fire when the component mounts or updates — open the popover after refreshing to trigger the render.

---

## What to verify

Click **"Open listbox popover"** and inspect the listbox inside the 220px container.

