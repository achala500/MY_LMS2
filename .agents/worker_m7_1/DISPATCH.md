## 2026-08-27T02:02:00Z
You are a Worker for StudySync Milestone M7 (Telegram Bot & Real-Time Sync Engine).

Read:
1. `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\ORIGINAL_REQUEST.md` (specifically the section under `## 2026-08-27T01:47:05Z`)
2. `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\PROJECT.md`
3. `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\explorer_telegram_1\handoff.md`

Your Task:
Implement the complete Telegram Bot Webhook and Real-Time Sync system:
1. Backend & Mock Server (`backend/Code.gs` and `server/mock-server.js`):
   - Action `telegramWebhook`: parse inbound Telegram updates and handle commands:
     - `/start [STUDY_ID]`: Links Telegram account (`@username` or chat ID) to student record, confirms identity, returns welcome card.
     - `/status [STUDY_ID]`: Resolves member stats, returns active streak 🔥, total hours, today's submission status, subject breakdown, and AI recommendation snippet.
     - `/log <h1..3> [notes]`: Submits daily study hours for student's 3 registered stream subjects with LockService concurrency protection, updates streak, returns formatted receipt.
     - `/leaderboard [bio|maths|all]`: Computes leaderboard, returns top 10 ranked by active streak & total hours with medals.
     - `/remind`: Returns accountability reminder based on today's submission status.
   - Helper functions: `normalizeTelegramUsername(handle)` (handles `@`, `t.me/`, whitespace, lowercasing), `findMemberByTelegram(sheet, handle)`, `sendTelegramMessage(chatId, text, parseMode)`.
   - Action `broadcastDailyDigest`: Protected admin action and trigger that generates clean markdown summaries (Community Pulse, Participation %, Stream split, Top 5-10 Streak Leaders, Daily MVPs, Streak Alerts).
2. Frontend API & Utilities:
   - `src/types/api.ts`: Add `TelegramWebhookPayload`, `TelegramWebhookResponseData`, `BroadcastDailyDigestPayload`, `BroadcastDailyDigestResponseData`, and update `ApiAction` union.
   - `src/lib/api.ts`: Implement `telegramWebhook` and `broadcastDailyDigest` methods on `ApiClient`.
   - `src/lib/utils.ts`: Implement `normalizeTelegramUsername`, `isValidTelegramHandle`, `formatTelegramDigest`.
   - `tests/test-harness.js`: Add support for `telegramWebhook` and `broadcastDailyDigest` in `StudySyncDatabase` mock.

Files owned exclusively:
- `backend/Code.gs`
- `server/mock-server.js`
- `src/types/api.ts`
- `src/lib/api.ts`
- `src/lib/utils.ts`
- `tests/test-harness.js`

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Run tests to verify your implementation before delivering handoff.md. Write a structured handoff report detailing files modified, test commands run, and verification results.
