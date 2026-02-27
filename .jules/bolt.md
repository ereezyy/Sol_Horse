## 2024-03-24 - [Avoid `useEffect` for derived state]
**Learning:** Found an anti-pattern in `BreedingCenter.tsx` where derived data (`availableStuds`) was calculated inside a `useEffect` and saved to state. This causes double rendering when the source state (`horses` or `player`) changes.
**Action:** Use `useMemo` for derived data instead of `useEffect` + `useState`. It's faster and avoids rendering twice.
