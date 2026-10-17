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
