## SafeSphere MVP Choices

This document captures why we trimmed the UI and focused on the leanest workflow possible for the MVP release.

### 1. Present only actionable information
- Legacy dashboards showed colourful statistics, gradients, and mock data. None of that helped HSSE teams decide what to do next.
- We replaced the home dashboard with a single “control room” feed that pulls live counts from the API and links directly to the work queues (documents awaiting approval, open CAPAs, low PPE stock).
- Module dashboards (documents, PPE) now list blocking items instead of loading charts and animations, which keeps bundle size down and keeps attention on compliance tasks.

### 2. Prefer text lists over charts for now
- Recharts, dozens of Material icons, and animated cards added ~200 kB to the JS payload without adding insight.
- Lists with counts show the same information faster, stream on slow connections, and are easier to export to Excel/email when leadership asks for context.

### 3. Keep data trustworthy
- The previous UI hard-coded numbers (“12 Documents”, “88% compliance”), which risked misleading auditors.
- Every count on the MVP views now comes from real endpoints: `/documents/dashboard/`, `/ppes/dashboard/*`, and `/audits/capas/my-capas/`.

### 4. Reduce context switching
- Each section is actionable: click an item to jump straight into the relevant module (document library, CAPA board, PPE inventory).
- We removed duplicate navigation shells, carousels, and infographics so the user spends time on the workflow, not on learning yet another mini-dashboard.

### 5. Optimize for HSSE critical paths
- Document owners see pending approvals and change requests first.
- PPE coordinators see low-stock and upcoming expiries first.
- CAPA owners get a short list of their open tasks with due dates.

Future iterations can add richer analytics once the workflows are validated, but the MVP now meets the baseline expectation for a compliant, fast, and honest HSSE platform.*** End Patch

