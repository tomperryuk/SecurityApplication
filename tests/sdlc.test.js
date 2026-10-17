import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateSdlc, defaultSdlcInputs, sdlcPresets, sdlcStages, sdlcPod, sdlcRollout, sdlcMarkdown} from '../src/sdlcData.js';
import {quickStarts} from '../src/blueprintData.js';
const near = (actual,expected) => assert(Math.abs(actual-expected)<1e-9, `${actual} != ${expected}`);

test('illustrative model reconciles effort, economic value and separate cash impact', () => {
  const m=calculateSdlc(defaultSdlcInputs);
  assert.equal(m.eligibleHours,360);assert.equal(m.grossSavedHours,144);
  assert.equal(m.extraHours,90);assert.equal(m.assistedHours,546);assert.equal(m.netSavedHours,54);
  assert.equal(m.recurringCash,1340);assert.equal(m.monthlySetup,1500);
  assert.equal(m.baselineCost,54000);assert.equal(m.assistedCost,51980);assert.equal(m.netEconomicValue,2020);
  assert.equal(m.cashRunRate,-1340);assert.equal(m.firstMonthCashImpact,-10340);assert.equal(m.cashPaybackMonths,null);
  near(m.baselineDays,30);near(m.assistedDays,28.2);near(m.cycleReductionPercent,6);
  near(m.baselineCost-m.assistedCost,m.netEconomicValue);
});

test('rework-heavy scenario exposes extra effort, longer delivery and negative value', () => {
  const m=calculateSdlc({...defaultSdlcInputs,...sdlcPresets.cautious.changes});
  assert(m.netSavedHours<0);assert(m.netEconomicValue<0);assert(m.assistedDays>m.baselineDays);
  assert.equal(m.valuePaybackMonths,null);
});

test('no eligible work yields no gross savings and no percentage break-even', () => {
  const m=calculateSdlc({...defaultSdlcInputs,eligiblePercent:0});
  assert.equal(m.grossSavedHours,0);assert.equal(m.netSavedHours,-90);assert.equal(m.breakEvenGrossPercent,null);
});

test('unchanged external waits dilute delivery gains without changing task effort', () => {
  const immediate=calculateSdlc({...defaultSdlcInputs,fixedWaitDays:0});
  const waiting=calculateSdlc({...defaultSdlcInputs,fixedWaitDays:30});
  near(immediate.netSavedHours,waiting.netSavedHours);
  assert(immediate.cycleReductionPercent>waiting.cycleReductionPercent);
  near(waiting.assistedDays-immediate.assistedDays,30);
});

test('documented avoided cash changes the cash view without double counting labour value', () => {
  const baseline=calculateSdlc(defaultSdlcInputs);
  const m=calculateSdlc({...defaultSdlcInputs,avoidedCashSpend:2000});
  assert.equal(m.netEconomicValue,baseline.netEconomicValue);
  assert.equal(m.cashRunRate,660);near(m.cashPaybackMonths,9000/660);
});

test('zero capacity and invalid input never fabricate finite lead-time or payback claims', () => {
  const zero=Object.fromEntries(Object.keys(defaultSdlcInputs).map(k=>[k,0]));
  const m=calculateSdlc(zero);
  assert.equal(m.baselineDays,null);assert.equal(m.assistedDays,null);assert.equal(m.cycleReductionPercent,null);
  assert.equal(m.breakEvenGrossPercent,null);assert.equal(m.valuePaybackMonths,null);assert.equal(m.cashPaybackMonths,null);
  Object.values(m).forEach(v=>assert(v===null||Number.isFinite(v)));
  const bounded=calculateSdlc({...defaultSdlcInputs,grossSavingPercent:200,eligiblePercent:200,reviewHours:-10});
  assert.equal(bounded.grossSavedHours,600);assert.equal(bounded.extraHours,30);
});

test('workflow and mobilisation align to real foundation recipes; illustrative pod sums to four FTE', () => {
  const ids=new Set(quickStarts.map(q=>q.id));
  sdlcStages.forEach(s=>s.quickStarts.forEach(id=>assert(ids.has(id))));
  sdlcRollout.forEach(r=>r.recipes.forEach(id=>assert(ids.has(id))));
  near(sdlcPod.reduce((sum,row)=>sum+parseFloat(row[1]),0),4);
  const exported=sdlcMarkdown(defaultSdlcInputs);
  sdlcStages.forEach(s=>assert(exported.includes(s.title)));
  assert(exported.includes('£2,020'));assert(exported.includes('not payroll savings'));
  assert(exported.includes('### Starter task contract'));
});
