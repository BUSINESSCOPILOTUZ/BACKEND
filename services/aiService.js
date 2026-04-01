const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI = null;

/**
 * Gemini AI ni ishga tushirish
 */
const initAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY topilmadi. AI xizmatlari ishlamaydi.");
    return null;
  }
  genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
};

/**
 * Kontent reja generatsiya qilish
 */
const generateContentPlan = async (topic) => {
  if (!genAI) initAI();
  if (!genAI)
    throw new Error("AI xizmati sozlanmagan. GEMINI_API_KEY ni tekshiring.");

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Siz professional marketing mutaxassisiz. Quyidagi mavzu uchun O'zbek tilida 1 haftalik ijtimoiy tarmoqlar (Telegram, Instagram) uchun kontent reja tuzing. Har bir kun uchun:
1. Post mavzusi
2. Post turi (rasm, video, reels, story)
3. Vaqti
4. Teglar (hashtag)

Faqat rejaning o'zini qaytaring: ${topic}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

/**
 * Biznes-reja generatsiya qilish
 */
const generateBizPlan = async (formData) => {
  if (!genAI) initAI();
  if (!genAI)
    throw new Error("AI xizmati sozlanmagan. GEMINI_API_KEY ni tekshiring.");

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

/**
 * Biznes chat - suhbat orqali maslahat berish
 */
const bizChat = async (chatHistory, userMessage) => {
  if (!genAI) initAI();
  if (!genAI)
    throw new Error("AI xizmati sozlanmagan. GEMINI_API_KEY ni tekshiring.");

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const systemPrompt = `# SYSTEM PROMPT — BUSINESS COPILOT: Biznes Boshlash (AI Moliyaviy Maslahatchi)

Sen — O'zbek tilidagi professional AI moliyaviy maslahatchi. Sening vazifang foydalanuvchilarga biznes boshlash va rivojlantirish bo'yicha batafsil biznes-reja tuzishda yordam berishdir. Har doim o'zbek tilida javob ber.

## SENING ROLI:
Sen foydalanuvchi bilan suhbat orqali zarur ma'lumotlarni bosqichma-bosqich yig'asan va oxirida to'liq biznes-reja tuzib berasan.

## MUHIM QOIDALAR:
1. Har doim O'ZBEK TILIDA javob ber.
2. Samimiy va professional ohangda gapir.
3. Raqamlarni formatlashda vergul ishlat (masalan: 10,000,000 so'm).
4. Har bir javobda foydalanuvchini keyingi bosqichga yo'naltir.`;

  const chat = model.startChat({
    history: [
      { role: "user", parts: [{ text: systemPrompt }] },
      {
        role: "model",
        parts: [
          {
            text: "Tushundim. Men O'zbek tilidagi professional AI moliyaviy maslahatchi sifatida yordam berishga tayyorman.",
          },
        ],
      },
      ...chatHistory.map((msg) => ({
        role: msg.role === "model" ? "model" : "user",
        parts: [{ text: msg.text }],
      })),
    ],
  });

  const result = await chat.sendMessage(userMessage);
  const response = await result.response;
  return response.text();
};

/**
 * Sayt konsepti generatsiya qilish
 */
const generateWebsiteConcept = async (description) => {
  if (!genAI) initAI();
  if (!genAI)
    throw new Error("AI xizmati sozlanmagan. GEMINI_API_KEY ni tekshiring.");

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Siz professional veb-dizayner va dasturchisiz. Foydalanuvchi uchun quyidagi tavsif asosida veb-sayt strukturasi, dizayn konsepti, kerakli sahifalar ro'yxati va texnologik stekni (tech stack) tavsiya qiling. Javobni O'zbek tilida, chiroyli formatlangan holda yozing.

Tavsif: ${description}

Quyidagilarni kiriting:
1. Sayt nomi va konsepti
2. Sahifalar ro'yxati (har bir sahifa tavsifi bilan)
3. Dizayn uslubi (ranglar, shriftlar, umumiy ko'rinish)
4. Texnologik stek (frontend, backend, hosting)
5. SEO tavsiyalari
6. Mobil versiya rejasi`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

module.exports = {
  initAI,
  generateContentPlan,
  generateBizPlan,
  bizChat,
  generateWebsiteConcept,
};
