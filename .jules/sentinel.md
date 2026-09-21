## 2026-09-21 - Control Character Protocol Bypass & Unsanitized Modal Link Href

**Vulnerability:**
User-supplied proof URLs (`proofUrl` / `proofPhotoUrl`) rendered in `PhotoProofModal.tsx` were bound directly to `<a href={proofUrl}>` without passing through `sanitizeUrl`. Additionally, `sanitizeUrl` relied on raw regex matching that could be bypassed using control characters or whitespace in schemes (e.g. `java\tscript:` or `javascript :`).

**Learning:**
Browsers strip ASCII control characters and whitespace from scheme strings when evaluating `href` navigations, but standard regex matchers like `^([a-zA-Z0-9+.-]+):` fail to match if whitespace/control chars exist before the colon. Strip control characters prior to scheme extraction. Also ensure all modal `<a>` tags and image stream resolvers sanitize URLs.

**Prevention:**
Always normalize input URLs by stripping control characters and whitespace before protocol evaluation, and ensure all user-supplied link targets (`href`) go through `sanitizeUrl` or `getDisplayableImageUrl`.
