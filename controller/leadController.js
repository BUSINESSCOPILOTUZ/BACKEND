const Lead = require("../models/Lead");

/**
 * Barcha lidlarni olish (filter, search, pagination bilan)
 * GET /api/leads
 */
const getLeads = async (req, res) => {
  try {
    const {
      status,
      source,
      search,
      page = 1,
      limit = 50,
      sort = "-createdAt",
    } = req.query;

    const filter = { createdBy: req.user._id };

    if (status && status !== "all") {
      filter.status = status;
    }

    if (source) {
      filter.source = source;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate("assignedTo", "name email")
        .lean(),
      Lead.countDocuments(filter),
    ]);

    res.status(200).json({
      status: true,
      data: leads,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Lidlarni olishda xatolik: " + error.message,
    });
  }
};

/**
 * Bitta lidni olish
 * GET /api/leads/:id
 */
const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    }).populate("assignedTo", "name email");

    if (!lead) {
      return res.status(404).json({
        status: false,
        message: "Lid topilmadi.",
      });
    }

    res.status(200).json({
      status: true,
      data: lead,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Lidni olishda xatolik: " + error.message,
    });
  }
};

/**
 * Yangi lid qo'shish
 * POST /api/leads
 */
const createLead = async (req, res) => {
  try {
    const { name, phone, source, status, notes } = req.body;

    const lead = await Lead.create({
      name,
      phone,
      source: source || "Other",
      status: status || "cold",
      notes: notes || "",
      createdBy: req.user._id,
    });

    res.status(201).json({
      status: true,
      message: "Lid muvaffaqiyatli qo'shildi",
      data: lead,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Lid qo'shishda xatolik: " + error.message,
    });
  }
};

/**
 * Lidni yangilash
 * PUT /api/leads/:id
 */
const updateLead = async (req, res) => {
  try {
    const { name, phone, source, status, notes, assignedTo } = req.body;

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { name, phone, source, status, notes, assignedTo },
      { new: true, runValidators: true },
    );

    if (!lead) {
      return res.status(404).json({
        status: false,
        message: "Lid topilmadi.",
      });
    }

    res.status(200).json({
      status: true,
      message: "Lid yangilandi",
      data: lead,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Lidni yangilashda xatolik: " + error.message,
    });
  }
};

/**
 * Lidni o'chirish
 * DELETE /api/leads/:id
 */
const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!lead) {
      return res.status(404).json({
        status: false,
        message: "Lid topilmadi.",
      });
    }

    res.status(200).json({
      status: true,
      message: "Lid o'chirildi",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Lidni o'chirishda xatolik: " + error.message,
    });
  }
};

/**
 * Lidga xabar qo'shish
 * POST /api/leads/:id/messages
 */
const addMessage = async (req, res) => {
  try {
    const { sender, text } = req.body;

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      {
        $push: {
          messages: { sender, text },
        },
      },
      { new: true },
    );

    if (!lead) {
      return res.status(404).json({
        status: false,
        message: "Lid topilmadi.",
      });
    }

    res.status(200).json({
      status: true,
      message: "Xabar qo'shildi",
      data: lead,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Xabar qo'shishda xatolik: " + error.message,
    });
  }
};

/**
 * Lidlarni Excel formatda eksport qilish
 * GET /api/leads/export
 */
const exportLeads = async (req, res) => {
  try {
    const ExcelJS = require("exceljs");

    const leads = await Lead.find({ createdBy: req.user._id })
      .sort("-createdAt")
      .lean();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Lidlar");

    worksheet.columns = [
      { header: "Ism", key: "name", width: 25 },
      { header: "Telefon", key: "phone", width: 20 },
      { header: "Manba", key: "source", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Izoh", key: "notes", width: 30 },
      { header: "Yaratilgan sana", key: "createdAt", width: 20 },
    ];

    // Header stilini belgilash
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F172A" },
    };
    worksheet.getRow(1).font = { color: { argb: "FFFFFFFF" }, bold: true };

    const statusLabels = {
      hot: "Issiq",
      warm: "Iliq",
      cold: "Sovuq",
      appointment: "Uchrashuv",
    };

    leads.forEach((lead) => {
      worksheet.addRow({
        name: lead.name,
        phone: lead.phone,
        source: lead.source,
        status: statusLabels[lead.status] || lead.status,
        notes: lead.notes,
        createdAt: new Date(lead.createdAt).toLocaleDateString("uz-UZ"),
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", "attachment; filename=lidlar.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Eksport qilishda xatolik: " + error.message,
    });
  }
};

module.exports = {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  addMessage,
  exportLeads,
};
