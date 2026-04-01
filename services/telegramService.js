const { Telegraf } = require("telegraf");
const cron = require("node-cron");
const ContentPlan = require("../models/ContentPlan");

let bot = null;

/**
 * Telegram botni ishga tushirish
 */
const initTelegramBot = () => {
  const token = process.env.BOT_TOKEN;
  if (!token) {
    console.warn("⚠️ BOT_TOKEN topilmadi. Telegram xizmati ishlamaydi.");
    return null;
  }

  bot = new Telegraf(token);

  // /start komandasi
  bot.start((ctx) => {
    ctx.reply(
      "🤖 BUSINESS COPILOT Bot ishga tushdi!\n\n" +
        "Bu bot kontent rejangizni avtomatik ravishda kanalga joylashtiradi.\n\n" +
        "📢 Kanalga qo'shish uchun:\n" +
        "1. Botni kanalingizga admin qilib qo'shing\n" +
        "2. Kanal ID ni platformaga kiriting\n\n" +
        "Kanal ID ni olish uchun botni kanalingizga qo'shib, /getchannel buyrug'ini yuboring.",
    );
  });

  // Kanal ID ni olish
  bot.command("getchannel", (ctx) => {
    const chatId = ctx.chat.id;
    ctx.reply(
      `📌 Bu chatning ID si: ${chatId}\n\nAgar bu kanal bo'lsa, shu ID ni platformaga kiriting.`,
    );
  });

  // Bot ishga tushirish (polling)
  bot
    .launch({ dropPendingUpdates: true })
    .then(() => {
      console.log("🤖 Telegram Bot ishga tushdi");
    })
    .catch((err) => {
      console.error("Telegram Bot xatosi:", err.message);
    });

  // Graceful stop
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));

  return bot;
};

/**
 * Telegram kanalga xabar yuborish
 */
const sendToChannel = async (channelId, text) => {
  if (!bot) {
    throw new Error("Telegram bot ishga tushmagan");
  }

  try {
    const result = await bot.telegram.sendMessage(channelId, text, {
      parse_mode: "HTML",
      disable_web_page_preview: false,
    });
    return result;
  } catch (error) {
    console.error(`Telegram yuborish xatosi (${channelId}):`, error.message);
    throw error;
  }
};

/**
 * Postni formatlash (Telegram uchun HTML)
 */
const formatPostForTelegram = (post) => {
  let message = "";

  if (post.title) {
    message += `<b>📌 ${post.title}</b>\n\n`;
  }

  message += post.content;

  if (post.hashtags && post.hashtags.length > 0) {
    message += `\n\n${post.hashtags.join(" ")}`;
  }

  message += `\n\n🤖 <i>BUSINESS COPILOT orqali avtomatik joylashtirildi</i>`;

  return message;
};

/**
 * Rejalashtirilgan postlarni tekshirish va yuborish (har daqiqa)
 */
const startScheduler = () => {
  // Har daqiqada tekshirish
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const currentDate = now.toISOString().split("T")[0]; // "2026-04-02"
      const currentTime =
        String(now.getHours()).padStart(2, "0") +
        ":" +
        String(now.getMinutes()).padStart(2, "0"); // "10:00"

      // Approved planlardan scheduled postlarni top
      const plans = await ContentPlan.find({
        status: "approved",
        "scheduledPosts.status": "scheduled",
      });

      for (const plan of plans) {
        if (!plan.telegramChannelId) continue;

        for (const post of plan.scheduledPosts) {
          if (post.status !== "scheduled") continue;
          if (post.date !== currentDate) continue;
          if (post.time !== currentTime) continue;

          // Vaqti keldi — yuborish
          try {
            const text = formatPostForTelegram(post);
            const result = await sendToChannel(plan.telegramChannelId, text);

            post.status = "sent";
            post.telegramMessageId = result.message_id;
            post.sentAt = new Date();

            console.log(
              `✅ Post yuborildi: "${post.title}" -> ${plan.telegramChannelId}`,
            );
          } catch (error) {
            post.status = "failed";
            post.error = error.message;

            console.error(
              `❌ Post yuborilmadi: "${post.title}" -> ${error.message}`,
            );
          }
        }

        // Barcha postlar yuborilganmi?
        const allSent = plan.scheduledPosts.every(
          (p) => p.status === "sent" || p.status === "failed",
        );
        if (allSent) {
          plan.status = "completed";
        }

        await plan.save();
      }
    } catch (error) {
      console.error("Scheduler xatosi:", error.message);
    }
  });

  console.log("⏰ Post scheduler ishga tushdi (har daqiqa tekshiriladi)");
};

module.exports = {
  initTelegramBot,
  sendToChannel,
  formatPostForTelegram,
  startScheduler,
};
