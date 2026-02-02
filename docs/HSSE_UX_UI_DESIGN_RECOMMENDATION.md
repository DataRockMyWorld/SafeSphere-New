# HSSE & Performance Management Application  
## UX/UI Design Recommendation

**Role:** Principal UX/UI Designer & Product Architect  
**Scope:** Web-based HSSE & Performance Management (ISO 45001, ISO 9001, ISO 14001)  
**Audience:** Operational staff, Supervisors, HSSE Managers, Senior management  
**Stack:** React, sidebar + top navbar + central content area  

---

## Executive Summary

This document defines the optimal UX/UI structure for a daily-use HSSE application that balances **speed of reporting**, **clarity of performance**, **low cognitive load** for field users, and **audit readiness**. The structure follows Plan–Do–Check–Act, minimizes clicks for high-frequency tasks, and scales as ISO modules (documents, audits, risk, compliance, PPE, etc.) grow.

---

## 1. Sidebar Navigation Design

### 1.1 Recommended Module Grouping

| Group | Modules | Rationale |
|-------|---------|-----------|
| **Operations** | Incidents, Near Misses, Inspections, Actions/CAPAs | Day-to-day execution; PDCA “Do” and “Check.” Field and supervisors use daily. |
| **Performance** | Dashboard, Objectives & KPIs, Trends, Management Review | PDCA “Plan” and “Act”; answers “How are we doing?” |
| **Governance** | Documents, Compliance, Risk, Audits | Policies, legal register, risk register, audit plans; PDCA “Plan” and evidence. |
| **Resources** | PPE, Training (if applicable) | Supporting controls; often tied to incidents and audits. |
| **Administration** | Users, Settings, Reports export | System and access control; role-restricted. |

**Why this grouping:**  
- **Operations** = “What happened and what we’re doing about it” (incidents, inspections, actions).  
- **Performance** = “Are we meeting goals?” (KPIs, trends, management review).  
- **Governance** = “What we must follow and prove” (documents, compliance, risk, audits).  
- **Resources** = “What we use to work safely” (PPE, training).  
- **Administration** = “Who can do what and how the system is configured.”

### 1.2 Always Visible vs Role-Based

| Visibility | Items | Reason |
|------------|--------|--------|
| **Always visible (all roles)** | Dashboard, Incidents (or “Report”), My Actions | Everyone needs a home, a way to report, and to see their own tasks. |
| **Role-based** | Objectives & KPIs, Management Review, Audits (planner/findings), Compliance (register/review), Admin (users/settings) | HSSE Managers and above need analysis and compliance; field needs simplicity. |
| **Conditional** | “Pending approvals” (e.g. documents, CAPAs) | Show only when user has approver role and there are pending items. |

**Rule of thumb:** If a user never uses a module in their role, hide it. If they use it rarely, keep it but low in the list or in a “More” section.

### 1.3 Priority Order (Top to Bottom)

1. **Dashboard** – First; single place for status and next actions.  
2. **Report Incident / Near Miss** – One-tap entry for the most critical HSSE action.  
3. **My Actions / My CAPAs** – Personal follow-ups; high daily use.  
4. **Incidents & Near Misses** (list/register) – Review and follow-up.  
5. **Inspections** – Routine checks; supervisors and field.  
6. **Objectives & KPIs** – Performance view; managers and above.  
7. **Documents, Compliance, Risk, Audits** – Governance; order by frequency of use per role.  
8. **PPE / Resources** – As used in your workflows.  
9. **Administration** – Last; settings and user management.

### 1.4 Icon + Label Best Practices

- **Always show labels** (no icon-only for critical items). Field users and audit need clarity.  
- **Icons:** Consistent style (e.g. Material Icons or similar), one icon per item.  
  - Incidents: warning/alert.  
  - Actions/CAPAs: assignment/checklist.  
  - Dashboard: dashboard/chart.  
  - Documents: description/folder.  
  - Audits: fact-check/assignment.  
- **Active state:** Bold label + distinct background or left border; icon can stay same color or match.  
- **Collapsed sidebar:** Icon + tooltip on hover; expand on click. Keep “Report Incident” and “Dashboard” easily reachable when collapsed.

### 1.5 Collapsible vs Fixed Sections

- **Fixed (no collapse):** Dashboard, Report Incident, My Actions. These should be one click from anywhere.  
- **Collapsible groups:** Operations, Performance, Governance, Resources, Administration.  
  - **Default:** Expand “Operations” and “Performance”; collapse “Governance” and “Administration” if you want to reduce initial clutter.  
  - **Remember state:** Persist expand/collapse per user (localStorage or backend preference).  
- **Single level preferred:** Avoid deep nesting (e.g. max one level: group → items). If you have many items, use a “More” submenu or a second tier only for heavy modules (e.g. Audits → Planner, Findings, CAPAs).

**Why:** Reduces cognitive load, keeps daily tasks visible, and still exposes full structure for managers and auditors.

---

## 2. Top Navbar Design

### 2.1 Recommended Contents (Left to Right)

| Element | Purpose | Priority |
|--------|---------|----------|
| **Module title / breadcrumb** | “Where am I?” (e.g. Incidents > Detail #123). | High |
| **Global search** | Find incidents, actions, audits, documents, people by keyword or ID. | High |
| **Quick action: “Report Incident”** | Primary CTA; always visible. Opens form or wizard. | High |
| **Notifications** | Pending approvals, assigned actions, overdue items. Badge count. | High |
| **User avatar + menu** | Profile, role context, logout. Optional: role switcher for multi-role users. | Medium |

### 2.2 Global Search

- **Scope:** Incidents, Near misses, Actions/CAPAs, Audits (e.g. by plan or finding ID), Documents (optional), KPIs (optional).  
- **Behaviour:** Type-ahead with recent searches and suggestions; results grouped by type with link to detail.  
- **Shortcut:** e.g. `Ctrl+K` / `Cmd+K` for power users.  
- **Why:** Speeds up “find that incident” or “find my CAPA” without drilling through menus; supports audit and management queries.

### 2.3 Quick Actions

- **Primary:** “Report Incident” (or “Report” with dropdown: Incident, Near Miss, Hazard).  
- **Secondary (optional):** “New Inspection,” “New Action,” depending on role.  
- **Placement:** Prominent in navbar (e.g. contained button). Same action can be duplicated in sidebar.  
- **Why:** Fitts’s Law – high-frequency, high-importance action is easy to hit; reduces time to report.

### 2.4 Notifications & Approvals

- **Single bell** with dropdown:  
  - Pending approvals (e.g. documents, CAPAs, incidents if applicable).  
  - Assigned to me (actions, CAPAs).  
  - Overdue or due soon.  
- **Grouping:** By type and “Due” vs “Overdue.”  
- **Action:** Click → go to relevant record or approval screen.  
- **Why:** Central place for “what needs my attention” without opening each module.

### 2.5 User Profile & Role Switching

- **Profile:** Name, role, avatar; link to profile/settings.  
- **Role switching:** Only if one user can act in multiple roles (e.g. HSSE Manager + Auditor). Show current role; switch updates context and optionally visible modules.  
- **Why:** Clear “who I am” and “what I can do”; avoids confusion in audits.

---

## 3. Content Area Structure

### 3.1 HSSE Dashboard (Leading & Lagging Indicators)

**Goal:** Answer “How are we doing?” in under 30 seconds.

- **Top row:** 4–6 KPI cards (e.g. TRIR, LTIR, near misses, open actions, overdue actions, inspections done). Use traffic light or trend arrow where useful.  
- **Second row:** 2–3 charts:  
  - Incidents/near misses over time (line or bar).  
  - Incidents by type/area (bar or pie).  
  - Actions/CAPAs status (e.g. open vs closed, or by due date).  
- **Third row:** Short lists – e.g. “Recent incidents,” “Overdue actions,” “Upcoming inspections.” Each row 3–5 items + “View all” link.  
- **Drill-down:** Click KPI or chart segment → filtered list or detail.  
- **Avoid:** Too many charts on one screen; no single “primary” question.

**When to use:** Cards for KPIs and counts; charts for trends and distribution; tables for “recent/overdue” lists. Tabs only if you have clearly separate audiences (e.g. “Safety” vs “Environment”); otherwise one scrollable dashboard.

### 3.2 Incident & Near Miss Reporting

**Goal:** Minimal steps, clear required fields, mobile-friendly.

- **Form:** Wizard (3–4 steps) or single long form with clear sections. Prefer wizard for mobile.  
  - Step 1: What, when, where (type, date, location, severity).  
  - Step 2: Description, people involved, immediate actions.  
  - Step 3: Attachments, witnesses (optional).  
  - Step 4: Review and submit.  
- **Smart defaults:** Today’s date, user’s default site/department, common incident types as chips.  
- **Templates:** Optional “Quick report” (minimal fields) vs “Full report” for serious events.  
- **After submit:** Confirmation with reference number; link to “My reports” or new incident detail.  
- **Layout:** One column on mobile; two columns on desktop where it helps (e.g. location + type side by side).

**When to use:** Progressive disclosure (wizard) for field; optional “advanced” section for full form. No tabs inside the form; use steps.

### 3.3 Inspections, Audits, and Checklists

**Goal:** Run an inspection/audit and record results without confusion.

- **List view:** Table of inspection/audit plans or templates (name, type, frequency, last done, next due). Filters by status, area, assignee.  
- **Execution:**  
  - Checklist as a linear flow (one question/section at a time) or grouped by section with expand/collapse.  
  - Each item: Pass/Fail/NA + comment + optional photo.  
  - Progress indicator (e.g. 5/20).  
- **Summary:** At the end, summary of pass/fail and optional sign-off. Then redirect to record detail or list.  
- **Layout:** Checklist in main content; sidebar or sticky panel for “Summary” and “Add finding” if you generate findings from failures.

**When to use:** Tables for “list of plans/audits”; cards only for dashboard widgets. Use one linear flow for the checklist; avoid nested tabs during execution.

### 3.4 Objectives, Targets, KPIs, and Performance Tracking

**Goal:** Show alignment with objectives and trends.

- **Structure:**  
  - Level 1: Objectives (e.g. “Reduce TRIR”).  
  - Level 2: Targets/KPIs per objective (e.g. “TRIR &lt; 1.0”).  
  - Level 3: Actuals, trend, status (on track / off track).  
- **Views:**  
  - **Summary:** Cards or table: Objective → KPI → Current value → Trend → Status.  
  - **Detail:** One objective with its KPIs, history chart, and related actions.  
- **Drill-down:** KPI → source data (e.g. incidents) or period comparison.  
- **Layout:** Prefer cards for dashboard; table for full list with sort/filter. Charts for trend; one chart per KPI in detail view.

**When to use:** Summary view first; drill-down for “why.” Tabs only if you separate e.g. “Safety KPIs” vs “Environmental KPIs”; otherwise one scroll or filter.

### 3.5 Action Tracking and Closures

**Goal:** Clear list of what’s open, who owns it, when it’s due.

- **List:** Table with columns: ID, Title, Type (e.g. CAPA, inspection finding), Owner, Due date, Status, Source (e.g. incident/audit).  
- **Filters:** Mine / All, Status, Overdue, Department, Source. Default “Mine” for field; “All” for managers.  
- **Detail:** Full description, evidence, closure notes, sign-off.  
- **Closure flow:** Button “Complete” or “Close” → form (summary, evidence, date) → submit. Optional approval step for high-risk actions.  
- **Layout:** Table for list; detail as single column or two columns (main content + related incident/audit).

**When to use:** Table for list; cards only for dashboard “My actions” widget. No tabs inside action detail; use sections.

### 3.6 Cards vs Tables vs Charts – Quick Reference

| Need | Use |
|------|-----|
| Counts, single KPI, status | **Cards** |
| List of records (incidents, actions, audits) | **Tables** (sortable, filterable) |
| Trends over time | **Line/area chart** |
| Distribution (by type, area, status) | **Bar or pie** |
| Hierarchy (objective → KPI) | **Cards** or **table** with indentation |
| Checklist execution | **Linear list** with radio/buttons per item |

### 3.7 Tabs vs Progressive Disclosure

- **Tabs:** Use when there are 3–5 **parallel** views of the same entity (e.g. Incident detail: Overview | Timeline | Actions | Documents). Do not use tabs for sequential steps (use wizard steps instead).  
- **Progressive disclosure:** Use for “simple first, more on demand” (e.g. basic incident form with “Add more details” expanding optional fields). Reduces cognitive load for frequent reporters.

### 3.8 Drill-Down vs Summary

- **Dashboard:** Summary only (KPIs, one chart, short lists). Every number and segment is clickable → filtered list or detail.  
- **List pages:** Summary table; row click or “View” → detail.  
- **Detail:** Full record; links to related incidents, actions, audits.  
- **Rule:** No more than 3 clicks from dashboard to any single record (Dashboard → List → Detail).

---

## 4. Role-Based UX

### 4.1 Field Staff (Operational / Technicians)

**Goals:** Report fast, see own tasks, minimal training.

- **Sidebar:** Dashboard, Report Incident, My Actions, (optional) Inspections. Hide or de-emphasise Objectives, Audits, Compliance, Admin.  
- **Navbar:** Report Incident prominent; notifications for “Assigned to you.”  
- **Dashboard:** “Your actions” (overdue first), “Quick report” entry, maybe site-level summary.  
- **Forms:** Short wizards, smart defaults, optional fields collapsed.  
- **Device:** Mobile-friendly (large tap targets, one column, sticky submit).  
- **Language:** Short labels, tooltips for jargon.

### 4.2 Supervisors

**Goals:** Review and assign incidents/actions, run inspections, follow up.

- **Sidebar:** Everything field has + Incidents list, Inspections, (optional) Team actions.  
- **Navbar:** Same quick actions; notifications include “Pending your review.”  
- **Dashboard:** Team or area view: open incidents, open actions, inspection due.  
- **List views:** Filters by team/department; “Assign” and “Approve” in table or detail.  
- **Device:** Desktop-first but usable on tablet.

### 4.3 HSSE Managers

**Goals:** Analyse trends, ensure compliance, run audits, manage documents and CAPAs.

- **Sidebar:** Full set: Dashboard, Incidents, Actions, Inspections, Objectives & KPIs, Documents, Compliance, Risk, Audits, PPE, (optional) Admin.  
- **Navbar:** Global search and notifications (approvals, overdue).  
- **Dashboard:** Organisation-wide KPIs, trends, overdue actions, audit status.  
- **Views:** Drill-down from KPIs to incidents; audit planner and findings; compliance register and review.  
- **Reports:** Export (e.g. Excel/PDF) for incidents, actions, KPIs.

### 4.4 Senior Management

**Goals:** High-level view, management review, no operational clutter.

- **Sidebar:** Dashboard, Objectives & KPIs, Management Review, (optional) Incidents summary, Audits summary. Hide operational forms and detailed lists.  
- **Dashboard:** Strategic KPIs, trend charts, “RAG” status, summary of open actions and recent incidents.  
- **Management Review:** Structured view (agenda, inputs, outputs, decisions) with links to underlying data.  
- **Device:** Desktop; optional “Executive summary” PDF export.

---

## 5. UX Principles & Standards

### 5.1 Align with ISO 45001 (Plan–Do–Check–Act)

- **Plan:** Objectives, KPIs, risk assessments, compliance, document control → visible in “Governance” and “Performance.”  
- **Do:** Incidents, near misses, inspections, actions → “Operations” and quick “Report.”  
- **Check:** Audits, inspections, performance dashboards, management review → “Performance” and “Governance.”  
- **Act:** CAPAs, management review decisions, document updates → Actions and Documents.  
Navigation and dashboard should make PDCA visible (e.g. dashboard sections: Do → Check → Act).

### 5.2 Fitts’s Law & Minimal-Click Design

- **Report Incident:** One click from navbar or sidebar; minimal steps in form.  
- **“My Actions”:** One click; list is default.  
- **Dashboard → record:** Max 2–3 clicks (dashboard → list → detail).  
- **Large touch targets:** Buttons and key actions at least 44px; spacing between links.  
- **Primary action:** One clear primary button per screen (e.g. “Submit report,” “Close action”).

### 5.3 Progressive Disclosure

- **Forms:** Required fields first; “Additional details” or “Advanced” for optional.  
- **Dashboard:** Key KPIs first; “View trend” or “View all” for detail.  
- **Lists:** Default filters (e.g. “Open,” “Mine”); advanced filters in a panel.  
- **Avoid:** Long single-page forms; every option visible at once.

### 5.4 Consistency Across Modules

- **Same patterns:** List = table + filters + “View”/“Edit.” Detail = header + sections + actions.  
- **Terminology:** One term per concept (e.g. “Incident” vs “Near miss” defined; don’t mix “CAPA” and “Action” randomly).  
- **Actions:** “Save,” “Submit,” “Cancel” in the same order (e.g. Cancel left, primary right).  
- **Empty states:** Same style (“No X yet” + primary action to create).

### 5.5 Accessibility

- **Keyboard:** All actions reachable and focus visible; skip link to main content.  
- **Contrast:** Text and icons meet WCAG AA (e.g. 4.5:1 for normal text).  
- **Labels:** Every control has a visible or aria-label; errors linked to fields.  
- **Readability:** Font size and line height suitable for long forms and tables.  
- **Screen reader:** Headings hierarchy (h1 → h2 → h3); live region for success/error messages.

---

## 6. Performance & Efficiency

### 6.1 Reducing Steps for Frequent Tasks

| Task | Reduction |
|------|-----------|
| Report incident | Single entry point (navbar + sidebar); wizard ≤4 steps; defaults (date, location, reporter). |
| Check my actions | “My Actions” in sidebar; default filter “Open”; overdue highlighted. |
| Approve document/CAPA | Notifications → one click to item; approve/reject with optional comment. |
| Run inspection | “Inspections” → “Start” from list; checklist in one flow; auto-save. |
| View dashboard | Default route after login; KPIs and charts load in one request where possible. |

### 6.2 Smart Defaults & Templates

- **Incident:** Date = today; Location = user’s default site; Type = most used (e.g. “Injury,” “Near miss”).  
- **Action:** Assignee = reporter’s manager or HSSE; Due = +30 days for CAPA.  
- **Inspection:** Template by type/site; “Copy from last” option.  
- **Document:** Template by type (e.g. procedure, form); pre-filled metadata.

### 6.3 Dashboards That Answer in Under 30 Seconds

- **One sentence per dashboard:** e.g. “HSSE Dashboard = How are we doing on safety (KPIs + trends) and what needs attention (overdue, open)?”  
- **Above the fold:** 4–6 KPI cards + one main chart.  
- **No scrolling for “So what?”:** Key message and primary action visible without scroll.  
- **Drill-down:** One click from KPI or chart to underlying list or detail.

---

## 7. Common HSSE UX Mistakes to Avoid

| Mistake | Why it’s bad | How this design avoids it |
|--------|---------------|----------------------------|
| **Report incident buried in menus** | Delays reporting; under-reporting. | “Report Incident” in navbar + sidebar; one click. |
| **Too many items in sidebar** | Overwhelms field users; slow. | Role-based visibility; grouping; “My Actions” and Dashboard first. |
| **Dashboard with no clear question** | Wasted screen; no decision. | One primary question (e.g. “How are we doing?”); KPIs + one trend + short lists. |
| **Long single-page forms** | High cognitive load; mobile unfriendly. | Wizards; progressive disclosure; smart defaults. |
| **No “My” view** | Users can’t find their tasks. | “My Actions” and “My reports”; notifications for assigned. |
| **Jargon only** | Field doesn’t understand. | Clear labels; tooltips; optional “Report near miss” vs “Report incident.” |
| **No audit trail visibility** | Auditors ask “who changed what?” | Consistent “History” or “Activity” on key records; user and timestamp. |
| **Tabs for steps** | Users skip or get lost. | Wizard steps for forms; tabs only for parallel views of same entity. |
| **Tables with no filters** | Can’t find records in large lists. | Default filters (e.g. Open, Mine); filters and search on every list. |
| **No mobile support for reporting** | Incidents reported late or not at all. | Mobile-friendly report flow; large buttons; optional offline draft. |
| **Inconsistent terms** | Confusion and training cost. | One term per concept; glossary or help. |
| **Low contrast / small touch targets** | Accessibility and field use. | WCAG AA; 44px minimum for primary actions. |

---

## 8. Implementation Checklist (High Level)

- [ ] Sidebar: Implement groups (Operations, Performance, Governance, Resources, Admin) with expand/collapse and role-based visibility.  
- [ ] Navbar: Global search, “Report Incident,” notifications, user menu.  
- [ ] Dashboard: KPI cards + 1–2 charts + short lists; drill-down to list/detail.  
- [ ] Incident report: Wizard, defaults, mobile-friendly.  
- [ ] Actions/CAPAs: List with “Mine” default; filters; closure flow.  
- [ ] Inspections: List → execute checklist in one flow; progress and summary.  
- [ ] Objectives/KPIs: Summary view + detail with trend; link to source data.  
- [ ] Role-based: Four personas (field, supervisor, HSSE manager, management) with tailored sidebar and dashboard.  
- [ ] Accessibility: Keyboard, contrast, labels, focus, headings.  
- [ ] Performance: Lazy load below fold; one API where possible for dashboard.

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-27 | Principal UX/UI Designer | Initial recommendation |

This document is intended as the single source of UX direction for the HSSE & Performance Management application and should be updated as the product and ISO scope evolve.
