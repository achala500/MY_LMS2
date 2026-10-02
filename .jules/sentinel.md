## 2025-05-18 - XSS in Autocomplete Highlighting
**Vulnerability:** DOM-based XSS in `highlightMatch` and school autocomplete rendering due to unescaped string injection into `innerHTML`.
**Learning:** Text highlighting functions that return HTML markup with `<mark>` tags must escape all input parameters (`text` and `query`) before building regex or returning HTML, because the return value is directly assigned to `innerHTML`.
**Prevention:** Always pass untrusted or user-supplied strings through `escapeHtml` before embedding them into raw HTML template literals or regex patterns used for `innerHTML` generation.
