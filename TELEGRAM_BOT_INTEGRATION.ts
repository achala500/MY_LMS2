/**
 * TELEGRAM BOT INTEGRATION
 * 
 * Features:
 * - 1-tap account linking via verification token
 * - Daily streak reminder @ 20:00 Asia/Colombo
 * - Streak freeze burn-down alerts
 * - Leaderboard position updates
 */

import { Telegraf, Context } from 'telegraf';
import crypto from 'crypto';

interface TelegramConfig {
  botToken: string;
  webhookUrl: string;
  db: any;
}

export class TelegramBotService {
  private bot: Telegraf;
  private db: any;

  constructor(config: TelegramConfig) {
    this.bot = new Telegraf(config.botToken);
    this.db = config.db;

    // ====================================================================
    // 1. START COMMAND: Show linking instructions
    // ====================================================================
    this.bot.start(async (ctx) => {
      const telegramUserId = ctx.from.id;
      const telegramUsername = ctx.from.username || 'unknown';

      // Check if already linked
      const linked = await this.db
        .prepare('SELECT student_id FROM telegram_sessions WHERE telegram_user_id = ?')
        .bind(telegramUserId)
        .first();

      if (linked) {
        return ctx.reply(
          '✅ Your account is already linked to StudySync!\n\nUse /stats to check your streak and leaderboard position.',
          {
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [{ text: '📊 View Stats', callback_data: 'stats' }],
                [{ text: '🔄 View Leaderboard', callback_data: 'leaderboard' }],
              ],
            },
          }
        );
      }

      // Generate verification token (6-digit code, 15 min validity)
      const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await this.db
        .prepare(`
          INSERT INTO telegram_sessions 
          (telegram_user_id, telegram_username, verification_token, created_at)
          VALUES (?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(telegram_user_id) DO UPDATE SET
            verification_token = excluded.verification_token,
            created_at = CURRENT_TIMESTAMP
        `)
        .bind(telegramUserId, telegramUsername, verificationToken)
        .run();

      return ctx.reply(
        `🔗 <b>Link Your StudySync Account</b>\n\n` +
          `Your verification code is: <code>${verificationToken}</code>\n\n` +
          `⏱️ Valid for 15 minutes\n\n` +
          `Open StudySync app → Settings → Telegram Linking → Paste the code above`,
        {
          parse_mode: 'HTML',
        }
      );
    });

    // ====================================================================
    // 2. /stats COMMAND: Show student's current metrics
    // ====================================================================
    this.bot.command('stats', async (ctx) => {
      const telegramUserId = ctx.from.id;

      const session = await this.db
        .prepare(`
          SELECT s.study_id, s.full_name, s.school, m.current_streak, m.rolling_7day_hours
          FROM telegram_sessions ts
          JOIN students s ON ts.student_id = s.id
          JOIN student_metrics m ON s.id = m.student_id
          WHERE ts.telegram_user_id = ?
        `)
        .bind(telegramUserId)
        .first();

      if (!session) {
        return ctx.reply('❌ Your account is not linked. Use /start to link your StudySync account.');
      }

      const message =
        `📚 <b>${session.full_name}</b>\n` +
        `🏫 ${session.school}\n\n` +
        `🔥 Current Streak: <b>${session.current_streak} days</b>\n` +
        `📊 7-Day Average: <b>${session.rolling_7day_hours.toFixed(1)} hours/day</b>\n\n` +
        `Study ID: <code>${session.study_id}</code>`;

      return ctx.reply(message, { parse_mode: 'HTML' });
    });

    // ====================================================================
    // 3. /leaderboard COMMAND: Show current rank + top 5
    // ====================================================================
    this.bot.command('leaderboard', async (ctx) => {
      const telegramUserId = ctx.from.id;

      const student = await this.db
        .prepare(`
          SELECT s.stream, s.study_id
          FROM telegram_sessions ts
          JOIN students s ON ts.student_id = s.id
          WHERE ts.telegram_user_id = ?
        `)
        .bind(telegramUserId)
        .first();

      if (!student) {
        return ctx.reply('❌ Your account is not linked.');
      }

      // Get stream leaderboard
      const leaderboardSnap = await this.db
        .prepare(`
          SELECT rankings FROM leaderboard_snapshot
          WHERE scope = 'stream' AND scope_value = ?
        `)
        .bind(student.stream)
        .first<{ rankings: string }>();

      if (!leaderboardSnap) {
        return ctx.reply('⏳ Leaderboard is being refreshed. Try again in a moment.');
      }

      const rankings = JSON.parse(leaderboardSnap.rankings);

      // Find student's rank
      const studentRank = rankings.find((r: any) => r.study_id === student.study_id);
      const top5 = rankings.slice(0, 5);

      let message = `🏆 <b>${student.stream} Stream Leaderboard</b>\n\n`;

      // Top 5
      for (const entry of top5) {
        const medal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉';
        message += `${medal} #${entry.rank} ${entry.full_name} (${entry.current_streak}🔥)\n`;
      }

      message += '\n';

      if (studentRank) {
        message +=
          `📍 <b>Your Position:</b> #${studentRank.rank}\n` +
          `🔥 Streak: ${studentRank.current_streak} days\n` +
          `📊 7-Day Avg: ${studentRank.rolling_7day_hours.toFixed(1)} hrs/day`;
      } else {
        message += `📍 You're not in the top 100 yet. Keep studying! 💪`;
      }

      return ctx.reply(message, { parse_mode: 'HTML' });
    });

    // ====================================================================
    // 4. CALLBACK HANDLERS
    // ====================================================================
    this.bot.action('stats', (ctx) => {
      ctx.answerCbQuery('Fetching stats...');
      return ctx.scene.enter('stats');
    });

    this.bot.action('leaderboard', (ctx) => {
      ctx.answerCbQuery('Fetching leaderboard...');
      return this.bot.command('leaderboard')(ctx as any);
    });
  }

  // ========================================================================
  // SCHEDULED REMINDER: Daily streak check-in @ 20:00 Asia/Colombo
  // ========================================================================

  async sendDailyReminders(): Promise<void> {
    const allSessions = await this.db
      .prepare(`
        SELECT ts.telegram_user_id, s.study_id, s.full_name, m.current_streak, 
               COALESCE(m.available_freeze_tokens, 0) as freeze_tokens
        FROM telegram_sessions ts
        JOIN students s ON ts.student_id = s.id
        JOIN student_metrics m ON s.id = m.student_id
        WHERE ts.verified = TRUE AND s.status = 'Active'
      `)
      .all();

    if (!allSessions.success || !allSessions.results) {
      console.error('[Telegram Reminders] Failed to fetch sessions');
      return;
    }

    const colomboNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo' }));
    const hoursUntilDeadline = 24 - colomboNow.getHours() + 4; // 04:00 AM cutoff

    for (const session of allSessions.results as any[]) {
      let message = `📚 <b>StudySync Daily Check-In</b>\n\n`;
      message += `Hi ${session.full_name}! ⏰ You have <b>${hoursUntilDeadline} hours</b> before the 04:00 AM streak cutoff.\n\n`;

      if (session.current_streak > 0) {
        message += `🔥 Current Streak: <b>${session.current_streak} days</b>\n`;
      }

      if (session.freeze_tokens > 0) {
        message += `❄️ Freeze Tokens Available: <b>${session.freeze_tokens}</b>\n`;
      } else {
        message += `⚠️ <b>No freeze tokens remaining!</b> Every day counts.\n`;
      }

      message +=
        `\n📖 Keep studying and maintain your streak!\n` +
        `Use /stats to check your progress.`;

      try {
        await this.bot.telegram.sendMessage(session.telegram_user_id, message, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[{ text: '📊 View Stats', callback_data: 'stats' }]],
          },
        });
      } catch (error) {
        console.error(`[Telegram] Failed to send reminder to ${session.telegram_user_id}:`, error);
      }
    }
  }

  // ========================================================================
  // STREAK BURN-DOWN ALERT (When streak is lost)
  // ========================================================================

  async sendStreakBurndownAlert(studentId: string): Promise<void> {
    const session = await this.db
      .prepare(`
        SELECT ts.telegram_user_id, s.full_name FROM telegram_sessions ts
        JOIN students s ON ts.student_id = s.id
        WHERE ts.student_id = ? AND ts.verified = TRUE
      `)
      .bind(studentId)
      .first();

    if (!session) return;

    const message =
      `😔 <b>Streak Ended</b>\n\n` +
      `Hi ${session.full_name}, your study streak has ended.\n\n` +
      `But don't worry! Every expert was once a beginner. 💪\n\n` +
      `Start fresh today and build a new streak!\n` +
      `Use /stats to track your progress.`;

    try {
      await this.bot.telegram.sendMessage(session.telegram_user_id, message, {
        parse_mode: 'HTML',
      });
    } catch (error) {
      console.error(`[Telegram] Failed to send burndown alert:`, error);
    }
  }

  // ========================================================================
  // START BOT WEBHOOK
  // ========================================================================

  async start(webhookUrl: string): Promise<void> {
    await this.bot.launch({
      webhook: {
        domain: webhookUrl,
        hookPath: '/telegram/webhook',
        port: 3000,
      },
    });

    console.log('[Telegram Bot] Started on webhook:', webhookUrl);
  }

  // ========================================================================
  // VERIFY TELEGRAM SESSION (Called from app backend)
  // ========================================================================

  async verifyTelegramSession(studentId: string, verificationToken: string): Promise<boolean> {
    const session = await this.db
      .prepare(`
        SELECT id, telegram_user_id FROM telegram_sessions 
        WHERE verification_token = ? 
        AND created_at > datetime('now', '-15 minutes')
      `)
      .bind(verificationToken)
      .first();

    if (!session) {
      return false; // Token expired or invalid
    }

    // Link student to telegram session
    const result = await this.db
      .prepare(`
        UPDATE telegram_sessions
        SET student_id = ?, verified = TRUE, linked_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(studentId, session.id)
      .run();

    if (result.success) {
      // Send confirmation message to Telegram
      try {
        const student = await this.db
          .prepare('SELECT full_name FROM students WHERE id = ?')
          .bind(studentId)
          .first();

        await this.bot.telegram.sendMessage(
          session.telegram_user_id,
          `✅ <b>Account Linked Successfully!</b>\n\n` +
            `Welcome ${student.full_name}!\n\n` +
            `You'll now receive daily reminders and can check your stats anytime.\n\n` +
            `Use /stats or /leaderboard to get started!`,
          { parse_mode: 'HTML' }
        );
      } catch (error) {
        console.error('[Telegram] Failed to send confirmation:', error);
      }

      return true;
    }

    return false;
  }
}

// ============================================================================
// EXPORT FOR CRON SCHEDULER
// ============================================================================
export async function scheduleTelegramReminders(botService: TelegramBotService) {
  // Run daily at 20:00 Asia/Colombo
  const now = new Date();
  const colomboTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Colombo' }));

  const targetHour = 20;
  const timeUntilTarget = calculateTimeUntilNextOccurrence(colomboTime, targetHour);

  setTimeout(() => {
    botService.sendDailyReminders();
    // Then repeat every 24 hours
    setInterval(() => botService.sendDailyReminders(), 24 * 60 * 60 * 1000);
  }, timeUntilTarget);
}

function calculateTimeUntilNextOccurrence(now: Date, targetHour: number): number {
  const next = new Date(now);
  next.setHours(targetHour, 0, 0, 0);

  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  return next.getTime() - now.getTime();
}
