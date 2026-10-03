# ImageForge — deployable website

This is a normal mobile-first website, not an installable app. It uses Cloudflare Workers Static Assets for the front end and a Cloudflare Worker + Workers AI for image generation.

## Files
- `public/index.html` — the website UI
- `worker.js` — the `/generate` backend endpoint
- `wrangler.json` — Cloudflare deployment configuration

## Cloudflare dashboard deployment
1. Create a Worker named `imageforge-free`.
2. Open its code/deployment setup.
3. If using Wrangler locally, run `npx wrangler deploy` from this folder.
4. If using the Cloudflare dashboard, upload/deploy this Worker project and make sure the Workers AI binding is named `AI`.
5. The Wrangler config already defines the static asset folder and the `AI` binding.
6. Open the resulting `*.workers.dev` URL. That URL is your website.

## Important
The website itself does not need an API key in browser code. The AI binding stays server-side in the Worker.

The site currently supports one reference image, prompt-based image-to-image generation, and 9:16 / 1:1 / 4:5 / 16:9 output formats.
