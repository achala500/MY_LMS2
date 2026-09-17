# Scope: Milestone M4 — Stream-Aware Daily Study Form & Photo Uploads

## Architecture & Scope
Implement the stream-aware Daily Study Form component (`src/js/views/dailyFormView.js`), enforcing exact 3-subject dynamic rendering, decimal study hours input with quick buttons, custom 1-10 dual gradient sliders for focus and productivity on each subject, notes reflection, client-side Canvas image compression (<400KB base64), Google Drive / mock server upload integration, and one-submission-per-day lock (switching into read-only summary mode if submitted today).

## Deliverables
- `src/js/views/dailyFormView.js`: Stream-Aware Daily Study Form component:
  - Dynamic resolution of 3 subjects based on student's registered stream and optional subject.
  - Per-subject cards with decimal hours inputs (`0.25`, `0.5`, `1.5`, `3.0`), quick-add buttons (`+30m`, `+1h`, `+2h`).
  - Integrated `CustomSlider` dual-sliders for focus (1-10) and productivity (1-10) with dynamic gradient fill and qualitative badges.
  - Date selector defaulting to today's date (`YYYY-MM-DD`), blocking future dates.
  - Read-only auto-filled student ID, full name, and Google email.
  - Telegram handle pre-filled from profile (editable).
  - Notes & reflection textarea (optional).
  - Photo Proof file uploader with drag-and-drop, image preview thumbnail, remove button, and Canvas image compression.
  - Submission handler sending payload to `ApiClient.submitDailyLog()` with LockService duplicate prevention.
  - Read-Only Mode rendering if already submitted for selected date: displays locked values, disabled sliders, photo thumbnail, and informative status card.
- Integration in `src/js/app.js` connecting the `#daily` route.
- `tests/m4-verification.test.js`: Unit & integration tests verifying stream resolution, slider integration, duplicate lockouts, photo compression, and view lifecycle.

## Rules & Quality Criteria
- Zero `alert()` calls (use `Toast`).
- Strictly 3 stream subjects rendered in DOM.
- Prevent duplicate submissions per day.
