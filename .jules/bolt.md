## 2024-03-07 - [O(1) Map Lookups in Render Loops]
**Learning:** Found an anti-pattern in `PredictiveAnalytics.tsx` where `horses.find()` (O(N)) was being called inside `.map()` rendering loops for prediction arrays, resulting in O(N*M) time complexity during render.
**Action:** Replaced nested `.find()` calls with a pre-computed hash map created using `useMemo` based on `horses`. This drops the lookup from O(N) to O(1), improving render performance especially as data scales.
