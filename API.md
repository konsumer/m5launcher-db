# API

Base URL: `https://m5launcher-db.konsumer.workers.dev/` (replace with your deployed domain)

All endpoints return JSON. CORS is open (`*`).

## Authentication

Mutating endpoints require a GitHub OAuth token in the `Authorization` header:

```
Authorization: Bearer <github_token>
```

To get a token, complete the OAuth flow:

1. Redirect the user to `GET /api/auth/login`
2. GitHub redirects back to your callback with a `?token=` query param
3. Store that token and send it with every write request

The token is validated live against the GitHub API on every request — no sessions are stored server-side.

---

## Apps

### `GET /api/apps`

Returns all apps: community-submitted entries merged with the M5Burner catalog (synced every 2 hours). Community entries take precedence over M5Burner entries with the same name+author or `fid`.

**Response** `200`
```json
[
  {
    "name": "Weather Grrl",
    "author": "konsumer",
    "github": "https://github.com/konsumer/weathergrrl",
    "description": "Simple weather current/forecast.",
    "cover": "https://github.com/konsumer/weathergrrl/raw/main/cover.png",
    "category": "CYD",
    "versions": [
      {
        "version": "v1.0.0",
        "published_at": "2026-03-16",
        "file": "https://github.com/konsumer/weathergrrl/releases/download/v1.0.0/app.bin"
      }
    ],
    "source": "community"
  }
]
```

`source` is `"community"` for user-submitted apps and `"burner"` for M5Burner catalog entries. M5Burner entries also include `fid` (M5Burner ID) and `download` (download count).

---

### `GET /api/apps/:name`

Returns a single community-submitted app by name (slugified: lowercase, spaces → hyphens).

**Response** `200` — app object (same shape as above)
**Response** `404` — `{ "error": "Not found" }`

---

### `POST /api/apps` 🔒

Create a new community app. The `author` field is set to your GitHub login — you cannot submit on behalf of others.

**Request body**
```json
{
  "name": "My App",
  "github": "https://github.com/you/my-app",
  "description": "What it does.",
  "cover": "https://github.com/you/my-app/raw/main/cover.png",
  "category": "CYD",
  "versions": [
    {
      "version": "v1.0.0",
      "published_at": "2026-04-01",
      "file": "https://github.com/you/my-app/releases/download/v1.0.0/app.bin"
    }
  ]
}
```

| Field | Required | Notes |
|---|---|---|
| `name` | yes | Must be unique |
| `github` | yes | |
| `description` | yes | |
| `cover` | yes | URL to cover image |
| `category` | no | See [categories](#categories) |
| `versions` | no | Array of device builds |

**Response** `201` — created app object
**Response** `409` — name already exists

---

### `PUT /api/apps/:name` 🔒

Replace fields on an existing app. Only the original author can edit. All fields are optional — omitted fields keep their current value.

**Request body** — any subset of the `POST` fields (same shape, all optional)

**Response** `200` — updated app object
**Response** `403` — not the author
**Response** `404` — app not found

---

### `PATCH /api/apps/:name` 🔒

Upsert a single device build on an existing app. If a version with the same `version` string already exists it is replaced; otherwise it is appended.

**Request body**
```json
{
  "version": "v1.1.0",
  "published_at": "2026-04-15",
  "file": "https://github.com/you/my-app/releases/download/v1.1.0/app.bin"
}
```

All three fields are required.

**Response** `200` — full updated app object
**Response** `403` — not the author
**Response** `404` — app not found

---

### `DELETE /api/apps/:name` 🔒

Delete an app. Only the original author can delete.

**Response** `200` — `{ "ok": true }`
**Response** `403` — not the author
**Response** `404` — app not found

---

## Auth

### `GET /api/auth/login`

Redirects to GitHub OAuth. After the user authorizes, GitHub redirects to `/api/auth/callback`, which redirects to `/?token=<github_token>`.

### `GET /api/auth/callback`

Internal — handles the OAuth code exchange. Do not call directly.

### `GET /api/auth/user` 🔒

Returns the authenticated user's GitHub profile.

**Response** `200`
```json
{
  "login": "konsumer",
  "name": "David Konsumer",
  "avatar_url": "https://avatars.githubusercontent.com/u/..."
}
```

### `POST /api/auth/logout`

No-op — tokens are not stored server-side. Clear the token client-side.

---

## Error responses

All errors return JSON:

```json
{ "error": "Description of the problem" }
```

| Status | Meaning |
|---|---|
| `400` | Bad request / missing required field |
| `401` | Missing or invalid GitHub token |
| `403` | Valid token but not the resource owner |
| `404` | App not found |
| `405` | Method not allowed |
| `409` | App name already exists |

---

## Categories

Valid values for the `category` field:

`airq` `arduino nesso n1` `atom` `atoms3` `capsule` `cardputer` `chain dualkey` `core` `core2` `coreink` `cores3` `CYD` `dial` `dinmeter` `esp32-h2` `marauder` `nanoc6` `NM-CYD-C5` `paper` `phantom` `powerhub` `smoochiee_v2` `stamp` `stamps3` `station` `stickc` `stickv` `t-deck` `t-deck-pro` `t-embed-cc1101` `t-hmi` `t-lite` `t-lora-pager` `t-watch-s3` `tab5` `third party` `timercam` `unit-poe-p4` `unitc6l`
