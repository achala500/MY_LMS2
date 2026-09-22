## 2026-03-31 - DOM XSS in Autocomplete innerHTML Rendering
**Vulnerability:** User-controlled search query and school names were directly inserted into dropdown `innerHTML` and `highlightMatch` markup without prior HTML entity escaping, creating a DOM-based XSS risk.
**Learning:** Functions that generate HTML strings with `<mark>` tags or template literals for DOM insertion via `innerHTML` must always sanitize or escape dynamic text arguments first.
**Prevention:** Always HTML-escape dynamic variables before interpolating them into HTML markup templates or passing them to string manipulation functions used in DOM `innerHTML` contexts.
