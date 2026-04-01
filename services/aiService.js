const OpenAI = require("openai");

let openai = null;

/**
 * OpenAI ni ishga tushirish
 */
const initAI = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("OPENAI_API_KEY topilmadi. AI xizmatlari ishlamaydi.");
    return null;
  }
  openai = new OpenAI({ apiKey });
  return openai;
};

/**
 * Kontent reja generatsiya qilish
 */
const generateContentPlan = async (topic) => {
  if (!openai) initAI();
  if (!openai)
    throw new Error("AI xizmati sozlanmagan. OPENAI_API_KEY ni tekshiring.");

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() + 1); // Ertadan boshlab

  const prompt = `Siz professional marketing mutaxassisiz. Quyidagi mavzu uchun O'zbek tilida 1 haftalik Telegram kanal uchun kontent reja tuzing.

Boshlanish sanasi: ${startDate.toISOString().split("T")[0]}

Har bir kun uchun batafsil post tayyorlang. Javobni FAQAT quyidagi JSON formatida qaytaring, boshqa hech narsa yozmang:

{
  "posts": [
    {
      "day": "Dushanba",
      "date": "2026-04-02",
      "time": "10:00",
      "title": "Post mavzusi",
      "type": "rasm",
      "content": "Telegram kanalga chiqariladigan to'liq post matni (emoji bilan, chiroyli formatlangan, 3-5 paragraf). Batafsil va qiziqarli bo'lsin.",
      "hashtags": ["#hashtag1", "#hashtag2"]
    }
  ]
}

MUHIM: 7 kun uchun 7 ta post bo'lsin. "content" maydoni Telegram kanalga to'g'ridan-to'g'ri chiqariladigan tayyor post bo'lishi kerak — chiroyli, batafsil, emoji bilan bezatilgan.
"type" qiymatlari: "rasm", "video", "reels", "story", "matn" dan biri.

Mavzu: ${topic}`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });
  return result.choices[0].message.content;
};

/**
 * Biznes-reja generatsiya qilish
 */
const generateBizPlan = async (formData) => {
  if (!openai) initAI();
  if (!openai)
    throw new Error("AI xizmati sozlanmagan. OPENAI_API_KEY ni tekshiring.");

  const prompt = `Professional biznes-reja tuzib bering. O'zbek tilida javob bering.
Soha: ${formData.industry}
Biznes turi: ${formData.type}
Hudud: ${formData.country}, ${formData.region}, ${formData.district}
Resurslar:
- Mablag': ${formData.budget}
- Jihozlar: ${formData.equipment}
- Jamoa: ${formData.team}

Iltimos, ushbu ma'lumotlar asosida O'zbekiston bozori uchun mukammal biznes-reja tuzing. Quyidagilarni kiriting:
1. Biznes Xulosasi
2. Bozor tahlili
3. SWOT tahlil
4. Marketing strategiyasi
5. Moliyaviy prognoz (1 yillik)
6. Xavflar va yechimlari
7. Bosqichma-bosqich reja`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });
  return result.choices[0].message.content;
};

/**
 * Biznes chat - suhbat orqali maslahat berish
 */
const bizChat = async (chatHistory, userMessage) => {
  if (!openai) initAI();
  if (!openai)
    throw new Error("AI xizmati sozlanmagan. OPENAI_API_KEY ni tekshiring.");

  const systemPrompt = `# SYSTEM PROMPT — BUSINESS COPILOT: Biznes Boshlash (AI Moliyaviy Maslahatchi)

Sen — O'zbek tilidagi professional AI moliyaviy maslahatchi. Sening vazifang foydalanuvchilarga biznes boshlash va rivojlantirish bo'yicha batafsil biznes-reja tuzishda yordam berishdir. Har doim o'zbek tilida javob ber.

## SENING ROLI:
Sen foydalanuvchi bilan suhbat orqali zarur ma'lumotlarni bosqichma-bosqich yig'asan va oxirida to'liq biznes-reja tuzib berasan.

## MUHIM QOIDALAR:
1. Har doim O'ZBEK TILIDA javob ber.
2. Samimiy va professional ohangda gapir.
3. Raqamlarni formatlashda vergul ishlat (masalan: 10,000,000 so'm).
4. Har bir javobda foydalanuvchini keyingi bosqichga yo'naltir.`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...chatHistory.map((msg) => ({
      role: msg.role === "model" ? "assistant" : "user",
      content: msg.text,
    })),
    { role: "user", content: userMessage },
  ];

  const result = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
  });
  return result.choices[0].message.content;
};

/**
 * Sayt konsepti generatsiya qilish
 */
const generateWebsiteConcept = async (description) => {
  if (!openai) initAI();
  if (!openai)
    throw new Error("AI xizmati sozlanmagan. OPENAI_API_KEY ni tekshiring.");

  const prompt = `Siz professional veb-dizayner va dasturchisiz. Foydalanuvchi uchun quyidagi tavsif asosida veb-sayt strukturasi, dizayn konsepti, kerakli sahifalar ro'yxati va texnologik stekni (tech stack) tavsiya qiling. Javobni O'zbek tilida, chiroyli formatlangan holda yozing.

Tavsif: ${description}

Quyidagilarni kiriting:
1. Sayt nomi va konsepti
2. Sahifalar ro'yxati (har bir sahifa tavsifi bilan)
3. Dizayn uslubi (ranglar, shriftlar, umumiy ko'rinish)
4. Texnologik stek (frontend, backend, hosting)
5. SEO tavsiyalari
6. Mobil versiya rejasi`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });
  return result.choices[0].message.content;
};

/**
 * Reklama kreativ yaratish (Telegram/Instagram Ads)
 */
const generateAds = async (description, platform) => {
  if (!openai) initAI();
  if (!openai)
    throw new Error("AI xizmati sozlanmagan. OPENAI_API_KEY ni tekshiring.");

  const platformName = platform === "tg" ? "Telegram Ads" : "Instagram Ads";
  const prompt = `Siz professional reklama mutaxassisisiz. Foydalanuvchi uchun ${platformName} uchun reklama kampaniyasi elementlarini yarating.

Mahsulot/Xizmat tavsifi: ${description}

Javobni quyidagi JSON formatida qaytaring (faqat JSON):
{
  "creative": "Reklama uchun vizual yoki matnli kreativ g'oyasi",
  "hooks": ["Hook 1", "Hook 2", "Hook 3"],
  "ctas": ["CTA 1", "CTA 2", "CTA 3"]
}

Javob O'zbek tilida bo'lishi shart.`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });
  return result.choices[0].message.content;
};

/**
 * Bozor tahlili
 */
const generateMarketAnalysis = async (businessIdea) => {
  if (!openai) initAI();
  if (!openai)
    throw new Error("AI xizmati sozlanmagan. OPENAI_API_KEY ni tekshiring.");

  const prompt = `Siz professional bozor tahlilchisisiz. Quyidagi biznes g'oyasi uchun O'zbekiston bozorida raqobatchilar tahlili, bozor hajmi va imkoniyatlar haqida batafsil ma'lumot bering.

Biznes g'oyasi: ${businessIdea}

Javobni O'zbek tilida, chiroyli formatlangan (Markdown) holda yozing.`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });
  return result.choices[0].message.content;
};

module.exports = {
  initAI,
  generateContentPlan,
  generateBizPlan,
  bizChat,
  generateWebsiteConcept,
  generateAds,
  generateMarketAnalysis,
};
