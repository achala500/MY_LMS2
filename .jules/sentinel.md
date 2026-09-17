## 2026-09-15 - Prevent DOM XSS in Member Verification Status Rendering
**Vulnerability:** DOM XSS due to direct `innerHTML` interpolation of API data (`member.status`) in `verify.html`.
**Learning:** Even simple UI elements with status strings should avoid `innerHTML` string interpolation when rendering external API content.
**Prevention:** Always use safe DOM manipulation methods (`document.createElement` and `document.createTextNode` or `textContent`) when inserting data retrieved from external sources.
