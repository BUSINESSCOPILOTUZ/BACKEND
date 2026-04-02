/**
 * Passport.js — Google OAuth 2.0 Strategiyasi
 *
 * Bu fayl Google OAuth 2.0 orqali foydalanuvchilarni autentifikatsiya qiladi.
 * Foydalanuvchi Google bilan kirganida:
 *   1. Google profilidan ma'lumotlar olinadi (id, ism, email, rasm)
 *   2. MongoDB da foydalanuvchi qidiriladi (googleId yoki email bo'yicha)
 *   3. Agar topilmasa — yangi foydalanuvchi yaratiladi
 *   4. Agar topilsa — mavjud foydalanuvchi yangilanadi
 */

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

// Passport'ni sozlash funksiyasi
const configurePassport = () => {
  /**
   * Google OAuth 2.0 Strategy
   *
   * GOOGLE_CLIENT_ID va GOOGLE_CLIENT_SECRET — Google Cloud Console'dan olinadi
   * callbackURL — Google foydalanuvchini autorizatsiyadan keyin shu manzilga qaytaradi
   */
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        // Production callback URL — Google Cloud Console'da ham shu manzil qo'shilishi kerak
        callbackURL: `${process.env.BACKEND_URL || "https://apibusinesscopilot.masatov.uz"}/api/auth/google/callback`,
        // Google'dan email va profil ma'lumotlarini so'rash
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // 1. Google profilidan ma'lumotlarni ajratib olish
          const googleId = profile.id;
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName || "Noma'lum";
          const photoURL = profile.photos?.[0]?.value || "";

          if (!email) {
            return done(new Error("Google profilda email topilmadi"), null);
          }

          // 2. Avval googleId bo'yicha qidirish, keyin email bo'yicha
          let user = await User.findOne({
            $or: [{ googleId }, { email }],
          });

          if (!user) {
            // 3. Yangi foydalanuvchi yaratish (birinchi marta kirmoqda)
            user = await User.create({
              name,
              email,
              googleId,
              photoURL,
              role: "user",
              lastLogin: new Date(),
            });
            console.log(`✅ Yangi foydalanuvchi yaratildi: ${email}`);
          } else {
            // 4. Mavjud foydalanuvchini yangilash
            user.lastLogin = new Date();
            if (!user.googleId) user.googleId = googleId;
            if (photoURL) user.photoURL = photoURL;
            if (name && name !== "Noma'lum") user.name = name;
            await user.save();
            console.log(`✅ Foydalanuvchi kirdi: ${email}`);
          }

          // 5. Passport'ga foydalanuvchini qaytarish
          return done(null, user);
        } catch (error) {
          console.error("❌ Google OAuth xatosi:", error);
          return done(error, null);
        }
      },
    ),
  );

  /**
   * Serialize/Deserialize — Session uchun kerak (biz asosan JWT ishlatamiz,
   * lekin passport ichki ishlashi uchun bu kerak)
   */
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};

module.exports = { configurePassport };
