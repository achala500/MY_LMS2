# Bolt Performance Learnings

## 2026-03-01: Redundant LocalStorage Parsing in Admin Forms
- **Issue:** `ApiClient.getAdminForms` iterated over all forms and invoked `localDb.getFormResponses(f.formId)` inside a loop. Since `getFormResponses` called `getItem(STORAGE_KEYS.FORM_RESPONSES)` and parsed JSON on every iteration, this caused an $O(N \cdot M)$ operation with redundant $O(N)$ LocalStorage accesses and JSON parsing calls.
- **Solution:** Added `localDb.getAllFormResponses()` to read and parse `STORAGE_KEYS.FORM_RESPONSES` once. Refactored `ApiClient.getAdminForms` to fetch all form responses in a single call and filter by active form IDs using a `Set`.
- **Impact:** Reduced average execution time of `getAdminForms` with 100 forms and 5000 responses from 502.358ms/call to 6.619ms/call (75.9x speedup, 98.7% time reduction).
