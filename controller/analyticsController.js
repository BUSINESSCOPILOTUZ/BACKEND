const analyticsService = require("../services/analyticsService");

/**
 * Dashboard statistikasi
 * GET /api/analytics/dashboard
 */
const getDashboard = async (req, res) => {
  try {
    const stats = await analyticsService.getDashboardStats(req.user._id);

    res.status(200).json({
      status: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Dashboard ma'lumotlarini olishda xatolik: " + error.message,
    });
  }
};

/**
 * Haftalik lidlar o'sishi
 * GET /api/analytics/weekly-leads
 */
const getWeeklyLeads = async (req, res) => {
  try {
    const data = await analyticsService.getWeeklyLeadGrowth(req.user._id);

    res.status(200).json({
      status: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Haftalik lidlarni olishda xatolik: " + error.message,
    });
  }
};

/**
 * Oylik daromad dinamikasi
 * GET /api/analytics/monthly-revenue
 */
const getMonthlyRevenue = async (req, res) => {
  try {
    const data = await analyticsService.getMonthlyRevenue(req.user._id);

    res.status(200).json({
      status: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Oylik daromadni olishda xatolik: " + error.message,
    });
  }
};

/**
 * Lidlar manba bo'yicha taqsimoti
 * GET /api/analytics/leads-by-source
 */
const getLeadsBySource = async (req, res) => {
  try {
    const data = await analyticsService.getLeadsBySource(req.user._id);

    res.status(200).json({
      status: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Manba statistikasini olishda xatolik: " + error.message,
    });
  }
};

module.exports = {
  getDashboard,
  getWeeklyLeads,
  getMonthlyRevenue,
  getLeadsBySource,
};
