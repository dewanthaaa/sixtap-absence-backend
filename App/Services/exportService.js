import Absence from "../Models/absence.js";
import User from "../Models/user.js";
import { Op } from "sequelize";
import ExcelExporter from "../Utils/excelExporter.js";
import ExcelResponse from "../Utils/excelResponse.js";

const ExportService = {
  async exportAllAbsenceRecap(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findByPk(userId);
      if (!user || user.role_id !== 1) {
        return ExcelResponse.forbidden(
          res,
          "Akses ditolak. Hanya admin yang dapat mengakses fitur ini."
        );
      }

      const { range } = req.query;
      const today = new Date();
      const dateFilter = {};

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
        return ExcelResponse.notFound(
          res,
          "Data rekap absensi tidak ditemukan."
        );
      }

      const recapData = usersWithAbsence.map((user, index) => ({
        no: index + 1,
        name: user.name,
        nis: user.nis,
        sum_attendance: user.absences.filter(
          (a) => a.absence_status === "hadir"
        ).length,
        sum_permission: user.absences.filter((a) => a.absence_status === "izin")
          .length,
        sum_sick: user.absences.filter((a) => a.absence_status === "sakit")
          .length,
        sum_alpa: user.absences.filter((a) => a.absence_status === "alpa")
          .length,
      }));

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

      await ExcelExporter.exportToExcel(res, {
        data: recapData,
        columns,
        sheetName: `Rekap Absensi`,
        fileName: `rekap-absensi-${filenameSuffix}.xlsx`,
      });
    } catch (error) {
      ExcelResponse.error(res, "Gagal melakukan export rekap absensi", error);
    }
  },

  async exportClassAbsenceRecap(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { range } = req.query;

      if (!id)
        return ExcelResponse.badRequest(res, "ID kelas wajib disertakan.");

      const user = await User.findByPk(userId);
      if (!user || ![1, 5].includes(user.role_id)) {
        return ExcelResponse.forbidden(
          res,
          "Akses ditolak. Hanya admin dan wali kelas yang dapat mengakses fitur ini."
        );
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
        where: { role_id: 2, schoolclass_id: id },
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

      if (!classWithAbsence.length) {
        return ExcelResponse.notFound(
          res,
          "Tidak ditemukan siswa dengan absensi di kelas tersebut."
        );
      }

      const recapData = classWithAbsence.map((user, index) => ({
        no: index + 1,
        name: user.name,
        nis: user.nis,
        sum_attendance: user.absences.filter(
          (a) => a.absence_status === "hadir"
        ).length,
        sum_permission: user.absences.filter((a) => a.absence_status === "izin")
          .length,
        sum_sick: user.absences.filter((a) => a.absence_status === "sakit")
          .length,
        sum_alpa: user.absences.filter((a) => a.absence_status === "alpa")
          .length,
      }));

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

      await ExcelExporter.exportToExcel(res, {
        data: recapData,
        columns,
        sheetName: `Rekap Kelas ${id}`,
        fileName: `rekap-absensi-kelas-${id}-${filenameSuffix}.xlsx`,
      });
    } catch (error) {
      ExcelResponse.error(
        res,
        "Gagal melakukan export rekap absensi berdasarkan kelas",
        error
      );
    }
  },
};

export default ExportService;
