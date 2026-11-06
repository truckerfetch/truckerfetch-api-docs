# TruckerFetch API documentation

Official Mintlify documentation for the TruckerFetch Pro REST API, hosted OAuth MCP and agent skills. Live documentation: https://truckerfetch.com/docs.

## Local development

Use Node.js 22 or newer. Install dependencies with `npm ci`, then run `npm run validate`. Preview with `npx mint dev --no-open` from this directory. If Mintlify hosting has not been connected yet, this local preview is the documentation review fallback; repository content alone does not mean the public URL is deployed.

Run `npx mint validate` and `npx mint broken-links` before publishing. The API playground uses simple mode so readers can copy authenticated examples without sending credentials through the documentation site.

## Contract and branding

`openapi.json` is generated from the private application's runtime registry. Maintainers with the application checkout beside this repository run `node scripts/generate-public-contracts.mjs` from `truckerfetch-com`, then run the same command with `--check` to detect drift. `contract-source.json` records the reviewed source hashes without copying private server code or data. Regenerate the MCP manifest with its `npm run manifest:generate` command after source registry changes.

`npm run sync:openapi` can refresh the snapshot from the deployed `GET https://truckerfetch.com/api/v1/openapi.json`; use it only after the matching application release is live, inspect the diff, and run validation. Mintlify generates the API reference directly from the checked-in contract.

The light and dark SVG logos and icon in `images/` are copies of the application's vector masters. Signal Orange is `#FF6838`; readable light-surface links use Oxide `#B83D16`, and dark surfaces use Asphalt `#252321`. Do not recolor the white truck or outlined wordmark. `styles.css` supplies accessible text variants without changing the signature logo.

## Publishing

This repository is connected to the TruckerFetch Mintlify deployment on `main`, with base path `/docs`. The existing Next.js app proxies the documentation and Mintlify assets at `https://truckerfetch.com/docs`; it strips application credentials, uses a fixed HTTPS upstream and streams responses. The optional Cloudflare Worker in `worker/` provides equivalent docs-only routes when Cloudflare proxying is enabled. Keep the main application DNS pointed at its existing host.

Deploy docs from a reviewed commit on `main`. Verify both `https://truckerfetch.mintlify.site/docs` and the public `/docs` URL after changes. `npm run validate` also checks the optional Worker routing and credential boundary. Hosting/domain changes are managed separately from content validation.

## Public developer repositories

- https://github.com/truckerfetch/truckerfetch-api-docs
- https://github.com/truckerfetch/truckerfetch-mcp
- https://github.com/truckerfetch/truckerfetch-agent-skills
- https://github.com/truckerfetch/truckerfetch-api-examples

Use synthetic examples only. The MIT license covers original client code and documentation; the carrier dataset, brand assets, trademarks and third-party material are excluded as stated in `LICENSE`.
