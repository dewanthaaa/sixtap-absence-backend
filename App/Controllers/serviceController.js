// controllers/absenceHistoryExportController.js
import Absence from "../Models/absence.js";
import User from "../Models/user.js";
import SchoolClass from "../Models/schoolclass.js";
import generateExcel from "../Services/ExcelService.js";
import { Op } from "sequelize";
import moment from "moment";

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
        time_in: abs.time_in ? moment(abs.time_in).format("HH:mm:ss") : "",
        time_out: abs.time_out ? moment(abs.time_out).format("HH:mm:ss") : "",
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

      console.log(formattedData);
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
        time_in: abs.time_in ? moment(abs.time_in).format("HH:mm:ss") : "",
        time_out: abs.time_out ? moment(abs.time_out).format("HH:mm:ss") : "",
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
        time_in: abs.time_in ? moment(abs.time_in).format("HH:mm:ss") : "",
        time_out: abs.time_out ? moment(abs.time_out).format("HH:mm:ss") : "",
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

  async exportAllAbsenceRecapToExcel(req, res) {
    try {
      const userId = req.user.id;

      // Validasi admin
      const user = await User.findByPk(userId);
      if (!user || user.role_id !== 1) {
        return res.status(403).json({
          success: false,
          message: "Akses ditolak. Hanya admin yang dapat mengakses fitur ini.",
        });
      }

      const { range } = req.query;
      const dateFilter = {};
      const today = new Date();

      if (range === "bulan_ini") {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        dateFilter.date = { [Op.between]: [start, end] };
      } else if (range === "6_bulan") {
        const sixMonthsAgo = new Date(
          today.getFullYear(),
          today.getMonth() - 5,
          1
        );
        dateFilter.date = { [Op.gte]: sixMonthsAgo };
      }

      const usersWithAbsence = await User.findAll({
        where: { role_id: 2 },
        include: [
          {
            model: Absence,
            as: "absences",
            where: Object.keys(dateFilter).length ? dateFilter : undefined,
            attributes: ["absence_status"],
          },
        ],
        order: [["name", "ASC"]],
      });

      if (!usersWithAbsence.length) {
        return res.status(404).json({
          success: false,
          message: "Data rekap absensi tidak ditemukan.",
        });
      }

      const recapData = usersWithAbsence.map((user, index) => {
        const absences = user.absences || [];
        return {
          no: index + 1,
          name: user.name,
          nis: user.nis,
          sum_attendance: absences.filter((a) => a.absence_status === "hadir")
            .length,
          sum_permission: absences.filter((a) => a.absence_status === "izin")
            .length,
          sum_sick: absences.filter((a) => a.absence_status === "sakit").length,
          sum_alpa: absences.filter((a) => a.absence_status === "alpa").length,
        };
      });

      // Definisikan struktur kolom Excel
      const columns = [
        { header: "No", key: "no", width: 5 },
        { header: "Nama", key: "name", width: 20 },
        { header: "NIS", key: "nis", width: 15 },
        { header: "Hadir", key: "sum_attendance", width: 10 },
        { header: "Izin", key: "sum_permission", width: 10 },
        { header: "Sakit", key: "sum_sick", width: 10 },
        { header: "Alpa", key: "sum_alpa", width: 10 },
      ];

      const filenameSuffix =
        range === "bulan_ini"
          ? "bulan-ini"
          : range === "6_bulan"
          ? "6-bulan-terakhir"
          : "semua";

      await generateExcel({
        data: recapData,
        columns,
        sheetName: `Rekap Absensi`,
        fileName: `rekap-absensi-${filenameSuffix}.xlsx`,
        res,
      });
    } catch (error) {
      console.error("Export Recap Error:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal melakukan export rekap absensi",
        error: error.message,
      });
    }
  }

  async exportClassAbsenceRecapToExcel(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { range } = req.query;

      // Validasi ID kelas
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "ID kelas wajib disertakan.",
        });
      }

      // Validasi role: hanya admin dan wali kelas
      const user = await User.findByPk(userId);
      if (!user || ![1, 5].includes(user.role_id)) {
        return res.status(403).json({
          success: false,
          message:
            "Akses ditolak. Hanya admin dan wali kelas yang dapat mengakses fitur ini.",
        });
      }

      const dateFilter = {};
      const today = new Date();

      if (range === "bulan_ini") {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        dateFilter.date = { [Op.between]: [start, end] };
      } else if (range === "6_bulan") {
        const sixMonthsAgo = new Date(
          today.getFullYear(),
          today.getMonth() - 5,
          1
        );
        dateFilter.date = { [Op.gte]: sixMonthsAgo };
      }

      const classWithAbsence = await User.findAll({
        where: {
          role_id: 2,
          schoolclass_id: id,
        },
        include: [
          {
            model: Absence,
            as: "absences",
            where: Object.keys(dateFilter).length ? dateFilter : undefined,
            attributes: ["absence_status"],
          },
        ],
        order: [["name", "ASC"]],
      });

      if (!classWithAbsence || classWithAbsence.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Tidak ditemukan siswa dengan absensi di kelas tersebut.",
        });
      }

      const recapData = classWithAbsence.map((user, index) => {
        const absences = user.absences || [];
        return {
          no: index + 1,
          name: user.name,
          nis: user.nis,
          sum_attendance: absences.filter((a) => a.absence_status === "hadir")
            .length,
          sum_permission: absences.filter((a) => a.absence_status === "izin")
            .length,
          sum_sick: absences.filter((a) => a.absence_status === "sakit").length,
          sum_alpa: absences.filter((a) => a.absence_status === "alpa").length,
        };
      });

      if (recapData.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Tidak ada data absensi untuk kelas ini.",
        });
      }

      // Struktur kolom Excel
      const columns = [
        { header: "No", key: "no", width: 5 },
        { header: "Nama", key: "name", width: 20 },
        { header: "NIS", key: "nis", width: 15 },
        { header: "Hadir", key: "sum_attendance", width: 10 },
        { header: "Izin", key: "sum_permission", width: 10 },
        { header: "Sakit", key: "sum_sick", width: 10 },
        { header: "Alpa", key: "sum_alpa", width: 10 },
      ];

      const filenameSuffix =
        range === "bulan_ini"
          ? "bulan-ini"
          : range === "6_bulan"
          ? "6-bulan-terakhir"
          : "semua";

      await generateExcel({
        data: recapData,
        columns,
        sheetName: `Rekap Kelas ${id}`,
        fileName: `rekap-absensi-kelas-${id}-${filenameSuffix}.xlsx`,
        res,
      });
    } catch (error) {
      console.error("Export Class Recap Error:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal melakukan export rekap absensi berdasarkan kelas",
        error: error.message,
      });
    }
  }

  async exportRecapAbsenceDetailToExcel(req, res) {
    try {
      const requesterId = req.user.id;
      const { id } = req.params;
      const { filter } = req.query;

      // Validasi id siswa
      if (!id) {
        return res.status(400).json({
          message: "ID siswa wajib disertakan.",
        });
      }

      // Validasi role hanya admin dan wali kelas
      const requester = await User.findByPk(requesterId);
      if (!requester || ![1, 5].includes(requester.role_id)) {
        return res.status(403).json({
          message:
            "Akses ditolak. Hanya admin dan wali kelas yang dapat mengakses fitur ini.",
        });
      }

      // Tentukan rentang waktu
      let startDate;
      const endDate = new Date();

      if (filter === "6-bulan") {
        startDate = moment().subtract(6, "months").startOf("month").toDate();
      } else {
        startDate = moment().startOf("month").toDate();
      }

      // Ambil data user & absensinya
      const userWithAbsence = await User.findOne({
        where: {
          id,
          role_id: 2,
        },
        include: [
          {
            model: Absence,
            as: "absences",
            where: {
              date: {
                [Op.between]: [startDate, endDate],
              },
            },
            required: false,
            attributes: ["absence_status", "date"],
          },
        ],
      });

      if (!userWithAbsence) {
        return res.status(404).json({
          message:
            "Siswa tidak ditemukan atau tidak memiliki absensi pada periode tersebut.",
        });
      }

      const absences = userWithAbsence.absences || [];

      const jumlahHadir = absences.filter(
        (a) => a.absence_status === "hadir"
      ).length;
      const jumlahIzin = absences.filter(
        (a) => a.absence_status === "izin"
      ).length;
      const jumlahSakit = absences.filter(
        (a) => a.absence_status === "sakit"
      ).length;
      const jumlahAlpa = absences.filter(
        (a) => a.absence_status === "alpa"
      ).length;

      const recap = {
        no: 1,
        name: userWithAbsence.name,
        nis: userWithAbsence.nis,
        sum_attendance: jumlahHadir,
        sum_permission: jumlahIzin,
        sum_sick: jumlahSakit,
        sum_alpa: jumlahAlpa,
        time_range: `${moment(startDate).format("YYYY-MM-DD")} s.d. ${moment(
          endDate
        ).format("YYYY-MM-DD")}`,
      };

      const columns = [
        { header: "No", key: "no", width: 5 },
        { header: "Nama", key: "name", width: 20 },
        { header: "NIS", key: "nis", width: 15 },
        { header: "Hadir", key: "sum_attendance", width: 10 },
        { header: "Izin", key: "sum_permission", width: 10 },
        { header: "Sakit", key: "sum_sick", width: 10 },
        { header: "Alpa", key: "sum_alpa", width: 10 },
        { header: "Periode", key: "time_range", width: 25 },
      ];

      const fileName = `rekap-absensi-${userWithAbsence.name
        .toLowerCase()
        .replace(/ /g, "-")}-${filter || "bulan-ini"}.xlsx`;

      await generateExcel({
        data: [recap],
        columns,
        sheetName: `Rekap ${userWithAbsence.name}`,
        fileName,
        res,
      });
    } catch (error) {
      console.error("Export Rekap Siswa Error:", error);
      return res.status(500).json({
        message: "Gagal melakukan export rekap absensi siswa",
        error: error.message,
      });
    }
  }
}

export default new ServiceController();
