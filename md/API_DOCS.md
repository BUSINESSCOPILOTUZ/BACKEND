<!-- Server ============================ domen uchun frontend uchun yoki admin panel uchun -->

server {
server_name business-copilot.masatov.uz www.business-copilot.masatov.uz;

    root            /home/biznes_copilot/FRONT/dist;

    index           index.html;
    try_files $uri /index.html;


    location ~* \.(?:manifest|api|appcache|html?|xml|json)$ {
        expires -1;
        proxy_set_header    X-Forwarded-For $remote_addr;
        proxy_set_header    Host $http_host;
    }

}

<!-- Server ====================== Backend admin panel uchun -->

server {

# listen 80

    listen [::]:80; # managed by Certbot
    listen 80; # managed by Certbot

    server_name apibusinesscopilot.masatov.uz www.apibusinesscopilot.masatov.uz;

    location / {
        proxy_pass http://localhost:9006; #whatever port your app runs on
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

}

ssh root@masatov.uz
sma1636S#shjj1299
SamandarMasatov
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

<!-- backend -->

cd ../home/biznes_copilot/BACKEND
git pull https://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:x-oauth-basic@github.com/SamandarMasatov/BUSINESSCOPILOTUZ/BACKEND.git
pm2 reload all
pm2 monit

<!-- Front -->

cd ../home/biznes_copilot/FRONT
git pull https://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:x-oauth-basic@github.com/SamandarMasatov/BUSINESSCOPILOTUZ/FRONT.git
npm run build
pm2 monit

# BUSINESS COPILOT - Backend API Documentation

## Base URL

```
http://localhost:9005/api
```

## Health Check

```
GET /api/health
```

---

## 🔐 Authentication

### Google orqali kirish

```
POST /api/auth/google
Body: { name, email, firebaseUid, photoURL }
Response: { status, message, data: { token, user } }
```

### Profilni olish

```
GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: { status, data: User }
```

### Profilni yangilash

```
PUT /api/auth/me
Headers: Authorization: Bearer <token>
Body: { name, phone }
Response: { status, message, data: User }
```

---

## 👥 Leads (CRM)

### Barcha lidlarni olish

```
GET /api/leads?status=hot&source=Instagram&search=Aziz&page=1&limit=50
Headers: Authorization: Bearer <token>
Response: { status, data: Lead[], pagination }
```

### Bitta lid olish

```
GET /api/leads/:id
Headers: Authorization: Bearer <token>
Response: { status, data: Lead }
```

### Yangi lid qo'shish

```
POST /api/leads
Headers: Authorization: Bearer <token>
Body: { name, phone, source, status, notes }
Response: { status, message, data: Lead }
```

### Lidni yangilash

```
PUT /api/leads/:id
Headers: Authorization: Bearer <token>
Body: { name, phone, source, status, notes, assignedTo }
Response: { status, message, data: Lead }
```

### Lidni o'chirish

```
DELETE /api/leads/:id
Headers: Authorization: Bearer <token>
Response: { status, message }
```

### Lidga xabar qo'shish

```
POST /api/leads/:id/messages
Headers: Authorization: Bearer <token>
Body: { sender: "user"|"ai", text }
Response: { status, message, data: Lead }
```

### Lidlarni eksport (Excel)

```
GET /api/leads/export
Headers: Authorization: Bearer <token>
Response: Excel fayl (xlsx)
```

---

## 🤝 Influencers

### Barcha influencerlarni olish

```
GET /api/influencers?search=Munisa&platform=Instagram&page=1&limit=50
Headers: Authorization: Bearer <token>
Response: { status, data: Influencer[], pagination }
```

### Bitta influencer olish

```
GET /api/influencers/:id
Headers: Authorization: Bearer <token>
Response: { status, data: Influencer }
```

### Yangi influencer qo'shish

```
POST /api/influencers
Headers: Authorization: Bearer <token>
Body: { name, followers, promoCode, platform, contactPhone, contactEmail }
Response: { status, message, data: Influencer }
```

### Influencerni yangilash

```
PUT /api/influencers/:id
Headers: Authorization: Bearer <token>
Body: { name, followers, promoCode, conversions, revenue, platform, isActive }
Response: { status, message, data: Influencer }
```

### Influencerni o'chirish

```
DELETE /api/influencers/:id
Headers: Authorization: Bearer <token>
Response: { status, message }
```

### Promokod tekshirish (Public)

```
GET /api/influencers/promo/:code
Response: { status, data: Influencer }
```

---

## 📋 Content Plans

### Barcha kontent rejalarni olish

```
GET /api/content-plans?status=pending&page=1&limit=50
Headers: Authorization: Bearer <token>
Response: { status, data: ContentPlan[], pagination }
```

### Bitta kontent rejani olish

```
GET /api/content-plans/:id
Headers: Authorization: Bearer <token>
Response: { status, data: ContentPlan }
```

### AI orqali kontent reja yaratish

```
POST /api/content-plans/generate
Headers: Authorization: Bearer <token>
Body: { topic: "Restoran marketing rejasi" }
Response: { status, message, data: ContentPlan }
```

### Kontent rejani yangilash

```
PUT /api/content-plans/:id
Headers: Authorization: Bearer <token>
Body: { title, generatedPlan, status }
Response: { status, message, data: ContentPlan }
```

### Kontent rejani tasdiqlash

```
PUT /api/content-plans/:id/approve
Headers: Authorization: Bearer <token>
Response: { status, message, data: ContentPlan }
```

### Kontent rejani o'chirish

```
DELETE /api/content-plans/:id
Headers: Authorization: Bearer <token>
Response: { status, message }
```

---

## 📊 Analytics

### Dashboard statistikasi

```
GET /api/analytics/dashboard
Headers: Authorization: Bearer <token>
Response: { status, data: { totalLeads, hotLeads, warmLeads, coldLeads, appointments, conversions, conversionRate, weeklyLeads, totalRevenue, totalConversions } }
```

### Haftalik lidlar o'sishi (Grafik)

```
GET /api/analytics/weekly-leads
Headers: Authorization: Bearer <token>
Response: { status, data: [{ name: "Dush", leads: 40 }, ...] }
```

### Oylik daromad dinamikasi (Grafik)

```
GET /api/analytics/monthly-revenue
Headers: Authorization: Bearer <token>
Response: { status, data: [{ name: "Yan", revenue: 4000000 }, ...] }
```

### Lidlar manba bo'yicha

```
GET /api/analytics/leads-by-source
Headers: Authorization: Bearer <token>
Response: { status, data: [{ source: "Instagram", count: 25 }, ...] }
```

---

## ⚙️ Automation Settings

### Sozlamalarni olish

```
GET /api/automation
Headers: Authorization: Bearer <token>
Response: { status, data: AutomationSettings }
```

### Sozlamalarni yangilash

```
PUT /api/automation
Headers: Authorization: Bearer <token>
Body: { telegramBot, autoPosting, aiReply, welcomeMessage, telegramBotToken }
Response: { status, message, data: AutomationSettings }
```

---

## 🚀 Business (AI Maslahatchi)

### AI Chat (Suhbat)

```
POST /api/business/chat
Headers: Authorization: Bearer <token>
Body: { message: "Qanday biznes boshlayman?", chatHistory: [{ role, text }] }
Response: { status, data: { role: "model", text: "..." } }
```

### AI Biznes-reja yaratish

```
POST /api/business/generate-plan
Headers: Authorization: Bearer <token>
Body: { industry, type, budget, equipment, team, country, region, district }
Response: { status, message, data: BizPlan }
```

### Barcha biznes-rejalarni olish

```
GET /api/business/plans
Headers: Authorization: Bearer <token>
Response: { status, data: BizPlan[] }
```

### Bitta biznes-rejani olish

```
GET /api/business/plans/:id
Headers: Authorization: Bearer <token>
Response: { status, data: BizPlan }
```

### Kredit kalkulyatori

```
POST /api/business/calculate-loan
Headers: Authorization: Bearer <token>
Body: { amount: 10000000, rate: 24, term: 12 }
Response: { status, data: { monthlyPayment, totalPayment, totalInterest } }
```

### Soliq kalkulyatori

```
POST /api/business/calculate-tax
Headers: Authorization: Bearer <token>
Body: { revenue: 50000000, taxType: "simplified"|"fixed"|"general" }
Response: { status, data: { tax, description, revenue, taxType } }
```

### AI Sayt konsepti yaratish

```
POST /api/business/generate-website
Headers: Authorization: Bearer <token>
Body: { description: "Mebel do'koni uchun sayt..." }
Response: { status, message, data: WebsiteProject }
```

### Barcha sayt loyihalarni olish

```
GET /api/business/websites
Headers: Authorization: Bearer <token>
Response: { status, data: WebsiteProject[] }
```

---

## 📁 Models

### User

| Field       | Type                          | Required          |
| ----------- | ----------------------------- | ----------------- |
| name        | String                        | ✅                |
| email       | String                        | ✅ (unique)       |
| firebaseUid | String                        | -                 |
| photoURL    | String                        | -                 |
| role        | admin/manager/influencer/user | - (default: user) |
| phone       | String                        | -                 |
| isActive    | Boolean                       | - (default: true) |

### Lead

| Field      | Type                                               | Required          |
| ---------- | -------------------------------------------------- | ----------------- |
| name       | String                                             | ✅                |
| phone      | String                                             | ✅                |
| source     | Instagram/Telegram/Facebook/Website/Referral/Other | -                 |
| status     | cold/warm/hot/appointment                          | - (default: cold) |
| messages   | Array                                              | -                 |
| notes      | String                                             | -                 |
| assignedTo | ObjectId (User)                                    | -                 |
| createdBy  | ObjectId (User)                                    | -                 |

### Influencer

| Field       | Type                                    | Required       |
| ----------- | --------------------------------------- | -------------- |
| name        | String                                  | ✅             |
| followers   | String                                  | -              |
| promoCode   | String                                  | ✅ (unique)    |
| conversions | Number                                  | - (default: 0) |
| revenue     | Number                                  | - (default: 0) |
| platform    | Instagram/Telegram/YouTube/TikTok/Other | -              |

### ContentPlan

| Field         | Type                                | Required |
| ------------- | ----------------------------------- | -------- |
| title         | String                              | ✅       |
| rawText       | String                              | ✅       |
| generatedPlan | String                              | -        |
| status        | pending/approved/completed/rejected | -        |

### BizPlan

| Field         | Type                     | Required |
| ------------- | ------------------------ | -------- |
| industry      | String                   | ✅       |
| type          | online/offline/an'anaviy | -        |
| budget        | String                   | -        |
| equipment     | String                   | -        |
| team          | String                   | -        |
| country       | String                   | -        |
| region        | String                   | -        |
| district      | String                   | -        |
| generatedPlan | String                   | -        |
| chatHistory   | Array                    | -        |

### WebsiteProject

| Field           | Type                        | Required |
| --------------- | --------------------------- | -------- |
| description     | String                      | ✅       |
| generatedResult | String                      | -        |
| status          | draft/in_progress/completed | -        |
