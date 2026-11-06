# Product brief

## Description
TruckerFetch gives Pro subscribers programmatic access to published U.S. motor carrier Census, operating authority and insurance research, with source freshness, redacted evidence, owner-scoped exports and watch events.

## Primary audience
Developers integrating carrier data and operators connecting an assistant through OAuth MCP. This audience is inferred from the existing product and the requested API/MCP/agent skill scope.

## Jobs to be done
1. Create a least-privilege key and make a successful carrier search.
2. Interpret source dates, authority identities and insurance date bases without conflating them.
3. Retrieve pinned exports or configure watched carrier/authority events while preserving owner approval and safe retries.

## Motivation
Use one published, permission-aware source across dashboard, REST and MCP. Preserve source meaning and account suppressions rather than infer unsupported insurance facts.

## Sources and constraints
- Current `lib/truckerfetch/interfaces.ts`, `policy.ts`, `server.ts`, `export-files.ts`, webhook sender and brand guide in the private application.
- Public `https://truckerfetch.com/api/v1/openapi.json`, fetched 2026-11-05.
- Docs canonical target: https://truckerfetch.com/docs, Mintlify hosted with /docs base path.
- All data API routes require active Pro. REST keys and hosted OAuth credentials are distinct.
- No new product claims, credit model, certification claim or guaranteed freshness SLA.
