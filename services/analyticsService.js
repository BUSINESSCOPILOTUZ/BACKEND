const Lead = require("../models/Lead");
const Influencer = require("../models/Influencer");
const Analytics = require("../models/Analytics");

/**
 * Dashboard uchun umumiy analytics hisoblash
 */
const getDashboardStats = async (userId) => {
  try {
    const totalLeads = await Lead.countDocuments({ createdBy: userId });
    const hotLeads = await Lead.countDocuments({
      createdBy: userId,
      status: "hot",
    });
    const warmLeads = await Lead.countDocuments({
      createdBy: userId,
      status: "warm",
    });
    const coldLeads = await Lead.countDocuments({
      createdBy: userId,
      status: "cold",
    });
    const appointments = await Lead.countDocuments({
      createdBy: userId,
      status: "appointment",
    });

    const conversions = appointments;
    const conversionRate =
      totalLeads > 0 ? ((conversions / totalLeads) * 100).toFixed(1) : 0;

    // Oxirgi 7 kunlik lidlar
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyLeads = await Lead.countDocuments({
      createdBy: userId,
      createdAt: { $gte: weekAgo },
    });

    // Influencer statistikasi
    const influencerStats = await Influencer.aggregate([
      { $match: { createdBy: userId } },
      {
        $group: {
          _id: null,
          totalConversions: { $sum: "$conversions" },
          totalRevenue: { $sum: "$revenue" },
        },
      },
    ]);

    const totalRevenue =
      influencerStats.length > 0 ? influencerStats[0].totalRevenue : 0;
    const totalConversions =
      influencerStats.length > 0 ? influencerStats[0].totalConversions : 0;

    return {
      totalLeads,
      hotLeads,
      warmLeads,
      coldLeads,
      appointments,
      conversions,
      conversionRate: `${conversionRate}%`,
      weeklyLeads,
      totalRevenue,
      totalConversions,
    };
  } catch (error) {
    throw new Error("Analytics hisoblashda xatolik: " + error.message);
  }
};

/**
 * Haftalik lidlar o'sishi
 */
const getWeeklyLeadGrowth = async (userId) => {
  const days = ["Dush", "Sesh", "Chor", "Pay", "Jum", "Shan", "Yak"];
  const result = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const count = await Lead.countDocuments({
      createdBy: userId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    result.push({
      name: days[startOfDay.getDay() === 0 ? 6 : startOfDay.getDay() - 1],
      leads: count,
    });
  }

  return result;
};

/**
 * Oylik daromad dinamikasi
 */
const getMonthlyRevenue = async (userId) => {
  const months = [
    "Yan",
    "Fev",
    "Mar",
    "Apr",
    "May",
    "Iyun",
    "Iyul",
    "Avg",
    "Sen",
    "Okt",
    "Noy",
    "Dek",
  ];
  const currentYear = new Date().getFullYear();
  const result = [];

  for (let i = 0; i < 12; i++) {
    const startOfMonth = new Date(currentYear, i, 1);
    const endOfMonth = new Date(currentYear, i + 1, 0, 23, 59, 59, 999);

    const stats = await Influencer.aggregate([
      {
        $match: {
          createdBy: userId,
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$revenue" },
        },
      },
    ]);

    result.push({
      name: months[i],
      revenue: stats.length > 0 ? stats[0].totalRevenue : 0,
    });
  }

  return result;
};

/**
 * Manba bo'yicha lidlar taqsimoti
 */
const getLeadsBySource = async (userId) => {
  const stats = await Lead.aggregate([
    { $match: { createdBy: userId } },
    {
      $group: {
        _id: "$source",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  return stats.map((s) => ({ source: s._id, count: s.count }));
};

module.exports = {
  getDashboardStats,
  getWeeklyLeadGrowth,
  getMonthlyRevenue,
  getLeadsBySource,
};
