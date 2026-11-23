# Task to API

Turn a task description and JSON schemas into a bearer-token HTTP endpoint backed by Gemini. Optionally attach MCP servers so the agent can call tools during a run.

## Requirements

- Node.js 20 or newer, or Bun
- PostgreSQL
- A Google Cloud OAuth client (sign-in)
- A Gemini API key (set in the app after sign-in)

## Set up the database

1. Create a PostgreSQL database.
2. Copy the connection string into `.env` as `DATABASE_URL`.
3. Apply migrations:

```bash
npx prisma migrate deploy
npx prisma generate
```

## Configure environment variables

Create a `.env` file in the repo root:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true
```

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Prisma PostgreSQL connection string |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `NEXTAUTH_SECRET` | Secret used to sign NextAuth JWTs |
| `NEXTAUTH_URL` | Public origin of the app |
| `AUTH_TRUST_HOST` | Set to `true` when the host header is trusted (local and most reverse proxies) |

Add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI on the Google OAuth client.

## Run locally

```bash
bun install
bun run dev
```

Or with npm:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in with Google, then add your Gemini API key from the dashboard.

## Create and call an agent

1. Create an agent on the dashboard.
2. Set the task prompt, input schema, output schema, and HTTP method (`GET` or `POST`).
3. Copy the endpoint URL and bearer token from the agent page.
4. Call the public API:

```bash
curl -X POST https://YOUR_HOST/api/agents/AGENT_ID \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"your":"input"}'
```

For a `GET` agent, omit the body. Auth uses `Authorization: Bearer <token>`. The response is JSON that matches the output schema when the model returns valid JSON.

Use the playground to run the same agent with live traces before you wire production callers.

## MCP tools

Enable MCP on an agent, then add one or more MCP server URLs. The runtime opens those servers for the run and can call their tools up to `maxToolRounds`. Headers on each server are stored with the agent and sent on every MCP connection.

## Deploy

Pushes to `main` run `.github/workflows/deploy.yml`, which calls the shared `kapillohani023/deploy` workflow for the `task-to-api` service. You can also start that workflow manually from the Actions tab.

## Scripts

| Script | Command |
| --- | --- |
| Dev server | `bun run dev` or `npm run dev` |
| Production build | `bun run build` or `npm run build` |
| Start production server | `bun run start` or `npm run start` |
| Lint | `bun run lint` or `npm run lint` |
