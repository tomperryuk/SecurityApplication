import test from 'node:test';
import assert from 'node:assert/strict';
import {architectureViews, quickStarts, teams, raci, foundationSources, diagramMermaid, organisationMermaid, quickStartMarkdown, blueprintMarkdown} from '../src/blueprintData.js';

test('every diagram connection and foundation link resolves', () => {
  const recipeIds = new Set(quickStarts.map(q => q.id));
  for (const view of architectureViews) {
    const ids = new Set(view.nodes.map(n => n.id));
    assert.equal(ids.size, view.nodes.length, `${view.id}: duplicate component identifier`);
    assert.equal(view.nodes.length, view.lanes.length * 4);
    for (const [from, to, contract] of view.edges) {
      assert(ids.has(from) && ids.has(to), `${view.id}: dangling connection`);
      assert(contract.length > 0);
    }
    view.quickStarts.forEach(id => assert(recipeIds.has(id), `Unknown recipe: ${id}`));
    assert(diagramMermaid(view).startsWith('flowchart TB'));
  }
});

test('foundation prerequisites form an acyclic build plan', () => {
  const byId = new Map(quickStarts.map(q => [q.id, q]));
  assert.equal(byId.size, quickStarts.length);
  function visit(id, path = []) {
    assert(byId.has(id), `Unknown prerequisite: ${id}`);
    assert(!path.includes(id), `Cycle: ${[...path, id].join(' → ')}`);
    byId.get(id).depends.forEach(dependency => visit(dependency, [...path, id]));
  }
  quickStarts.forEach(q => visit(q.id));
});

test('every capability has an owning practice and RACI decisions are complete', () => {
  assert.deepEqual([...new Set(teams.flatMap(t => t.capabilities))].sort((a,b) => a-b), Array.from({length:19}, (_, i) => i+1));
  for (const row of raci) {
    assert.equal(row.length, 5);
    row.forEach(cell => assert(cell.trim().length > 0));
  }
  const chart = organisationMermaid();
  teams.forEach(team => assert(chart.includes(`ciso --> ${team.id}`)));
  assert(chart.includes('audit -.-> board'));
  assert(!chart.includes('ciso --> audit'));
});

test('starter contracts and official references are usable', () => {
  for (const q of quickStarts) {
    assert.equal(q.acceptance.length, 3);
    assert(q.steps.length >= 5 && q.prerequisites.length >= 3 && q.artifacts.length >= 3);
    if (q.sample.language === 'json') assert.doesNotThrow(() => JSON.parse(q.sample.content));
    q.sourceIds.forEach(id => {
      assert(foundationSources[id], `${q.id}: missing source`);
      assert.equal(new URL(foundationSources[id][1]).protocol, 'https:');
    });
  }
});

test('recipe exports reflect only their recorded evidence and preserve starter content', () => {
  const q = quickStarts.find(q => q.id === 'QS-06');
  const exported = quickStartMarkdown(q, ['QS-06-1', 'QS-03-0']);
  assert(exported.includes(`- [x] ${q.acceptance[1]}`));
  assert(exported.includes(`- [ ] ${q.acceptance[0]}`));
  assert(exported.includes(q.sample.content));
  assert(exported.includes(q.rollback));
});

test('complete design export includes every architecture, practice and foundation recipe', () => {
  const exported = blueprintMarkdown();
  architectureViews.forEach(view => assert(exported.includes(view.title)));
  teams.forEach(team => assert(exported.includes(team.mission)));
  quickStarts.forEach(q => assert(exported.includes(`## ${q.id}: ${q.title}`)));
  assert(exported.includes('## Delivery model'));
  assert(exported.includes('### RACI decision rights'));
});
