This is a simple community-database for ESP32 firmwares (for use in [Launcher](https://bmorcelli.github.io/Launcher/).)

This provides an API and frontend. Operations that mutate require Github auth.

## Setup

### 1. Install dependencies

```sh
npm install
```

### 2. Create KV namespace

```sh
npx -y wrangler kv namespace create APPS_KV
```

Copy the IDs into `wrangler.toml` to replace the placeholder values.

## 3. Create a GitHub OAuth App

1. Go to https://github.com/settings/developers → **OAuth Apps** → **New OAuth App**
2. Set **Homepage URL** to your Pages URL (e.g. `https://m5launcher-db.konsumer.workers.dev`)
3. Set **Authorization callback URL** to `https://m5launcher-db.konsumer.workers.dev/api/auth/callback`
4. Copy the **Client ID** and generate a **Client Secret**

### 4. Set secrets

```sh
npx -y wrangler secret put GITHUB_CLIENT_ID
npx -y wrangler secret put GITHUB_CLIENT_SECRET
```

For local dev, create a `.dev.vars` file (gitignored):

```
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

### 5. Local development

```sh
npm start
```

This starts Vite + the Pages Functions worker locally. The OAuth callback will redirect
to `http://localhost:5173/api/auth/callback` — make sure your GitHub OAuth app has
`http://localhost:5173/api/auth/callback` added as an additional callback URL (or create
a separate dev OAuth app).

### 6. Deploy

```sh
npm run deploy
```

Cloudflare also allows you to tie deploys to gihub pushes.
