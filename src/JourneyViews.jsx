import React, {useEffect, useRef, useState} from 'react';
import {ArrowRight, ArrowUpRight, Check, Compass, Download, ExternalLink, FileImage, Network, Rocket, Search, Target, UsersRound, Store} from 'lucide-react';
import {capabilities} from './data';
import {quickStarts} from './blueprintData';
import {stages, stageOf, nextStep, fitQuestions, recommend, optionEffects, teamsFor, viewsFor, recipesFor, vendorsFor, phaseOf, recipeProgress, searchResults, planEffort, totalEvidence} from './journey';
import {references, referenceGroups} from './references';
import './journey.css';

export function StageEyebrow({page}) {
  const s = stageOf(page);
  return <div className="eyebrow">{s ? <>STAGE {s.id} OF 3 <span>/</span> {s.name.toUpperCase()}</> : 'REFERENCES'}</div>;
}

// The problem, what is needed and how it is delivered: the three stages as a map.
export function ProblemPanel({go, progress}) {
  const cards = [
    {stage: stages[0], title: 'The problem', text: 'An AWS-first organisation with endpoint, identity and SaaS estates needs to detect and contain attacks in seconds, while backup, patching and governance run on slower clocks. The original brief listed 19 capabilities but not who owns them, how fast each must be, or how to prove it works.', cta: 'See the 19 capabilities', target: 'Capability map', status: progress.review},
    {stage: stages[1], title: 'What is needed', text: 'An approach that fits your estate, six reference designs with owners and failure tests, five accountable practices, and a short list of tools where AWS-native services are not enough.', cta: 'Choose an approach', target: 'Options & tradeoffs', status: progress.decide},
    {stage: stages[2], title: 'How to deliver it', text: 'One timeline of five phases. Each phase has build recipes, a gate and recorded evidence. The critical path through the recipes is the minimum sequenced effort, however large the team.', cta: 'Open the roadmap', target: 'Delivery roadmap', status: progress.deliver}
  ];
  return <section className="panel problem-panel" aria-label="The problem, what is needed and how to deliver it">
    <div className="problem-head"><div><span className="section-eyebrow">START HERE</span><h2>From the brief to a running service, in three stages.</h2></div><span className="problem-assume"><Compass size={14}/>Assumes an AWS-first estate. No estate size or budget has been supplied.</span></div>
    <div className="problem-cards">{cards.map(c => <div key={c.title} className="problem-card"><span className="problem-stage">{c.stage.id}</span><h3>{c.title}</h3><p>{c.text}</p><div className="problem-status">{c.status}</div><button className="text-button" onClick={() => go(c.target)}>{c.cta}<ArrowRight size={13}/></button></div>)}</div>
    <div className="problem-success"><Target size={16}/><p><strong>Done means:</strong> every capability has a named owner and a measured clock; verified containment (not just an alert) meets its p95 target on a rehearsed attack path; and a critical service has been restored, with the evidence recorded.</p></div>
  </section>;
}

export function ProgressStrip({items, go}) {
  return <div className="progress-strip" aria-label="Your progress">{items.map(i => <button key={i.label} onClick={() => go(i.target, i.sub)}><span className="progress-stage">STAGE {i.stage}</span><strong>{i.value}</strong><small>{i.label}</small><i style={{width: `${Math.round(i.fraction * 100)}%`}}/></button>)}</div>;
}

export function NextStep({page, option, go, onExport}) {
  const step = nextStep(page, {option});
  if (!step) return null;
  return <aside className="guide-next" aria-label="Next step"><div><span className="section-eyebrow">NEXT STEP</span><h3>{step.title}</h3><p>{step.text}</p></div>{step.action === 'export' ? <button className="button primary" onClick={onExport}><Download size={15}/>Export design</button> : <button className="button primary" onClick={() => go(step.target)}>{step.target}<ArrowRight size={15}/></button>}</aside>;
}

// Four questions about the estate -> a suggested approach and organisation model.
export function FitFinder({answers, setAnswers, selected, orgModel, onApply}) {
  const result = recommend(answers), answered = fitQuestions.filter(q => answers[q.id]).length;
  const label = optionEffects[result.option].label;
  return <section className="panel fit-finder" aria-label="Find the approach that fits">
    <div className="fit-head"><div><span className="section-eyebrow">HELP ME CHOOSE · {answered} OF 4 ANSWERED</span><h2>Four questions about your estate.</h2></div>{answered > 0 && <button className="text-button" onClick={() => setAnswers({})}>Clear answers</button>}</div>
    <div className="fit-questions">{fitQuestions.map(q => <fieldset key={q.id}><legend>{q.question}</legend>{q.options.map(([value, text]) => <label key={value} className={answers[q.id] === value ? 'chosen' : ''}><input type="radio" name={q.id} checked={answers[q.id] === value} onChange={() => setAnswers({...answers, [q.id]: value})}/><span>{text}</span></label>)}</fieldset>)}</div>
    {answered > 0 && <div className="fit-result" aria-live="polite">{result.complete ? <><div><span className="section-eyebrow">SUGGESTED</span><strong>{label}</strong><p>With a {result.orgModel === 'lean' ? 'Lean + MDR' : 'Scaled internal'} organisation model. Based on: {result.reasons.join('; ')}.</p></div><button className={'button ' + (selected === result.option && orgModel === result.orgModel ? '' : 'primary')} disabled={selected === result.option && orgModel === result.orgModel} onClick={() => onApply(result.option, result.orgModel)}>{selected === result.option && orgModel === result.orgModel ? <><Check size={15}/>Applied</> : 'Apply to my design'}</button></> : <p className="muted">Answer all four questions for a suggestion. This is a starting point; benchmark your own volumes and attack paths.</p>}</div>}
  </section>;
}

// A short banner that says what the chosen approach changes on this page.
export function ApproachBanner({option, go, context}) {
  const fx = optionEffects[option];
  if (!fx) return null;
  return <div className="approach-banner" role="note"><Network size={18}/><div><strong>Your approach: {fx.label}.</strong> {fx.headline}<ul>{fx.changes.map(c => <li key={c}>{c}</li>)}</ul></div>{context !== 'options' && <button className="text-button" onClick={() => go('Options & tradeoffs')}>Change approach<ArrowUpRight size={13}/></button>}</div>;
}

// Capability modal: where it is designed, how to build it, who owns it, what could fill it.
export function CapabilityRelations({capability, evidence, go}) {
  const views = viewsFor(capability.id), recipes = recipesFor(capability.id), teams = teamsFor(capability.id), vendorList = vendorsFor(capability.id);
  return <>
    {views.length > 0 && <div className="detail-section"><h3><Network size={17}/>Where it is designed</h3><div className="relation-links">{views.map(v => <button key={v.id} onClick={() => go('Architecture', v.id)}><strong>{v.label}</strong><small>{v.title}</small><ArrowUpRight size={13}/></button>)}</div></div>}
    {recipes.length > 0 && <div className="detail-section"><h3><Rocket size={17}/>How to build it</h3><div className="relation-links">{recipes.map(q => { const p = recipeProgress(q.id, evidence), ph = phaseOf(q.id); return <button key={q.id} onClick={() => go('Foundation quick starts', q.id)}><strong>{q.id} · {q.title}</strong><small>{ph ? `Phase ${ph.id} · ${ph.weeks} · ` : ''}{q.effort} · {p.done}/{p.total} evidence checks</small><ArrowUpRight size={13}/></button>; })}</div></div>}
    <div className="detail-section"><h3><UsersRound size={17}/>Who owns it</h3><div className="relation-links">{teams.map(t => <button key={t.id} onClick={() => go('Organisation', t.id)}><strong>{t.name}</strong><small>{t.lead}</small><ArrowUpRight size={13}/></button>)}</div><p className="owner-role">Accountable role for this capability: {capability.owner}.</p></div>
    {vendorList.length > 0 && <div className="detail-section"><h3><Store size={17}/>Tools that could fill gaps</h3><div className="service-tags">{vendorList.map(v => <span key={v.name}>{v.name}</span>)}</div><button className="text-button" onClick={() => go('Vendor landscape', '', capability.id)}>Compare these tools<ArrowRight size={13}/></button></div>}
  </>;
}

// Side-by-side view of the shortlist; the missing step between shortlisting and buying.
export function ShortlistCompare({list, go}) {
  const rows = [['Category', v => v.category], ['AWS overlap', v => v.replaces], ['When it fits', v => v.fit], ['Tradeoffs', v => v.tradeoff], ['Where to buy', v => v.buy], ['Cost drivers', v => v.cost]];
  return <section className="panel shortlist-compare"><div className="panel-heading"><div><span className="section-eyebrow">SHORTLIST COMPARISON · {list.length} PRODUCTS</span><h2>Compare on the same questions.</h2><p>Take these into roadmap phase 04 and run the same dataset and scenarios through each.</p></div><button className="text-button" onClick={() => go('Delivery roadmap')}>Open phase 04<ArrowRight size={13}/></button></div>
    <div className="table-scroll"><table><thead><tr><th/>{list.map(v => <th key={v.name}>{v.name.toUpperCase()}</th>)}</tr></thead><tbody>{rows.map(([name, get]) => <tr key={name}><th scope="row">{name.toUpperCase()}</th>{list.map(v => <td key={v.name}>{get(v)}</td>)}</tr>)}</tbody></table></div></section>;
}

export function PlanSummary({className = ''}) {
  const {critical, total} = planEffort();
  return <div className={'plan-summary ' + className}><div><small>CRITICAL PATH</small><strong>{critical.lo}–{critical.hi} engineer-days</strong><span>{critical.path.join(' → ')}</span></div><div><small>ALL {quickStarts.length} RECIPES</small><strong>{total[0]}–{total[1]} engineer-days</strong><span>Effort, not elapsed time. Approvals and procurement are extra.</span></div><div><small>EVIDENCE CHECKS</small><strong>{totalEvidence}</strong><span>Three per recipe, recorded in this browser.</span></div></div>;
}

// Command palette: one search across pages, capabilities, designs, recipes, teams, vendors and review items.
export function CommandPalette({onClose, onPick}) {
  const [query, setQuery] = useState(''), [index, setIndex] = useState(0), ref = useRef(null), inputRef = useRef(null);
  const results = searchResults(query);
  useEffect(() => { const before = document.activeElement; inputRef.current?.focus(); return () => before?.focus?.(); }, []);
  useEffect(() => setIndex(0), [query]);
  function onKey(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIndex(i => Math.min(results.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIndex(i => Math.max(0, i - 1)); }
    else if (e.key === 'Enter' && results[index]) { e.preventDefault(); onPick(results[index]); }
    else if (e.key === 'Tab') { e.preventDefault(); inputRef.current?.focus(); }
  }
  return <div className="modal-backdrop palette-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <section className="modal palette" role="dialog" aria-modal="true" aria-label="Search the guide" ref={ref} onKeyDown={onKey}>
      <label className="palette-input"><Search size={18}/><input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search capabilities, recipes, designs, vendors…" role="combobox" aria-expanded="true" aria-controls="palette-results" aria-activedescendant={results[index] ? `palette-${index}` : undefined} aria-label="Search the guide"/><kbd>esc</kbd></label>
      <ul id="palette-results" role="listbox">{results.map((r, i) => <li key={r.kind + r.label} id={`palette-${i}`} role="option" aria-selected={i === index} className={i === index ? 'active' : ''} onMouseEnter={() => setIndex(i)} onClick={() => onPick(r)}><span className="palette-kind">{r.kind}</span><div><strong>{r.label}</strong><small>{r.hint}</small></div><ArrowRight size={14}/></li>)}</ul>
      {results.length === 0 && <p className="palette-empty">No matches. Try a capability, a recipe number such as QS-06, or a vendor name.</p>}
      <div className="palette-foot"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>↵</kbd> open</span><span>{query ? `${results.length} results` : 'Start typing to search everything'}</span></div>
    </section>
  </div>;
}

// References grouped by topic: filter and search instead of one long list.
export function ReferenceLibrary({go, onImport}) {
  const [group, setGroup] = useState('All'), [query, setQuery] = useState('');
  const all = references();
  const shown = all.filter(r => (group === 'All' || r.group === group) && `${r.title} ${r.note} ${r.group} ${r.usedBy.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <section className="panel ref-library" aria-label="Official references">
    <div className="ref-toolbar">
      <div className="filter-tabs" role="group" aria-label="Reference topic">{['All', ...referenceGroups].map(g => <button key={g} className={group === g ? 'selected' : ''} aria-pressed={group === g} onClick={() => setGroup(g)}>{g}<span className="count">{g === 'All' ? all.length : all.filter(r => r.group === g).length}</span></button>)}</div>
      <label className="search ref-search"><Search size={15}/><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search references…" aria-label="Search references"/></label>
    </div>
    <div className="ref-grid">{shown.map(r => <article key={r.url} className="ref-card">
      <small>{r.group}</small>
      <a href={r.url} target="_blank" rel="noreferrer"><h3>{r.title}</h3><ExternalLink size={13}/></a>
      <p>{r.note}</p>
      <div className="ref-foot"><span>{new URL(r.url).hostname}</span>{r.usedBy.length > 0 && <div className="ref-used" aria-label="Used by recipes">{r.usedBy.map(id => <button key={id} onClick={() => go('Foundation quick starts', id)}>{id}</button>)}</div>}</div>
    </article>)}</div>
    {shown.length === 0 && <div className="empty"><Search/><h3>No matching references</h3><p>Try a service name or a recipe number.</p><button className="button" onClick={() => {setQuery(''); setGroup('All');}}>Clear filters</button></div>}
    <div className="ref-bottom"><span><FileImage size={15}/>Have your own AWS diagram? View it beside the design. It stays in this browser and is not analysed.</span><button className="button" onClick={onImport}>Import reference image</button><button className="text-button" onClick={() => go('Vendor landscape')}>Vendor sources are on each product card<ArrowRight size={13}/></button></div>
  </section>;
}
