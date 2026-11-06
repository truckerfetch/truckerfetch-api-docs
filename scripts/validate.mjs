import fs from 'node:fs';
import assert from 'node:assert/strict';
import SwaggerParser from '@apidevtools/swagger-parser';
import {compile} from '@mdx-js/mdx';
const config = JSON.parse(fs.readFileSync('docs.json', 'utf8'));
await SwaggerParser.validate('openapi.json');
const spec = JSON.parse(fs.readFileSync('openapi.json', 'utf8'));
assert.equal(spec.servers[0].url, 'https://truckerfetch.com/api/v1');
assert.equal(config.colors.primary, '#FF6838');
const pages = [];
function walk(node) {
  for (const entry of node.pages || []) {
    if (typeof entry === 'string') {
      if (/^(GET|POST|PATCH|PUT|DELETE) /.test(entry)) {
        const [method, endpoint] = entry.split(' ');
        assert(spec.paths[endpoint]?.[method.toLowerCase()], 'Unknown operation ' + entry);
      } else pages.push(entry);
    } else walk(entry);
  }
  for (const key of ['tabs', 'groups']) for (const child of node[key] || []) walk(child);
  if (node.openapi) assert(fs.existsSync(typeof node.openapi === 'string' ? node.openapi : node.openapi.source));
}
walk(config.navigation);
const titles = new Set();
const internalTargets = new Set(pages.map(x => '/' + x));
for (const name of pages) {
  const file = name + '.mdx';
  assert(fs.existsSync(file), 'Missing page ' + file);
  const source = fs.readFileSync(file, 'utf8');
  const frontmatter = source.match(/^---\n([\s\S]*?)\n---\n/);
  assert(frontmatter, 'Missing frontmatter ' + file);
  for (const field of ['title', 'description', 'keywords']) assert(new RegExp('^' + field + ':', 'm').test(frontmatter[1]), 'Missing ' + field + ' in ' + file);
  const title = frontmatter[1].match(/^title: (.+)$/m)[1];
  assert(!titles.has(title), 'Duplicate title ' + title); titles.add(title);
  const body = source.slice(frontmatter[0].length).trim();
  assert(/^[A-Za-z]/.test(body), 'Begin with prose: ' + file);
  await compile(body);
  for (const match of body.matchAll(/(?:\]\(|href=")([^"\s)]+)[)"]/g)) {
    const target = match[1];
    if (target.startsWith('/') && !target.startsWith('//')) {
      const route = target.split('#')[0];
      assert(internalTargets.has(route) || fs.existsSync('.' + route), 'Broken internal link ' + target + ' in ' + file);
    }
  }
}
for (const asset of [config.logo.light, config.logo.dark, config.favicon]) {
  assert(fs.existsSync('.' + asset), 'Missing brand asset ' + asset);
  assert(fs.readFileSync('.' + asset, 'utf8').includes('<svg'), 'Expected SVG brand asset');
}
console.log(`Validated OpenAPI, ${pages.length} MDX pages, internal links and brand assets`);
