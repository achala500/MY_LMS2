## 2026-09-15 - DOM XSS via Unsanitized InnerHTML
**Vulnerability:** Untrusted member status data from Google Sheet API rendered via innerHTML in verify.html.
**Learning:** Even if data comes from internal/Google Sheets backend, rendering via innerHTML allows DOM XSS if string contains HTML/JS injection payloads.
**Prevention:** Construct elements safely using `createElement` and `createTextNode` or set `textContent` directly.
