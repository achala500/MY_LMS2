## 2026-09-15 - DOM XSS in Public Member Verification Portal
**Vulnerability:** Unsanitized interpolation of `member.status` via `innerHTML` in `verify.html`.
**Learning:** Even simple string interpolation in HTML template strings assigned to `innerHTML` can lead to DOM XSS if any field from an external API payload is untrusted or modified.
**Prevention:** Avoid `innerHTML` when inserting dynamic external text. Use `document.createElement` and `document.createTextNode` (or `element.textContent`) to ensure dynamic content is strictly rendered as text.
