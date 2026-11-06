import fs from 'node:fs/promises';
import SwaggerParser from '@apidevtools/swagger-parser';
const response = await fetch('https://truckerfetch.com/api/v1/openapi.json', {
  redirect: 'error', signal: AbortSignal.timeout(30000),
});
if (!response.ok) throw new Error(`Contract fetch returned HTTP ${response.status}`);
const spec = await response.json();
await SwaggerParser.validate(structuredClone(spec));
if (spec.info?.title !== 'TruckerFetch Pro API') throw new Error('Unexpected API contract');
await fs.writeFile(new URL('../openapi.json', import.meta.url), JSON.stringify(spec, null, 2) + '\n');
console.log(`Updated ${Object.keys(spec.paths).length} API paths from the public application`);
