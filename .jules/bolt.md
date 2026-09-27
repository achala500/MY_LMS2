# Bolt Performance Learnings

## Analytics & Data Engineering
- **Nested Array Iterations in Subject Calculations:** Functions like `calculateStudyRoi` iterate over stream subjects and nested logs/testMarks. Prefetching sums and counts into single-pass `Map<string, number>` aggregations reduces runtime complexity from $O(S \times (L + M))$ to $O(S + L + M)$, providing a ~2.15x speedup (~0.47 ms vs ~0.86-1.01 ms per invocation).
