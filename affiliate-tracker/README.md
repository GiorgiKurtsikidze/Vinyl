# Affiliate Workflow Tracker

A Firebase-backed pipeline that lets affiliate / biz-dev teams keep upper management in the loop in real time. The UI mirrors the spreadsheet-style workflow your team already knows, adds guardrails (filters, status badges, import/export), and layers on an AI assistant that turns raw Slack/email notes into structured deals automatically.

## Key features

- 🔁 **Realtime Firestore sync** – everybody sees the same pipeline instantly.
- 🧠 **AI ingestion** – paste raw updates and the assistant creates/updates rows for you.
- 📥 **Bulk import/export** – paste JSON to seed deals or export CSV snapshots for finance.
- 🔎 **Inline editing + filters** – update every cell without leaving the table, filter by geo/model/status.
- ⚙️ **Configurable collection path** – point at shared preview data or your own `deals` collection.
- 🌐 **Production-ready stack** – React + Vite + Tailwind, deployable to any static host (Vercel, Netlify, Cloudflare, S3, etc.).

## Getting started

```bash
git clone <repo>
cd affiliate-tracker
npm install
cp .env.example .env.local  # add your secrets
npm run dev                 # http://localhost:5173
```

### Environment variables

Everything is read via Vite’s `import.meta.env.*`. Copy `.env.example` and fill in the values:

| Variable | Description |
| --- | --- |
| `VITE_FIREBASE_*` | Standard Firebase web config keys (API key, auth domain, etc.). |
| `VITE_FIREBASE_CUSTOM_TOKEN` (optional) | Provide if you issue custom auth tokens; otherwise the app signs in anonymously. |
| `VITE_APP_SCOPE_ID` | Logical environment label (`affiliate-workflow`, `preview`, etc.). Used inside Firestore paths. |
| `VITE_FIRESTORE_COLLECTION_PATH` | Where deals live. Defaults to `artifacts/{APP_ID}/public/data/deals`. `{APP_ID}` expands to `VITE_APP_SCOPE_ID`. |
| `VITE_OPENAI_API_KEY` | API key for the AI service. |
| `VITE_OPENAI_MODEL` | Chat model name (defaults to `gpt-4o-mini`). |
| `VITE_OPENAI_BASE_URL` | Chat Completions-compatible endpoint. Works with OpenAI, OpenRouter, Azure OpenAI, Fireworks, etc. |

> Commit `.env.local` to your hosting provider (or set the variables in their dashboard) but never to Git.

### Firebase setup

1. Create a Firebase project and enable **Authentication → Anonymous** (or your preferred auth provider).
2. Enable **Cloud Firestore** in “production mode”.
3. Create the collection path you referenced in `VITE_FIRESTORE_COLLECTION_PATH`.  
   - Example (shared preview data): `artifacts/my-affiliate-tracker/public/data/deals`.  
   - Example (simple production path): `deals`.
4. Suggested security rules (restrict writes to authenticated users, optionally per environment):

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/public/data/deals/{dealId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

Adapt the path to whatever you configured. For managed-field updates (e.g., sales ops only), lock down the `allow write` logic accordingly.

### AI ingestion configuration

The helper in `src/lib/ai.ts` expects any endpoint that follows the [OpenAI Chat Completions](https://platform.openai.com/docs/api-reference/chat) contract. To use Gemini or Claude, proxy them through a compatibility layer (e.g., [OpenRouter](https://openrouter.ai/), [Groq Cloud](https://console.groq.com/)) and point `VITE_OPENAI_BASE_URL` to that proxy.

The assistant:

1. Receives your raw notes.
2. Forces JSON output via a schema.
3. Matches rows by partner name (case-insensitive) and updates them; otherwise it creates new deals with defaults.

If you want the AI to enrich extra fields (payouts, currencies, etc.), extend the schema in `src/lib/ai.ts` and the table columns in `src/App.tsx`.

### Commands

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start Vite dev server with HMR. |
| `npm run build` | Production build (emits to `dist/`). |
| `npm run preview` | Preview the production build locally. |

### Deploying to your domain

1. Run `npm run build`.
2. Upload the `dist/` folder to your host of choice:
   - **Vercel / Netlify / Cloudflare Pages** – select Vite preset (`npm run build`, output `dist`).
   - **S3 + CloudFront** – sync the folder and enable SPA fallback.
3. Set the same environment variables in your hosting platform (Firebase config + AI keys).
4. Point your domain’s DNS at the hosting provider.

Because everything is static assets + Firebase SDK calls, no custom server is required.

### Data model recap

Each deal document stores:

| Field | Type | Notes |
| --- | --- | --- |
| `name` | `string` | Partner name (used as the AI match key). |
| `geo` | `string` | Defaults to `UK`. |
| `source` | `string` | Channel (PPC, SEO, FB, etc.). |
| `model` | `string` | Commercial model (CPA, RS, Hybrid). |
| `status` | `string` enum | `Prospecting` \| `Negotiating` \| `Onboarding` \| `Live` \| `Paused` \| `Rejected`. |
| `details` | `string` | Free-form context. |
| `next` | `string` | Next action / owner. |
| `createdAt` | `Timestamp` | Set via `serverTimestamp()` when the document is created. |

Feel free to extend `src/types/deal.ts` and the table markup for more dimensions (payout, AM owner, etc.).

---

Questions, ideas, or new requirements (permissions, analytics, Slack webhooks)? Drop them in an issue and we can extend the workflow. Happy shipping!
