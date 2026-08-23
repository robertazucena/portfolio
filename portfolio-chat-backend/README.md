# Portfolio "Let's Connect" Chat Backend

A small Cloudflare Worker that securely calls the Anthropic API on behalf of
your GitHub Pages site, so your API key never touches client-side code.

## 1. Get an Anthropic API key

Sign up / log in at **https://console.anthropic.com** (this is separate from
your regular Claude.ai account) and create an API key under
**Settings → API Keys**.

## 2. Install Wrangler (Cloudflare's CLI)

```bash
npm install -g wrangler
wrangler login
```

This opens a browser window to connect your Cloudflare account (free tier is
plenty for this).

## 3. Deploy

From this folder:

```bash
wrangler secret put ANTHROPIC_API_KEY
# paste your key from step 1 when prompted

wrangler deploy
```

Wrangler will print a URL like:

```
https://robert-portfolio-chat.YOUR-SUBDOMAIN.workers.dev
```

That's your live chat endpoint.

## 4. Point your site at it

In `script.js`, update:

```js
const CHAT_ENDPOINT = '/api/chat';
```

to your deployed Worker URL:

```js
const CHAT_ENDPOINT = 'https://robert-portfolio-chat.YOUR-SUBDOMAIN.workers.dev';
```

Then push that change to your GitHub Pages repo as usual.

## 5. Update allowed origins

In `worker.js`, `ALLOWED_ORIGINS` is set to
`https://robertazucena.github.io`. If your site is served from a custom
domain instead, add that domain to the array before deploying.

## Notes

- **Model**: the worker currently requests `claude-sonnet-5`. Check
  https://docs.claude.com for the current recommended model id if this
  changes over time, and update the `model` field in `worker.js`.
- **Context**: the system prompt embedded in `worker.js` (the `SYSTEM_PROMPT`
  constant) is what the assistant knows about Robert's background and
  projects. Edit it any time your portfolio content changes — no need to
  redeploy the whole site, just re-run `wrangler deploy`.
- **Cost**: Cloudflare Workers' free tier covers 100,000 requests/day, so
  hosting costs nothing at typical portfolio traffic. You'll only pay
  Anthropic for the actual API usage (a handful of short chat messages costs
  fractions of a cent each).
- **Rate limiting**: this basic version has no rate limiting. If you want to
  prevent abuse (e.g. someone hammering the endpoint), consider adding
  Cloudflare's built-in rate limiting rules in the dashboard, or a simple
  IP-based counter using Workers KV.
