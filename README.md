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

No original AWS image attachments were available in the workspace. The import action views a reference image locally; it does not perform automatic image analysis.

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
