module.exports = {
  databaseUrl:
    process.env.DATABASE_URL || "mongodb://127.0.0.1:27017/BUSINESS_COPILOT",
  secret_key:
    process.env.JWT_SECRET ||
    "eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTc0MDA1NTA1NSwiaWF0IjoxNzQwMDU1MDU1fQ.F69ciaHyVWMzpQ-0Yo9Bmelu1lN2ohjfs8ZCHsH4Vos",
  time: process.env.JWT_EXPIRE || "24h",
};
