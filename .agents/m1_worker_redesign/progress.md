# Progress: m1_worker_redesign

**Last visited**: 2026-09-12T05:20:00Z  
**Status**: In Progress  

## Tasks Checklist
- [ ] 1. Update `src/app/globals.css` with authoritative tokens for :root and .dark, removing legacy indigo and rainbow variables.
- [ ] 2. Update `tailwind.config.ts` if needed to match tokens and radius.
- [ ] 3. Update `src/components/ui/card.tsx` to be flat and opaque (rounded-xl, bg-white dark:bg-[#17191D], border-border, no backdrop-blur).
- [ ] 4. Remove `backdrop-blur-*` from `table.tsx`, form inputs, and AI analytics widgets.
- [ ] 5. Replace `font-serif` on buttons and labels with `font-sans` in `daily/page.tsx`, `tests/page.tsx`, `register/page.tsx`, and `calendar/GoogleStudyCalendar.tsx`.
- [ ] 6. Confirm top nav bar in `Header.tsx` is mounted and styled with scoped Liquid Glass chrome.
- [ ] 7. Verification: `npm test` (423/423), `node tests/e2e-runner.js` (469/469), `npm run build`.
- [ ] 8. Final 5-component `handoff.md` and completion message.
