# Fix pack loading + open browsing, gated submitting

## 1. Bug: packs only appear after clicking a filter

The filtered list is computed from search and filter state only, so it is built once while the packs are still loading and never rebuilt when the data arrives. Clicking a filter forces a recompute, which is why the packs suddenly appear.

Fix: include the loaded packs in that computation's dependencies so the list updates as soon as the data arrives. The difficulty and type filter chips get the same treatment so they also fill in on first load.

There are 7 approved packs in the database, so the grid should show all 7 immediately on page load.

## 2. Browsing without an account, account needed to submit

Browsing stays fully open: approved packs are already publicly readable, and star ratings and average scores remain visible to everyone.

Submitting keeps requiring sign-in (it already does), and the experience gets clearer:
- The "Submit Your Pack" button stays visible to visitors, but shows a short "Sign in to submit a pack" message and sends them to the sign-in page instead of silently failing.
- Signed-out visitors see stars as read-only with a tooltip-style hint that rating needs an account.

## Technical notes

- `src/pages/Index.tsx`: add `trainingPacks` to the `useMemo` dependency arrays for `filteredPacks` (and confirm `difficulties`/`types`).
- `src/components/SubmitPackDialog.tsx`: keep the auth gate but track session via `onAuthStateChange` so the sign-in state is current, not only on mount.
- `src/components/PackRating.tsx`: include `userId` in the query key so a user's own rating loads after sign-in.
- No database or policy changes needed.
