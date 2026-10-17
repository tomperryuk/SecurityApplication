import test from 'node:test';
import assert from 'node:assert/strict';
import {businessMetrics,metricDomains,metricValue,assessMetric,summarizeMetrics,metricCsv,metricsMarkdown} from '../src/metricsData.js';
import {routes,parseHash,toHash,searchResults,nextStep} from '../src/journey.js';
const asOf='2026-10-17';
const valid={numerator:100,denominator:100,value:0,samples:50,measuredAt:asOf,evidence:'approved-report-1',reviewer:'control owner',period:'October 2026, fixed pilot cohort',approved:true};
const ratio=businessMetrics.find(m=>m.id==='OP-01');

test('all 29 measures have owners, complete measurement contracts and valid contribution links',()=>{
 assert.equal(businessMetrics.length,29);assert.equal(new Set(businessMetrics.map(m=>m.id)).size,29);
 const ids=new Set(businessMetrics.map(m=>m.id));
 for(const m of businessMetrics){assert(metricDomains.includes(m.domain));for(const key of ['owner','formula','source','cohort','action','guardrail','review'])assert(m[key]?.length>8,`${m.id}: ${key}`);assert(m.audience.length);assert(m.minSamples>0&&m.freshnessDays>0);assert(m.direction==='higher'?m.green>=m.amber:m.green<=m.amber);m.upstream?.forEach(id=>assert(ids.has(id)));}
 assert.deepEqual([...new Set(businessMetrics.flatMap(m=>m.capabilities))].sort((a,b)=>a-b),Array.from({length:19},(_,i)=>i+1));
});

test('ratio success uses the full denominator and cannot claim success for absent or malformed data',()=>{
 assert.equal(metricValue(ratio,{numerator:99,denominator:100}),99);
 for(const record of [{},{numerator:0,denominator:0},{numerator:5,denominator:4},{numerator:-1,denominator:10},{numerator:true,denominator:10}])assert.equal(assessMetric(ratio,record,asOf).status,'No data');
 assert.equal(assessMetric(ratio,{...valid,numerator:19,denominator:19},asOf).status,'Insufficient evidence');
});

test('owner approval, cohort, reviewer, dated evidence and freshness gate every performance judgement',()=>{
 for(const [key,value] of [['approved',false],['approved','true'],['evidence',''],['reviewer',''],['period','']])assert.notEqual(assessMetric(ratio,{...valid,[key]:value},asOf).status,'Met');
 assert.equal(assessMetric(ratio,{...valid,measuredAt:'2026-09-01'},asOf).status,'Stale evidence');
 assert.equal(assessMetric(ratio,{...valid,measuredAt:'2026-10-18'},asOf).status,'Insufficient evidence');
 assert.equal(assessMetric(ratio,{...valid,measuredAt:'2026-02-30'},asOf).status,'Insufficient evidence');
});

test('approved higher/lower thresholds distinguish met, watch and action, including boundary values',()=>{
 assert.equal(assessMetric(ratio,{...valid,numerator:99},asOf).status,'Met');
 assert.equal(assessMetric(ratio,{...valid,numerator:95},asOf).status,'Watch');
 assert.equal(assessMetric(ratio,{...valid,numerator:94},asOf).status,'Action required');
 const lower=businessMetrics.find(m=>m.id==='OP-03');
 assert.equal(assessMetric(lower,{...valid,value:15},asOf).status,'Met');
 assert.equal(assessMetric(lower,{...valid,value:30},asOf).status,'Watch');
 assert.equal(assessMetric(lower,{...valid,value:31},asOf).status,'Action required');
 assert.equal(assessMetric(lower,{...valid,value:-1},asOf).status,'Insufficient evidence');
 assert.equal(assessMetric(ratio,{...valid,target:90,amber:99},asOf).status,'Invalid threshold');
 assert.equal(assessMetric(ratio,{...valid,target:101},asOf).status,'Invalid threshold');
});

test('negative cash and AI benefits remain valid observations rather than being dropped',()=>{
 for(const id of ['BO-06','DL-10'])assert.equal(assessMetric(businessMetrics.find(m=>m.id===id),{...valid,value:-10},asOf).status,'Action required');
});

test('roll-ups preserve action-required controls and missing evidence instead of averaging them away',()=>{
 const lower=businessMetrics.find(m=>m.id==='OP-03');
 assert.equal(summarizeMetrics([ratio,lower],{[ratio.id]:valid,[lower.id]:{...valid,value:100}},asOf).status,'Action required');
 const incomplete=summarizeMetrics([ratio,lower],{[ratio.id]:valid},asOf);assert.equal(incomplete.status,'Evidence incomplete');assert.equal(incomplete.unscored,1);
 assert.equal(summarizeMetrics([],{},asOf).status,'No applicable metrics');
});

test('CSV and Markdown retain the full register, raw cohort and evidence; CSV neutralises formula cells',()=>{
 const records={'OP-01':{...valid,evidence:'=HYPERLINK("malicious")'}};
 const csv=metricCsv(businessMetrics,records,asOf);assert(csv.includes("'=HYPERLINK"));assert(csv.includes('October 2026, fixed pilot cohort'));
 const md=metricsMarkdown(records,asOf);businessMetrics.forEach(m=>assert(md.includes(`### ${m.id}: ${m.title}`)));assert(md.includes(asOf));assert(md.includes('not industry benchmarks'));
});

test('scorecard routes, next-step journey and metric search remain integrated',()=>{
 assert.equal(routes['Performance scorecard'],'performance');
 assert.deepEqual(parseHash(toHash('Performance scorecard','OP-03')),{page:'Performance scorecard',sub:'OP-03'});
 assert(searchResults('OP-03').some(r=>r.page==='Performance scorecard'&&r.sub==='OP-03'));
 assert.equal(nextStep('AI agentic SDLC').target,'Performance scorecard');assert.equal(nextStep('Performance scorecard').action,'export');
});
