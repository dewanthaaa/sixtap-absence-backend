// controllers/absenceHistoryExportController.js
import Absence from "../Models/absence";
import User from "../Models/user";
import SchoolClass from "../Models/schoolclass";
import generateExcel from "../Services/ExcelService.js";

// Column map agar nama kolom Excel bisa dirapikan dan diurutkan
// const absenceColumnMap = {
//   absence_id: "ID Absen",
//   student_id: "ID Siswa",
//   name: "Nama",
//   nis: "NIS",
//   photo: "Foto",
//   time_in: "Waktu Masuk",
//   time_out: "Waktu Keluar",
//   status: "Status",
//   info: "Keterangan",
// };

class ServiceController {
  async exportAllAbsenceHistoryToExcel(req, res) {
    try {
      const absences = await Absence.findAll({
        attributes: [
          "id",
          "day",
          "time_in",
          "time_out",
          "date",
          "info",
          "absence_status",
          "card_status",
        ],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "nis", "batch", "photo"],
          },
          {
            model: SchoolClass,
            as: "schoolClass",
            attributes: ["id", "class_name"],
          },
        ],
        order: [
          ["date", "DESC"],
          ["time_in", "DESC"],
        ],
      });

      const formattedData = absences.map((abs) => ({
        date: abs.date,
        day: abs.day,
        time_in: abs.time_in,
        time_out: abs.time_out,
        absence_status: abs.absence_status,
        info: abs.info,
        card_status: abs.card_status,
        name: abs.user?.name,
        nis: abs.user?.nis,
        class_name: abs.schoolClass?.class_name,
      }));

      const columns = [
        { header: "Tanggal", key: "date", width: 15 },
        { header: "Hari", key: "day", width: 12 },
        { header: "Jam Masuk", key: "time_in", width: 15 },
        { header: "Jam Keluar", key: "time_out", width: 15 },
        { header: "Status Absen", key: "absence_status", width: 20 },
        { header: "Info", key: "info", width: 30 },
        { header: "Status Kartu", key: "card_status", width: 20 },
        { header: "Nama", key: "name", width: 20 },
        { header: "NIS", key: "nis", width: 15 },
        { header: "Kelas", key: "class_name", width: 15 },
      ];

      await generateExcel({
        data: formattedData,
        columns,
        sheetName: "Histori Absensi",
        fileName: "histori-absensi.xlsx",
        res,
      });
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal export Excel",
        error: error.message,
      });
    }
  }

  async exportAbsenceHistoryByClassIdToExcel(req, res) {
    try {
      const userId = req.user.id;
      const { startDate, endDate, studentId, status } = req.query;

      const homeRoomTeacher = await User.findOne({
        where: { id: userId, role_id: 5 },
        include: [
          {
            model: SchoolClass,
            as: "schoolClass",
            attributes: ["id", "class_name", "class_code"],
          },
        ],
      });

      if (!homeRoomTeacher || !homeRoomTeacher.schoolclass_id) {
        return res
          .status(403)
          .json({ success: false, message: "Bukan wali kelas" });
      }

      const students = await User.findAll({
        where: {
          schoolclass_id: homeRoomTeacher.schoolclass_id,
          role_id: { [Op.in]: [1, 2] },
        },
        attributes: ["id", "name", "nis"],
      });

      const studentIds = students.map((s) => s.id);
      const whereConditions = { user_id: { [Op.in]: studentIds } };

      if (startDate || endDate) {
        whereConditions.date = {};
        if (startDate)
          whereConditions.date[Op.gte] = moment(startDate)
            .startOf("day")
            .toDate();
        if (endDate)
          whereConditions.date[Op.lte] = moment(endDate).endOf("day").toDate();
      }
      if (studentId) whereConditions.user_id = studentId;
      if (status) whereConditions.status = status;

      const absences = await Absence.findAll({
        where: whereConditions,
        include: [
          {
            model: User,
            as: "user",
            attributes: ["name", "nis"],
            where: { schoolclass_id: homeRoomTeacher.schoolclass_id },
          },
        ],
        order: [["date", "DESC"]],
      });

      // ✅ Siapkan data untuk Excel
      const formattedData = absences.map((abs) => ({
        date: abs.date,
        time_in: abs.time_in,
        time_out: abs.time_out,
        name: abs.user?.name,
        nis: abs.user?.nis,
        status: abs.absence_status,
        info: abs.info,
      }));

      const columnMap = [
        { header: "Tanggal", key: "date", width: 15 },
        { header: "Jam Masuk", key: "time_in", width: 15 },
        { header: "Jam Keluar", key: "time_out", width: 15 },
        { header: "Nama Siswa", key: "name", width: 20 },
        { header: "NIS", key: "nis", width: 15 },
        { header: "Status", key: "status", width: 20 },
        { header: "Info", key: "info", width: 25 },
      ];

      await generateExcel({
        data: formattedData,
        columns: columnMap,
        sheetName: "Histori Kelas",
        fileName: "histori-absen-kelas.xlsx",
        res,
      });
    } catch (error) {
      console.error("Export byClassId error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal export Excel",
        error: error.message,
      });
    }
  }

  async exportAbsenceHistoryByClassIdTodayOnlyToExcel(req, res) {
    try {
      const userId = req.user.id;
      const homeroomTeacher = await User.findOne({
        where: { id: userId, role_id: 5 },
      });

      if (!homeroomTeacher || !homeroomTeacher.schoolclass_id) {
        return res
          .status(403)
          .json({ success: false, message: "Bukan wali kelas" });
      }

      const todayStart = moment().startOf("day").toDate();
      const todayEnd = moment().endOf("day").toDate();

      const absences = await Absence.findAll({
        where: {
          time_in: { [Op.between]: [todayStart, todayEnd] },
        },
        include: [
          {
            model: User,
            as: "user",
            where: { schoolclass_id: homeroomTeacher.schoolclass_id },
            attributes: ["id", "name", "nis", "photo"],
          },
        ],
        order: [["time_in", "ASC"]],
      });

      const formattedData = absences.map((abs) => ({
        time_in: abs.time_in,
        time_out: abs.time_out,
        name: abs.user?.name,
        nis: abs.user?.nis,
        status: abs.absence_status,
        info: abs.info,
      }));

      const columns = [
        { header: "Jam Masuk", key: "time_in", width: 15 },
        { header: "Jam Keluar", key: "time_out", width: 15 },
        { header: "Nama", key: "name", width: 20 },
        { header: "NIS", key: "nis", width: 15 },
        { header: "Status", key: "status", width: 20 },
        { header: "Info", key: "info", width: 25 },
      ];

      await generateExcel({
        data: formattedData,
        columns,
        sheetName: "Absensi Hari Ini",
        fileName: "absensi-hari-ini.xlsx",
        res,
      });
    } catch (error) {
      console.error("Export today-only error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal export Excel",
        error: error.message,
      });
    }
  }
}

export default new ServiceController();
