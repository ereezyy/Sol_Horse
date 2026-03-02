# Performance Optimization Journal

## [2024-05-22] ⚡ Bolt: Caching calculateOdds in BettingPanel

### What
Memoized the horse odds calculation in `BettingPanel.tsx` using `React.useMemo` and replaced the non-deterministic `Math.random()` with a deterministic hash-based variance.

### Why
The original `calculateOdds` function used `Math.random()`, causing the odds to change on every re-render. This led to an inconsistent UI and unnecessary recalculations of potential payouts during the render cycle.

### Impact
- **UI Consistency**: Odds remain stable across re-renders for the same horse and race.
- **Efficiency**: Calculations are performed once per race/horse list update instead of on every render for every horse item.
- **Predictability**: Potential payouts now accurately reflect the displayed odds.

### Measurement
Manual verification shows that odds no longer flicker when selecting different horses or changing bet amounts (which trigger re-renders). Logic complexity reduced from O(N*R) to O(N) where N is number of horses and R is number of re-renders.
