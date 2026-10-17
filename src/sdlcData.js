export const sdlcStages = [
  {id:'intent', title:'Specify the outcome', agent:'Planning assistant', human:'Security product owner + control owner', input:'Owned risk, attack path or foundation recipe; service criticality and acceptance criteria.', action:'Draft a small task contract, dependency list and evidence requirements. Link the task to a capability and quick start rather than asking an agent to “build security”.', output:'Human-approved issue with allowed paths/tools, explicit exclusions, test cases, budget and stop conditions.', gate:'Humans approve scope, risk assumptions and the definition of done before execution.', quickStarts:['QS-01','QS-08'], benefit:'Less time turning broad requirements into repeatable engineering tasks.'},
  {id:'design', title:'Plan & threat model', agent:'Architecture / threat-model assistant', human:'Technical lead + affected service owner', input:'Approved issue, architecture decision records, account boundaries, source contracts and supported service documentation.', action:'Propose implementation options, interfaces, least-privilege changes and rollback. Identify untrusted content, missing context and failure scenarios.', output:'Reviewed design/change plan and independent acceptance-test outline.', gate:'Changes to IAM, organisation policies, retention, data egress or critical actions need the relevant human control owner.', quickStarts:['QS-02','QS-03'], benefit:'Earlier discovery of missing dependencies and unsafe assumptions.'},
  {id:'build', title:'Implement in isolation', agent:'Scoped coding / IaC / detection agent', human:'Delivery engineer', input:'Approved task contract, allowlisted repository context and a disposable branch/workspace.', action:'Draft one bounded change: parser, detection rule, IaC module, response test or runbook. Run approved tools in a sandbox with capped runtime, spend and retries.', output:'A reviewable pull request, implementation notes and a manifest of changed files and tool actions.', gate:'No production credentials or direct protected-branch writes. Treat issue text, logs, dependency content and retrieved documents as untrusted.', quickStarts:['QS-03','QS-04','QS-09'], benefit:'Faster scaffolding and repetitive edits while retaining a human-owned diff.'},
  {id:'verify', title:'Evaluate independently', agent:'Test / evaluation assistant + deterministic CI', human:'Test/evaluation engineer + control owner', input:'The proposed diff plus independently reviewed positive, negative and failure fixtures.', action:'Run schema, unit/integration, security and policy checks; replay relevant attack and benign scenarios. Compare results against the fixed task contract.', output:'Test/evaluation report, provenance, cost/latency usage and unresolved findings.', gate:'The builder cannot approve its own result. Agent-generated tests complement independent fixtures; a second model is not an independent assurance function.', quickStarts:['QS-06','QS-09','QS-10'], benefit:'More consistent evidence packs and broader repeatable regression coverage.'},
  {id:'review', title:'Human acceptance', agent:'Review assistant', human:'Code owner + security/service owner where required', input:'Pull request, design changes, test evidence, policy/permission diff and rollback.', action:'Summarise the diff and flag risky changes for a qualified reviewer. Review requirements, operational impact and evidence rather than only generated prose.', output:'Recorded human approval or a bounded rework task with a reason.', gate:'Protect required checks, CODEOWNERS and review rules. A model score or agent-authored approval cannot bypass the human gate.', quickStarts:['QS-06','QS-08'], benefit:'Reduced review preparation time; reviewer capacity still constrains throughput.'},
  {id:'release', title:'Release through trusted CI', agent:'Deterministic release automation', human:'Release owner / business service owner', input:'Reviewed commit, trusted workflow, deployment identity, canary cohort and readiness evidence.', action:'Build an immutable artifact, apply normal change controls and deploy to the approved environment. Use a small canary, health checks and a tested rollback.', output:'Versioned release, deployment evidence and an accountable operational handover.', gate:'Use trusted workflows and separate short-lived deployment credentials. Do not run untrusted PR code with production secrets or let an agent weaken release controls.', quickStarts:['QS-02','QS-06','QS-08'], benefit:'Repeatable release preparation and less handover toil; infrastructure and approval waits remain.'},
  {id:'learn', title:'Observe & improve', agent:'Read-only evidence / operations assistant', human:'SOC, platform on-call + product owner', input:'Approved deployment health, telemetry freshness, case outcomes, escaped defects and agent usage.', action:'Draft release notes, reconcile evidence and propose backlog improvements. Monitor review queues, rework, false containment and cost per accepted change.', output:'Human-reviewed service metrics, incident links and the next prioritised engineering task.', gate:'Read-only production analysis by default. Production response actions continue through the separate guarded-response authority model.', quickStarts:['QS-03','QS-07','QS-08'], benefit:'Shorter feedback loops and less manual reporting without transferring incident accountability to agents.'}
];
export const sdlcPod = [
  ['Security product owner','0.25 FTE','Own outcomes, scope, pilot selection and acceptance.','Delegates backlog drafting and evidence summaries; retains risk/priority decisions.'],
  ['Technical lead / architecture','0.75 FTE','Own design, trust boundaries, task decomposition and review quality.','Spends more time on interfaces, threat models and critical review; less on scaffolding.'],
  ['Platform / data engineer','1.00 FTE','Own IaC, identity, telemetry pipelines and automation reliability.','Supervises bounded implementation tasks and maintains reusable approved modules.'],
  ['Detection / response engineer','1.00 FTE','Own detection fidelity, fixtures and response policy.','Uses agents for rule/test drafts and enrichment; retains containment semantics and effectiveness decisions.'],
  ['Test / security evaluation engineer','0.75 FTE','Own independent acceptance fixtures, abuse tests and evidence quality.','Reviews generated tests, validates failure modes and measures regressions.'],
  ['Release / service reliability','0.25 FTE','Own release readiness, deployment controls, rollback and service handover.','Uses deterministic CI and reporting assistance while preserving separation of deployment authority.']
];
export const sdlcAlignment = [
  ['Foundation & security data','Draft account modules, parser mappings, source contracts and access-test fixtures.','QS-01–05','Pilot account only; approve IAM, SCP, residency and archive changes.'],
  ['Detection & response product','Draft rules, replay data, playbook tests, case mappings and failure/rollback documentation.','QS-04, QS-06, QS-08','Human validates detection semantics; high-impact actions remain under incident authority.'],
  ['Exposure & recovery','Draft remediation PRs, dependency updates, restore scripts and exercise evidence summaries.','QS-07, QS-09','Owners approve emergency changes, recovery-point selection and business restoration acceptance.'],
  ['Assurance & agent enablement','Draft control-to-evidence mappings, threat models, eval cases and agent tool contracts.','QS-02, QS-08, QS-10','GRC verifies evidence; business owners accept residual risk; tool permissions are enforced outside the model.']
];
export const sdlcRollout = [
  {week:'Pilot weeks 1–2',title:'Measure the baseline and prepare the sandbox',owner:'Technical lead + product owner',work:'Choose two bounded task types from the foundation backlog. Capture recent comparable delivery/review/rework times; create a sandbox identity, approved context catalogue, branch workflow and per-task budget.',gate:'Acceptance fixtures are human-reviewed; access boundaries, data handling, budget limits and stop conditions are tested.',recipes:['QS-02','QS-03','QS-09']},
  {week:'Pilot weeks 3–4',title:'Pilot one agent with human-reviewed PRs',owner:'Delivery engineer + evaluation engineer',work:'Start with documentation/source-contract updates and non-production parser or detection-test changes. Give the agent a narrow task contract; retain every failed attempt, reviewer correction and tool cost in the pilot dataset.',gate:'Compare completed accepted tasks with a matched baseline. Measure cycle time, review time, escaped defects and spend; publish slowdowns as well as gains.',recipes:['QS-04','QS-08','QS-09']},
  {week:'Pilot weeks 5–8',title:'Expand proven patterns across delivery streams',owner:'Security platform lead + Head of SecOps',work:'Reuse verified modules and fixtures for more complex IaC/detection/playbook tasks. Add an evaluation assistant when useful, cap work in progress to reviewer capacity and use the trusted release pipeline.',gate:'Expand only where net accepted-change effort improves without worsening critical quality or control effectiveness. Permission/production changes still require their normal owners.',recipes:['QS-06','QS-09','QS-10']},
  {week:'Ongoing',title:'Operate the agent platform as a service',owner:'Security platform lead + control owners',work:'Version models, prompts, tool policy and fixtures; rerun evals after changes. Review provider data terms, residency, usage budgets, connector scope and access expiry. Maintain a manual engineering path.',gate:'Track cost and effort per accepted change, p50/p95 lead time, review backlog, rework, escaped defects and security outcomes. Roll back a model/prompt/tool change when quality degrades.',recipes:['QS-03','QS-08','QS-10']}
];
export const sdlcTaskTemplate = `task_id: foundation-parser-pilot-001
capability: telemetry_and_detection
foundation_recipe: QS-03
human_owner: security_data_engineer
objective: normalise_a_synthetic_idp_event
repository_scope:
  allowed_paths: [src/parsers/pilot/, tests/parsers/pilot/]
  branch: agent/pilot-parser
context:
  approved_sources: [source_contract_v1, synthetic_fixtures]
  sensitive_production_data: prohibited
execution:
  environment: disposable_sandbox
  production_credentials: unavailable
  allowed_tools: [read_scoped_files, edit_scoped_files, run_allowlisted_tests]
  network: approved_destinations_only
  max_runtime_minutes: 20
  max_attempts: 2
  spend_limit_gbp: 5 # example ceiling, not a provider price
acceptance:
  independent_fixtures: required
  positive_negative_failure_tests: required
  permission_changes: prohibited
  human_code_owner_review: required
  required_ci_checks: must_pass
stop_on: [missing_context, scope_expansion, budget_exhausted, unexpected_secret]
output: pull_request_with_diff_test_evidence_and_usage
release_authority: trusted_ci_after_human_acceptance`;
export const sdlcSources = [
  ['GitHub controlled coding-task experiment (2022)','https://github.blog/news-insights/research/research-quantifying-github-copilots-impact-on-developer-productivity-and-happiness/','A bounded programming experiment reported substantially faster task completion. It does not establish the speedup of this security programme or its end-to-end release cycle.'],
  ['METR productivity study update (February 2026)','https://metr.org/blog/2026-02-24-uplift-update/','METR discusses an earlier experienced-developer study that found slower completion and the difficulty of drawing clean estimates from later experiments. Outcomes depend on task, context and measurement.'],
  ['GitHub agent responsible-use guidance','https://docs.github.com/en/copilot/responsible-use/agents','Product documentation describes agent capabilities, constraints and human responsibility for review. Verify the controls and entitlements of your chosen tool.'],
  ['NIST Secure Software Development Framework','https://csrc.nist.gov/pubs/sp/800/218/final','Secure-development practices provide a baseline for the proposed design, verification and release gates. Adding agents does not remove those responsibilities.']
];
export const defaultSdlcInputs = {
  baselineHours:600, eligiblePercent:60, grossSavingPercent:40, reviewHours:60, reworkHours:30,
  hourlyRate:90, seats:8, seatPrice:30, inferenceCost:600, ciCost:200, governanceCost:300,
  setupCost:9000, amortisationMonths:6, deliveryFte:4, hoursPerDay:7.5, fixedWaitDays:10, avoidedCashSpend:0
};
export const sdlcPresets = {
  cautious:{label:'Cautious / rework-heavy',changes:{grossSavingPercent:15,reviewHours:80,reworkHours:40}},
  pilot:{label:'Illustrative pilot',changes:{grossSavingPercent:40,reviewHours:60,reworkHours:30}},
  mature:{label:'Proven reusable tasks',changes:{grossSavingPercent:60,reviewHours:50,reworkHours:20}}
};
export function calculateSdlc(input) {
  const v={};
  for(const key of Object.keys(defaultSdlcInputs)) v[key]=Math.max(0,Number.isFinite(Number(input[key]))?Number(input[key]):defaultSdlcInputs[key]);
  v.eligiblePercent=Math.min(100,v.eligiblePercent);v.grossSavingPercent=Math.min(100,v.grossSavingPercent);
  const eligibleHours=v.baselineHours*v.eligiblePercent/100;
  const grossSavedHours=eligibleHours*v.grossSavingPercent/100;
  const extraHours=v.reviewHours+v.reworkHours;
  const assistedHours=v.baselineHours-grossSavedHours+extraHours;
  const netSavedHours=v.baselineHours-assistedHours;
  const labourValue=netSavedHours*v.hourlyRate;
  const recurringCash=v.seats*v.seatPrice+v.inferenceCost+v.ciCost+v.governanceCost;
  const monthlySetup=v.setupCost/Math.max(1,v.amortisationMonths);
  const netEconomicValue=labourValue-recurringCash-monthlySetup;
  const steadyValue=labourValue-recurringCash;
  const baselineCost=v.baselineHours*v.hourlyRate;
  const assistedCost=assistedHours*v.hourlyRate+recurringCash+monthlySetup;
  const dailyCapacity=v.deliveryFte*v.hoursPerDay;
  const baselineDays=dailyCapacity>0?v.baselineHours/dailyCapacity+v.fixedWaitDays:null;
  const assistedDays=dailyCapacity>0?assistedHours/dailyCapacity+v.fixedWaitDays:null;
  const cycleReductionPercent=baselineDays>0?(baselineDays-assistedDays)/baselineDays*100:null;
  const cashRunRate=v.avoidedCashSpend-recurringCash;
  return {eligibleHours,grossSavedHours,extraHours,assistedHours,netSavedHours,labourValue,recurringCash,monthlySetup,netEconomicValue,steadyValue,baselineCost,assistedCost,baselineDays,assistedDays,cycleReductionPercent,cashRunRate,
    effortReductionPercent:v.baselineHours>0?netSavedHours/v.baselineHours*100:0,
    capacityFte:netSavedHours/Math.max(1,v.hoursPerDay*20),
    breakEvenGrossPercent:eligibleHours>0&&v.hourlyRate>0?(extraHours+(recurringCash+monthlySetup)/v.hourlyRate)/eligibleHours*100:null,
    valuePaybackMonths:steadyValue>0?v.setupCost/steadyValue:null,
    cashPaybackMonths:cashRunRate>0?v.setupCost/cashRunRate:null,
    firstMonthCashImpact:v.avoidedCashSpend-recurringCash-v.setupCost
  };
}
export function loadSdlcInputs(){
  try {if(typeof window!=='undefined'){const saved=JSON.parse(localStorage.getItem('slinn-agentic-sdlc-economics')||'null');if(saved&&typeof saved==='object'&&!Array.isArray(saved))return {...defaultSdlcInputs,...Object.fromEntries(Object.entries(saved).filter(([k,v])=>k in defaultSdlcInputs&&Number.isFinite(v)&&v>=0))};}}catch{}
  return {...defaultSdlcInputs};
}
export function sdlcMermaid(){return `flowchart LR
  intent["Human-approved outcome / task contract"] --> plan["Architecture & threat-model proposal"]
  plan --> build["Scoped agent in disposable sandbox"]
  context["Approved repo / docs / synthetic fixtures"] -.-> build
  tools["Allowlisted tools + spend / runtime limits"] -.-> build
  build --> pr["Pull request + provenance + usage"]
  pr --> evaluate["Independent fixtures + deterministic CI"]
  evaluate --> human{"Qualified human acceptance"}
  human -->|approved| release["Trusted CI + scoped deployment identity"]
  human -->|rework or reject| intent
  release --> canary["Canary + independent health / control checks"]
  canary --> observe["Read-only outcome & cost analysis"]
  observe --> intent
  canary -->|regression| rollback["Human-owned rollback / disable path"]`;}
export function sdlcMarkdown(input=loadSdlcInputs()) {
  const m=calculateSdlc(input), gbp=x=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(x);
  return `## AI agentic SDLC\n\nProposed delivery design: agents draft and execute scoped engineering work; people own risk, acceptance, release and operational outcomes. Agent roles are not staff roles. No coding-agent runtime is enabled by this design page.\n\n\`\`\`mermaid\n${sdlcMermaid()}\n\`\`\`\n\n### Delivery workflow\n${sdlcStages.map(s=>`#### ${s.title}\nAgent / automation: ${s.agent}\nHuman owner: ${s.human}\nInputs: ${s.input}\nActivity: ${s.action}\nOutput: ${s.output}\nGate: ${s.gate}\nPotential benefit: ${s.benefit}\nFoundation alignment: ${s.quickStarts.join(', ')}`).join('\n\n')}\n\n### Delivery stream alignment\n${sdlcAlignment.map(r=>r.join(' | ')).join('\n')}\n\n### Human delivery pod (illustrative 4.0 FTE, separate from the full security organisation)\n${sdlcPod.map(r=>r.join(' | ')).join('\n')}\n\nKeep the existing five-practice security organisation, business service ownership and 24x7 SOC/MDR cover. Platform owns the agent service; IAM owns identities; control owners own independent fixtures and evaluation; qualified humans own acceptance and deployment authority. Recovered effort is capacity, not automatic headcount removal.\n\n### Cost and speed scenario\nAll prices and productivity inputs below are user-editable illustrations, not vendor quotes or measured benefits. Existing salaries remain cash costs unless an actual budget decision changes them.\n\n${Object.entries(input).map(([k,v])=>`- ${k}: ${v}`).join('\n')}\n\n- Eligible hours: ${m.eligibleHours.toFixed(1)}\n- Gross task hours saved: ${m.grossSavedHours.toFixed(1)}\n- Extra review + rework: ${m.extraHours.toFixed(1)} hours\n- Net capacity recovered: ${m.netSavedHours.toFixed(1)} hours/month (${m.effortReductionPercent.toFixed(1)}%)\n- Assisted effort: ${m.assistedHours.toFixed(1)} hours/month\n- Recurring incremental cash spend: ${gbp(m.recurringCash)}/month\n- One-off setup: ${gbp(input.setupCost)}\n- Setup amortisation: ${gbp(m.monthlySetup)}/month\n- Baseline loaded-labour equivalent: ${gbp(m.baselineCost)}/month\n- Assisted labour + tools + amortised setup: ${gbp(m.assistedCost)}/month\n- Net modelled economic value: ${gbp(m.netEconomicValue)}/month (capacity value, not payroll savings)\n- Ongoing cash impact after documented avoided spend: ${gbp(m.cashRunRate)}/month\n- First-month cash impact: ${gbp(m.firstMonthCashImpact)}\n- Simplified batch lead time: ${m.baselineDays?.toFixed(1)??'n/a'} → ${m.assistedDays?.toFixed(1)??'n/a'} working days\n- Lead-time reduction: ${m.cycleReductionPercent?.toFixed(1)??'n/a'}%\n- Gross eligible-task reduction required for economic break-even: ${m.breakEvenGrossPercent?.toFixed(1)??'n/a'}%\n- Capacity-value payback: ${m.valuePaybackMonths?.toFixed(1)??'none'} months; requires productive redeployment of recovered hours\n- Cash payback: ${m.cashPaybackMonths?.toFixed(1)??'none'} months\n\nFormulas: eligible hours = baseline × eligible%; gross saved = eligible × task-effort reduction%; assisted hours = baseline − gross saved + additional review + additional rework. Monthly economic value = net recovered hours × loaded hourly rate − incremental tools/infrastructure/governance − amortised setup. Lead time = batch effort ÷ (delivery FTE × productive hours/day) + unchanged external wait. This linear batching illustration is not a queueing or critical-path simulation.\n\nIncremental seat, inference and infrastructure inputs must be net of included entitlements to avoid double counting. One-off setup cost is additional to the monthly steady-state delivery cohort. Avoided cash spend is a documented budget change and is shown separately from capacity value; the two views must not be added together. Quality and independent control-effectiveness gates apply before any speed claim.\n\n### Mobilisation\n${sdlcRollout.map(r=>`#### ${r.week}: ${r.title}\nOwner: ${r.owner}\nWork: ${r.work}\nGate: ${r.gate}\nRecipes: ${r.recipes.join(', ')}`).join('\n\n')}\n\n### Starter task contract\nIllustrative policy template, not executable agent configuration. Enforce it in the selected runtime and CI.\n\n\`\`\`yaml\n${sdlcTaskTemplate}\n\`\`\`\n\n### Pilot benefit measurement\nUse matched task types and comparable complexity/review requirements; keep accepted changes as the denominator and include failed attempts, review, rework and agent spend. Track p50/p95 issue-to-accepted-release time, reviewer time, escaped defects, change failure, cost per accepted change and security-control effectiveness. Separate warm-up from steady-state and randomise task assignment where practical. Broader adoption requires net value without degraded quality, not merely more generated code.\n\n### Sources and limits of evidence\n${sdlcSources.map(([n,u,t])=>`- [${n}](${u}): ${t}`).join('\n')}\n\nResearch reviewed 17 October 2026. No published task-level speedup is assumed to apply to this programme.\n`;
}
