import test from 'node:test';
import assert from 'node:assert/strict';
import {capabilities, reviews} from '../src/data.js';
import {quickStarts, teams} from '../src/blueprintData.js';
import {vendors} from '../src/vendors.js';
import {stages, pageOrder, routes, parseHash, toHash, nextStep, phases, phaseOf, phaseProgress, recipeProgress, evidenceDone, totalEvidence, planEffort, parseEffort, fitQuestions, recommend, optionEffects, vendorCapabilities, teamsFor, viewsFor, recipesFor, searchResults} from '../src/journey.js';
import {sdlcRollout, sdlcMarkdown, defaultSdlcInputs} from '../src/sdlcData.js';

test('every page sits in exactly one stage and has a route that round-trips', () => {
  assert.equal(new Set(pageOrder).size, pageOrder.length);
  pageOrder.forEach(p => assert(routes[p], `no route for ${p}`));
  for (const [page, slug] of Object.entries(routes)) {
    assert.deepEqual(parseHash(toHash(page)), {page, sub: ''});
    assert.equal(toHash(page), '#/' + slug);
  }
  assert.deepEqual(parseHash('#/quick-starts/QS-06'), {page: 'Foundation quick starts', sub: 'QS-06'});
  assert.deepEqual(parseHash('#/nonsense'), {page: 'Overview', sub: ''});
  assert.deepEqual(parseHash('#/architecture/%E0%A4%A'), {page: 'Architecture', sub: '%E0%A4%A'});
  assert.equal(stages.length, 3);
});

test('next steps chain through every stage page and finish at export', () => {
  let page = pageOrder[0];
  const seen = [page];
  for (let i = 0; i < 20; i++) {
    const step = nextStep(page);
    assert(step, `no step for ${page}`);
    if (step.action === 'export') break;
    assert.equal(step.target, pageOrder[pageOrder.indexOf(page) + 1]);
    page = step.target; seen.push(page);
  }
  assert.deepEqual(seen, pageOrder);
  assert.equal(nextStep('Sources & references'), null);
  assert(nextStep('Options & tradeoffs', {option: 'X'}).text.startsWith('You have chosen X.'));
});

test('one timeline: each recipe is in exactly one phase and never before its prerequisites', () => {
  const order = new Map(phases.map((p, i) => [p.id, i]));
  const placed = phases.flatMap(p => p.recipes);
  assert.equal(new Set(placed).size, placed.length, 'a recipe appears in two phases');
  assert.deepEqual([...placed].sort(), quickStarts.map(q => q.id).sort(), 'every recipe belongs to a phase');
  for (const q of quickStarts) q.depends.forEach(dep => assert(order.get(phaseOf(dep).id) <= order.get(phaseOf(q.id).id), `${q.id} is scheduled before ${dep}`));
});

test('progress is derived from recorded evidence', () => {
  assert.deepEqual(recipeProgress('QS-01', ['QS-01-0', 'QS-01-2', 'QS-02-1']), {done: 2, total: 3});
  assert.deepEqual(phaseProgress(phases[0], []), {done: 0, total: 6});
  assert.deepEqual(phaseProgress(phases[0], ['QS-01-0', 'QS-02-0', 'QS-03-0']), {done: 2, total: 6});
  assert.equal(totalEvidence, 30);
  assert.equal(evidenceDone(['QS-01-0', 'bogus', 'QS-01-0']), 1 + 0);
});

test('critical path follows dependencies and is shorter than the total', () => {
  assert.deepEqual(parseEffort('3–5 engineer-days'), [3, 5]);
  const {critical, total} = planEffort();
  const byId = new Map(quickStarts.map(q => [q.id, q]));
  critical.path.forEach((id, i) => { if (i) assert(byId.get(id).depends.includes(critical.path[i - 1])); });
  assert.deepEqual(critical.path, ['QS-01', 'QS-02', 'QS-03', 'QS-04', 'QS-06', 'QS-10']);
  assert.deepEqual([critical.lo, critical.hi], [22, 36]);
  assert(critical.hi < total[1] && critical.lo < total[0]);
});

test('every review observation names recipes that exist', () => {
  reviews.forEach(r => { assert(r.quickStarts?.length, r.title); r.quickStarts.forEach(id => assert(quickStarts.some(q => q.id === id))); });
});

test('every capability is designed, buildable and owned', () => {
  for (const c of capabilities) {
    assert(teamsFor(c.id).length >= 1, `${c.name}: no team`);
    assert(viewsFor(c.id).length + recipesFor(c.id).length >= 1, `${c.name}: not linked to a design or recipe`);
    assert(recipesFor(c.id).length >= 1, `${c.name}: no recipe`);
  }
  assert.equal(teams.length, 5);
});

test('choosing an approach: answers map to a recommendation and organisation model', () => {
  assert.equal(recommend({}).complete, false);
  const small = recommend({estate: 'aws', soc: 'none', team: 'small', cover: 'mdr'});
  assert.deepEqual([small.complete, small.option, small.orgModel], [true, 'native', 'lean']);
  const big = recommend({estate: 'multi', soc: 'siem', team: 'large', cover: 'internal'});
  assert.deepEqual([big.option, big.orgModel], ['siem', 'scaled']);
  assert.equal(recommend({estate: 'aws', soc: 'partial', team: 'medium', cover: 'mixed'}).option, 'hybrid');
  assert.equal(recommend({estate: 'mixed', soc: 'siem', team: 'large', cover: 'mdr'}).orgModel, 'lean');
  fitQuestions.forEach(q => assert(q.options.length === 3));
  Object.keys(optionEffects).forEach(id => optionEffects[id].optional.forEach(qs => assert(quickStarts.some(q => q.id === qs))));
});

test('vendors map to real capabilities and every vendor is mapped', () => {
  assert.deepEqual(Object.keys(vendorCapabilities).sort(), vendors.map(v => v.name).sort());
  Object.values(vendorCapabilities).flat().forEach(id => assert(capabilities.some(c => c.id === id)));
  Object.values(optionEffects).flatMap(o => o.vendorFocus).forEach(cat => assert(vendors.some(v => v.category === cat), cat));
});

test('search finds pages, recipes and vendors', () => {
  assert(searchResults('').every(r => r.kind === 'Page'));
  assert.equal(searchResults('QS-06')[0].sub, 'QS-06');
  assert(searchResults('snowflake').some(r => r.kind === 'Vendor'));
  assert.deepEqual(searchResults('zzzz-nothing'), []);
  assert(searchResults('containment').some(r => r.kind === 'Capability'));
});

test('agent pilot windows are relative and exports never print undefined', () => {
  sdlcRollout.filter(r => r.week !== 'Ongoing').forEach(r => assert(r.week.startsWith('Pilot weeks')));
  const out = sdlcMarkdown({...defaultSdlcInputs, deliveryFte: 0, hoursPerDay: 0});
  assert(!out.includes('undefined'));
});

test('every reference has a topic, a note and a unique https link; recipes resolve', async () => {
  const {references, referenceGroups} = await import('../src/references.js');
  const refs = references();
  assert.equal(new Set(refs.map(r => r.url)).size, refs.length);
  refs.forEach(r => {
    assert(referenceGroups.includes(r.group), `${r.title}: no topic`);
    assert(r.note && r.note.length > 10, `${r.title}: no note`);
    assert.equal(new URL(r.url).protocol, 'https:');
    r.usedBy.forEach(id => assert(quickStarts.some(q => q.id === id)));
  });
  referenceGroups.forEach(g => assert(refs.some(r => r.group === g), `empty topic ${g}`));
  quickStarts.forEach(q => q.sourceIds.forEach(i => assert(refs.some(r => r.usedBy.includes(q.id)))));
});
