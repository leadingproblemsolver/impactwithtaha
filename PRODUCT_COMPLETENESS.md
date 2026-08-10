# Product Common-Sense + Functional Completeness Mandate

Do not interpret checklists mechanically. Apply strong product, UX, and engineering judgment throughout the repository and fix obvious omissions a competent operator would immediately recognize.

## Governing principle
**Implement the product people reasonably believe they are being shown—not merely the smallest literal interpretation of the checklist.**

Use common sense aggressively for functional completeness, discoverability, continuity and conversion; use restraint aggressively for speculative features and polish.

## Required questions
1. If a feature exists, how would a user discover it?
2. If a user lands here directly, do they understand where they are and what to do?
3. If something looks clickable, does it actually work?
4. If an important artifact can be shared, does it have a stable direct URL?
5. If a workflow begins, is there a clear completion state?
6. If a user completes an action, do they know what happened next?
7. If a route is important, does direct navigation and refresh work?
8. If the product refers to another surface, is there an actual path to it?
9. If desktop works but mobile hides/confuses the primary action, is it really complete?
10. If an obvious expectation is unmet, can it be fixed cheaply and safely now?

## Fix now
- dead ends
- orphaned features
- missing links/direct routes
- non-shareable important surfaces
- broken back/forward/direct navigation
- misleading affordances
- missing success/error states
- hidden functionality
- mobile blockers
- unclear next actions
- obvious inconsistencies between UI promises and actual behavior

## Do not build merely because it could be nice
Do not add speculative dashboards, accounts, analytics, animations, broad redesigns, content pages, or integrations without a workflow need.

## Work-site acceptance
- Home explains the work in one screen.
- `/work`, `/execution`, `/proof-status`, `/method`, `/resume`, `/start`, and `/links` are stable direct URLs.
- Every selected project has a direct `/proof/<project>` route.
- Every proof route gives a return/continue action.
- Live GTM landing/demo/intake URLs are directly shareable.
- Proof gaps are explicit rather than hidden.
- Old portfolio proof URLs resolve into the new route system.
- Mobile navigation and primary CTAs remain usable.
- No user journey terminates accidentally.
