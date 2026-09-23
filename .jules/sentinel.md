## 2026-03-30 - DOM XSS via Unsanitized Autocomplete & Search Highlighting Inputs
**Vulnerability:** User queries and custom school input in `initSchoolAutocomplete` and `highlightMatch` were interpolated directly into `innerHTML` strings without HTML escaping. An attacker typing `<img src=x onerror=alert(1)>` or search strings containing HTML tags could trigger DOM XSS execution.
**Learning:** Functions that generate HTML snippets with `<mark>` tags or UI options must always HTML-escape raw text inputs before regex replacement or string template interpolation into `innerHTML`.
**Prevention:** Always wrap user-controlled text in HTML entity escaping (`escapeHtml`) when building dynamic HTML markup for client-side rendering.
