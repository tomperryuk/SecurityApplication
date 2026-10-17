import {capabilities, reviews, roadmap} from './data.js';
import {architectureViews, quickStarts, teams} from './blueprintData.js';
import {vendors} from './vendors.js';
import {businessMetrics} from './metricsData.js';

// The app is read as one path: understand the problem -> decide what is needed -> deliver it.
export const stages = [
  {id: 1, name: 'Understand the problem', question: 'What are we protecting, and where are the gaps?', pages: ['Overview', 'Capability map', 'Design review']},
  {id: 2, name: 'Decide what is needed', question: 'Which approach, architecture, team and tools?', pages: ['Options & tradeoffs', 'Architecture', 'Organisation', 'Vendor landscape']},
  {id: 3, name: 'Deliver it', question: 'In what order, with what evidence, and who runs it?', pages: ['Delivery roadmap', 'Foundation quick starts', 'Delivery model', 'AI agentic SDLC', 'Performance scorecard']}
];
export const pageOrder = stages.flatMap(s => s.pages);
export const stageOf = page => stages.find(s => s.pages.includes(page));

export const routes = {
  'Overview': 'overview', 'Capability map': 'capabilities', 'Design review': 'design-review',
  'Options & tradeoffs': 'options', 'Architecture': 'architecture', 'Organisation': 'organisation', 'Vendor landscape': 'vendors',
  'Delivery roadmap': 'roadmap', 'Foundation quick starts': 'quick-starts', 'Delivery model': 'delivery-model', 'AI agentic SDLC': 'agentic-sdlc',
  'Performance scorecard': 'performance', 'Sources & references': 'sources'
};
export function parseHash(hash) {
  const [slug = '', sub = ''] = String(hash || '').replace(/^#\/?/, '').split('/');
  let decoded = sub;
  try { decoded = decodeURIComponent(sub); } catch { /* keep the raw segment */ }
  return {page: Object.keys(routes).find(p => routes[p] === slug) || 'Overview', sub: decoded};
}
export const toHash = (page, sub = '') => '#/' + routes[page] + (sub ? '/' + encodeURIComponent(sub) : '');

// ---- next-step guidance -------------------------------------------------
const nextText = {
  'Overview': ['Explore the 19 capabilities', 'Each capability has its own clock, owner and guardrails. See which ones need to be fast.'],
  'Capability map': ['See what the design review found', 'Eight gaps in the original brief, each tied to the recipe that closes it.'],
  'Design review': ['Choose an approach', 'Answer four questions about your estate and pick the architecture approach that fits.'],
  'Options & tradeoffs': ['See what it takes to build', 'Six reference designs show the components, owners and failure tests behind the approach you chose.'],
  'Architecture': ['Decide who owns it', 'Five practices, a RACI and a 24×7 staffing calculation for the designs you just reviewed.'],
  'Organisation': ['Shortlist the tools', 'Compare the data, SIEM, response and recovery products that could fill gaps in the design.'],
  'Vendor landscape': ['Plan the delivery', 'One timeline of five phases. Each phase lists the recipes and the evidence that closes it.'],
  'Delivery roadmap': ['Work through the recipes', 'Ten build recipes with prerequisites, starter contracts and acceptance evidence.'],
  'Foundation quick starts': ['Set up how the work runs', 'Workstreams, service contracts and forums that keep delivery and operations connected.'],
  'Delivery model': ['Add agent-assisted delivery', 'Speed up engineering work without moving accountability away from people.'],
  'AI agentic SDLC': ['Define how success is measured', 'Connect the delivery investment to operational effectiveness and business outcomes, with owned measurement contracts.'],
  'Performance scorecard': null
};
export function nextStep(page, ctx = {}) {
  if (!(page in nextText)) return null;
  const i = pageOrder.indexOf(page), target = pageOrder[i + 1] || null;
  const entry = nextText[page];
  if (!entry) return {title: 'Export the design', text: 'Take the whole design, with your choices and recorded evidence, to stakeholders as Markdown.', target: null, action: 'export'};
  let [title, text] = entry;
  if (page === 'Options & tradeoffs' && ctx.option) text = `You have chosen ${ctx.option}. ` + text;
  return {title, text, target, action: 'go'};
}

// ---- who owns what -------------------------------------------------------
export const teamsFor = capId => teams.filter(t => t.capabilities.includes(capId));
export const viewsFor = capId => architectureViews.filter(v => v.capabilities.includes(capId));
export const recipesFor = capId => quickStarts.filter(q => q.capabilities.includes(capId));

// ---- one timeline ---------------------------------------------------------
export const phases = roadmap.map(([id, title, weeks, description, gate, recipes]) => ({id, title, weeks, description, gate, recipes}));
export const phaseOf = qsId => phases.find(p => p.recipes.includes(qsId));
export const evidenceKey = (qsId, i) => `${qsId}-${i}`;
export const recipeProgress = (qsId, evidence) => {
  const q = quickStarts.find(x => x.id === qsId);
  return {done: q.acceptance.filter((_, i) => evidence.includes(evidenceKey(qsId, i))).length, total: q.acceptance.length};
};
export function phaseProgress(phase, evidence) {
  return phase.recipes.reduce((sum, id) => {
    const r = recipeProgress(id, evidence);
    return {done: sum.done + r.done, total: sum.total + r.total};
  }, {done: 0, total: 0});
}
export const totalEvidence = quickStarts.reduce((n, q) => n + q.acceptance.length, 0);
export const evidenceDone = evidence => quickStarts.reduce((n, q) => n + recipeProgress(q.id, evidence).done, 0);

export function parseEffort(text) {
  const m = String(text).match(/(\d+)\s*[–-]\s*(\d+)/);
  return m ? [Number(m[1]), Number(m[2])] : [0, 0];
}
// Longest chain of dependent recipes: the minimum sequenced effort, however many people are available.
export function planEffort() {
  const byId = new Map(quickStarts.map(q => [q.id, q])), memo = new Map();
  function longest(id) {
    if (memo.has(id)) return memo.get(id);
    const [lo, hi] = parseEffort(byId.get(id).effort);
    let best = {lo: 0, hi: 0, path: []};
    for (const dep of byId.get(id).depends) {
      const r = longest(dep);
      if (r.hi > best.hi || (r.hi === best.hi && r.lo > best.lo)) best = r;
    }
    const result = {lo: best.lo + lo, hi: best.hi + hi, path: [...best.path, id]};
    memo.set(id, result);
    return result;
  }
  const all = quickStarts.map(q => longest(q.id));
  const critical = all.reduce((a, b) => (b.hi > a.hi || (b.hi === a.hi && b.lo > a.lo)) ? b : a);
  const total = quickStarts.reduce((sum, q) => { const [lo, hi] = parseEffort(q.effort); return [sum[0] + lo, sum[1] + hi]; }, [0, 0]);
  return {critical, total};
}

// ---- review observations -> where they are addressed ------------------------
export const reviewRecipes = i => reviews[i].quickStarts || [];

// ---- choosing an approach ------------------------------------------------------
export const fitQuestions = [
  {id: 'estate', question: 'Where do your workloads and telemetry mostly live?', options: [['aws', 'Mostly AWS'], ['mixed', 'AWS plus significant endpoint, SaaS or other-cloud estate'], ['multi', 'Multi-cloud or hybrid; AWS is one of several']]},
  {id: 'soc', question: 'What detection and SOC tooling do you already run?', options: [['none', 'None, or just starting'], ['partial', 'Some tooling but no central SIEM'], ['siem', 'An established SIEM / XDR and SOC practice']]},
  {id: 'team', question: 'How much security engineering capacity do you have?', options: [['small', 'Fewer than 5 people'], ['medium', '5 to 15 people'], ['large', 'More than 15 people']]},
  {id: 'cover', question: 'How will you provide 24×7 monitoring?', options: [['mdr', 'Contract an MDR / managed service'], ['mixed', 'Internal hours plus contracted overnight cover'], ['internal', 'Internal shifts']]}
];
const weights = {
  estate: {aws: {native: 2, hybrid: 1}, mixed: {hybrid: 2, siem: 1}, multi: {siem: 2, hybrid: 1}},
  soc: {none: {native: 2, hybrid: 1}, partial: {hybrid: 2}, siem: {siem: 3, hybrid: 1}},
  team: {small: {native: 2, hybrid: 1}, medium: {hybrid: 2}, large: {siem: 1, hybrid: 1}},
  cover: {mdr: {native: 1, hybrid: 1}, mixed: {hybrid: 2}, internal: {siem: 1, hybrid: 1}}
};
export function recommend(answers = {}) {
  const scores = {hybrid: 0, native: 0, siem: 0}, reasons = [];
  for (const q of fitQuestions) {
    const choice = answers[q.id];
    if (!choice) continue;
    for (const [option, points] of Object.entries(weights[q.id][choice] || {})) scores[option] += points;
    reasons.push(q.options.find(o => o[0] === choice)[1]);
  }
  const complete = fitQuestions.every(q => answers[q.id]);
  // Ties resolve to the hybrid baseline, then native, because both are the lower-commitment starting points.
  const option = ['hybrid', 'native', 'siem'].reduce((best, id) => scores[id] > scores[best] ? id : best, 'hybrid');
  const scaled = (answers.team === 'large' && answers.cover !== 'mdr') || (answers.cover === 'internal' && answers.team === 'medium');
  return {complete, option, orgModel: scaled ? 'scaled' : 'lean', scores, reasons};
}

// What the chosen approach changes elsewhere in the guide.
export const optionEffects = {
  hybrid: {
    label: 'Hybrid, event-driven',
    headline: 'The reference designs show this approach in full.',
    changes: ['Native AWS detections and a cross-domain analytics layer both appear in the response and data views.', 'Keep the raw archive portable (QS-03) and prove the data platform with your own data (QS-05).'],
    optional: [], emphasis: ['QS-03', 'QS-05'], vendorFocus: ['Data platforms', 'SIEM & detection']
  },
  native: {
    label: 'AWS-native foundation',
    headline: 'Read the designs with the SIEM / XDR and third-party analytics boxes deferred.',
    changes: ['GuardDuty and Security Hub CSPM carry detection. Treat the SIEM / XDR components as later options.', 'QS-05 (data-platform proof of value) becomes optional; Athena over the audit archive covers early hunting.', 'Plan separately for endpoint, email and SaaS coverage. AWS-native services do not provide it.'],
    optional: ['QS-05'], emphasis: ['QS-04'], vendorFocus: ['Cloud & endpoint', 'Response & identity']
  },
  siem: {
    label: 'SIEM / XDR-led',
    headline: 'Read the designs with the SIEM / XDR as the correlation and case plane.',
    changes: ['AWS services become telemetry sources and response executors; the SIEM / XDR runs triage and cases.', 'Keep a portable raw archive (QS-03). It is your exit path and your cost control.', 'Budget ingestion, parser upkeep and detection-as-code in QS-04 and QS-05.'],
    optional: [], emphasis: ['QS-03', 'QS-05'], vendorFocus: ['SIEM & detection', 'Data pipelines']
  }
};

// ---- vendors -> the capabilities they help with ----------------------------------
export const vendorCapabilities = {
  'Snowflake': [1, 6, 7], 'Databricks': [1, 6, 7], 'Microsoft Sentinel': [1, 4, 5, 8], 'Splunk Enterprise Security': [1, 4, 8],
  'Elastic Security': [1, 7, 8], 'Panther': [1, 8], 'Cribl Stream': [1], 'Tines': [2, 4], 'Wiz': [9, 10, 12, 13],
  'CrowdStrike Falcon': [1, 2, 3], 'Okta': [3, 15], 'Rubrik': [16]
};
export const vendorsFor = capId => vendors.filter(v => (vendorCapabilities[v.name] || []).includes(capId));

// ---- search index for the command palette ----------------------------------------
export function searchIndex() {
  return [
    ...Object.keys(routes).map(p => ({kind: 'Page', label: p, hint: stageOf(p) ? `Stage ${stageOf(p).id} · ${stageOf(p).name}` : 'References', page: p, sub: ''})),
    ...capabilities.map(c => ({kind: 'Capability', label: c.name, hint: `${c.cadence} · ${c.scope}`, capability: c.id})),
    ...architectureViews.map(v => ({kind: 'Architecture', label: v.label, hint: v.title, page: 'Architecture', sub: v.id})),
    ...quickStarts.map(q => ({kind: 'Recipe', label: `${q.id} ${q.title}`, hint: q.outcome, page: 'Foundation quick starts', sub: q.id})),
    ...teams.map(t => ({kind: 'Team', label: t.name, hint: t.mission, page: 'Organisation', sub: t.id})),
    ...vendors.map(v => ({kind: 'Vendor', label: v.name, hint: `${v.category} · ${v.replaces}`, page: 'Vendor landscape', sub: ''})),
    ...businessMetrics.map(m => ({kind: 'Metric', label: `${m.id} ${m.title}`, hint: `${m.domain} · ${m.owner} · ${m.formula}`, page: 'Performance scorecard', sub: m.id})),
    ...reviews.map(r => ({kind: 'Review', label: r.title, hint: r.text, page: 'Design review', sub: ''}))
  ];
}
export function searchResults(query, limit = 12) {
  const q = query.trim().toLowerCase();
  const items = searchIndex();
  if (!q) return items.filter(i => i.kind === 'Page').slice(0, limit);
  const words = q.split(/\s+/);
  return items.map(i => {
    const label = i.label.toLowerCase(), text = `${label} ${i.hint.toLowerCase()} ${i.kind.toLowerCase()}`;
    if (!words.every(w => text.includes(w))) return null;
    return {...i, rank: label.startsWith(q) ? 0 : label.includes(q) ? 1 : 2};
  }).filter(Boolean).sort((a, b) => a.rank - b.rank).slice(0, limit);
}
