# Slinn Security Architecture

A React application for reviewing a security operating model, comparing AWS architecture patterns, and evaluating commercial alternatives.

## Run locally

```sh
npm install
npm run dev
```

Open the printed local URL (normally http://127.0.0.1:5173).

```sh
npm run build
npm run preview
```

## Included

- All 19 capabilities from the brief, with scope, cadence, implementation, AWS mappings, tradeoffs, guardrails, owners and metrics.
- Interactive response/evidence architecture and three selectable approaches.
- Vendor guide covering Snowflake, Databricks, Microsoft Sentinel, Splunk, Elastic, Panther, Cribl, Tines, Wiz, CrowdStrike, Okta and Rubrik, with official references, procurement routes and cost drivers.
- Eight design review observations and an indicative phased delivery roadmap.
- Capability search, cadence filters, vendor shortlisting, review tracking, image reference viewing and Markdown export.
- Responsive layouts and keyboard-accessible dialogs.

Architecture choice, vendor shortlist, review checks and delivery progress use browser localStorage. Reference images stay in memory for the current view. No AWS accounts, vendor systems or production controls are connected. No backend or credentials are required. Google Fonts is optional; local sans-serif fallbacks are configured.

Research was checked against official AWS and vendor sources on 17 October 2026. Recommendations are planning guidance. Latencies, licensing, availability and prices must be validated for the target estate. Vendor cards link to official product or buying information; exact marketplace terms and private offers require confirmation.

The import action opens an AWS diagram or architecture image beside the design for comparison. It is viewed locally in the browser; it is not uploaded or automatically analysed.

## Fly.io deployment

Production URL: https://slinn-security-architecture.fly.dev

The `Deploy to Fly.io` GitHub Actions workflow builds pull requests and automatically deploys successful pushes to `main`. It can also be run manually from the Actions tab. The deploy job uses the `production` environment and serialises deployments.

The multi-stage Dockerfile builds with Node 24 and serves the compiled site with nginx on port 8080. Fly forces HTTPS, checks `/healthz`, and runs a 256 MB shared-CPU Machine in London (`lhr`). Deployment uses one Machine (`--ha=false`); idle Machines can stop and restart on demand, so the first request after idle may be slower. Storage, compute, networking and builds are subject to Fly.io billing.

The Fly app must exist before the workflow runs. GitHub repository secret `FLY_API_TOKEN` contains an app-scoped deploy token; no credentials belong in source control. The initial token is configured with a one-year expiry. Before it expires, generate a replacement and pipe it directly into GitHub without printing or saving it:

```sh
flyctl tokens create deploy --app slinn-security-architecture --expiry 8760h | gh secret set FLY_API_TOKEN --repo tomperryuk/SecurityApplication
```

To roll back, revert the relevant commit on `main` and let the workflow redeploy. Browser-local selections are specific to the deployed origin; this application does not have a shared database.

## Implementation playbooks (design v2)

The Architecture page contains six interactive reference designs: account foundations, detection/containment, security data, agent controls, recovery, and detection delivery. Select a component for its owner, implementation contract and boundary. Connection registers, failure tests, acceptance scenarios and prerequisite recipes accompany each view. Diagrams download as SVG or editable Mermaid.

Organisation includes five practice charters, lean/MDR versus scaled team structures, decision-rights RACI, all 19 capability assignments and a transparent continuous-seat staffing calculator. Delivery model includes four workstreams, dependencies, readiness gates, service contracts, delivery forums and the first four-week mobilisation sequence.

Foundation quick starts contains ten implementation recipes with prerequisites, build steps, three evidence checks each, handover artefacts, rollback/stop conditions, downloadable starter contracts and official documentation. Checkmarks are browser-local evidence tracking, not automated verification. Templates are illustrative contracts, not ready-to-apply Terraform or CloudFormation; no AWS infrastructure is provisioned by this application. Staffing, effort and elapsed-time estimates are planning assumptions that need validation against the organisation.

The complete Markdown export includes the new architecture source diagrams, component/connection details, operating model and foundation recipes. A recipe export includes its locally recorded evidence checks.

## AI agentic SDLC

The AI agentic SDLC page adds a seven-stage workflow, human/agent boundaries, four-workstream alignment, a proposed 4.0 FTE delivery pod, mobilisation guidance and an example task contract. Agent sandboxing, evaluation and human acceptance are proposed implementation guidance; this page does not enable a live agent runtime or change repository access/approval settings.

The speed and cost model uses browser-local editable assumptions and GBP illustrations, not vendor quotes or a guaranteed productivity uplift. It applies gross task reductions only to eligible effort, adds incremental review/rework, and accounts for seats, usage, sandbox/CI, support and setup costs. It separates recovered-capacity value from actual cash impact, includes unchanged external wait in the illustrative lead-time calculation and permits negative results. Avoided cash spend is a separate, documented budget decision and is not added to recovered labour value. The model covers a monthly engineering cohort, excluding the wider SOC/security operating budget.

Download the SDLC playbook, Mermaid workflow and task contract from the new page. The complete design export includes the currently saved economics assumptions and results. `npm test` covers model reconciliation, negative/zero scenarios, dependency alignment and prevention of cash/capacity double counting, alongside the foundation-content checks.

## Guided journey

The guide is organised as three stages, shown in the sidebar: **understand the problem** (Overview, Capability map, Design review), **decide what is needed** (Options & tradeoffs, Architecture, Organisation, Vendor landscape) and **deliver it** (Delivery roadmap, Foundation quick starts, Delivery model, AI agentic SDLC). Each page ends with a suggested next step.

- **Linked content.** A capability opens a hub showing the designs that cover it, the recipes that build it (with evidence progress and roadmap phase), the accountable practice and the tools that could fill gaps. Each design-review observation links to the recipes that address it.
- **Choosing an approach.** Four questions on Options & tradeoffs suggest an approach and an organisation model. The choice carries through: a banner on Architecture and Foundation quick starts, optional recipes, vendor ordering, the organisation model and the roadmap.
- **One timeline.** `roadmap` in `src/data.js` is the single plan: five phases, each with its recipes. Delivery model, workstream windows and the evidence progress shown on Overview and Roadmap all derive from it. A test checks that every recipe is in exactly one phase and never before its prerequisites. Progress comes from recorded evidence checks; sign-off is a separate human decision and warns when checks are outstanding.
- **Critical path.** The roadmap and Foundation quick starts show the minimum sequenced effort from the recipe dependencies, alongside the total.
- **Shareable views.** The page, architecture view, recipe and team are in the URL (for example `#/quick-starts/QS-06`), so links and the back button work. Press ⌘K / Ctrl+K to search every page, capability, design, recipe, team, vendor and review item.
- **Shortlist comparison.** Shortlist two or more vendors to compare them side by side on the same questions.
- **Reset.** The help dialog can reset all locally saved choices and evidence.

Cross-page logic lives in `src/journey.js` (covered by `tests/journey.test.js`); the components are in `src/JourneyViews.jsx`.
