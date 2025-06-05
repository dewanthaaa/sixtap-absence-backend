import { Op, fn, col, where } from "sequelize";
import moment from "moment";
import Absence from "../Models/absence.js";
import User from "../Models/user.js";
import Role from "../Models/role.js";
import SchoolClass from "../Models/schoolclass.js";

class RecapController {
  async allAbsenceRecap(req, res) {
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

    try {
      // Ambil semua user yang punya absensi
      const usersWithAbsence = await User.findAll({
        where: {
          role_id: 2,
        },
        include: [
          {
            model: Absence,
            as: "absences",
            where: Object.keys(dateFilter).length ? dateFilter : undefined,
            attributes: ["absence_status"],
          },
        ],
        order: [["name", "ASC"]], // optional: urutkan berdasarkan nama
      });

      if (!usersWithAbsence.length) {
        return res.status(404).json({
          message: "Data rekap absensi tidak ditemukan.",
          data: [],
        });
      }

      const recapData = usersWithAbsence.map((user, index) => {
        const absences = user.absences || [];

        // Hitung jumlah berdasarkan status
        const jumlahHadir = absences.filter(
          (abs) => abs.absence_status === "hadir"
        ).length;
        const jumlahIzin = absences.filter(
          (abs) => abs.absence_status === "izin"
        ).length;
        const jumlahSakit = absences.filter(
          (abs) => abs.absence_status === "sakit"
        ).length;
        const jumlahAlpa = absences.filter(
          (abs) => abs.absence_status === "alpa"
        ).length;

        return {
          no: index + 1,
          nama_siswa: user.name, // pastikan nama kolom di model User sesuai
          jumlah_hadir: jumlahHadir,
          jumlah_izin: jumlahIzin,
          jumlah_sakit: jumlahSakit,
          jumlah_alpa: jumlahAlpa,
        };
      });

      return res.status(200).json({
        message: "Berhasil mendapatkan rekap absensi",
        data: recapData,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Gagal mendapatkan rekap absensi",
        error: error.message,
      });
    }
  }

  async classAbsenceRecap(req, res) {
    const { id } = req.params;
    const { range } = req.query;

    if (!id) {
      return res.status(400).json({
        message: "ID kelas wajib disertakan.",
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

    try {
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

      // Jika tidak ada user siswa di kelas tersebut
      if (!classWithAbsence || classWithAbsence.length === 0) {
        return res.status(404).json({
          message: "Tidak ditemukan siswa dengan absensi di kelas tersebut.",
          data: [],
        });
      }

      const recapData = classWithAbsence.map((user, index) => {
        const absences = user.absences || [];

        const jumlahHadir = absences.filter(
          (abs) => abs.absence_status === "hadir"
        ).length;
        const jumlahIzin = absences.filter(
          (abs) => abs.absence_status === "izin"
        ).length;
        const jumlahSakit = absences.filter(
          (abs) => abs.absence_status === "sakit"
        ).length;
        const jumlahAlpa = absences.filter(
          (abs) => abs.absence_status === "alpa"
        ).length;

        return {
          no: index + 1,
          nama_siswa: user.name,
          jumlah_hadir: jumlahHadir,
          jumlah_izin: jumlahIzin,
          jumlah_sakit: jumlahSakit,
          jumlah_alpa: jumlahAlpa,
        };
      });

      // Tambahan pengecekan jika hasil mapping recapData kosong
      if (recapData.length === 0) {
        return res.status(404).json({
          message: "Tidak ada data absensi untuk kelas ini.",
          data: [],
        });
      }

      return res.status(200).json({
        message: "Berhasil mendapatkan rekap absensi berdasarkan kelas.",
        data: recapData,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Gagal mendapatkan rekap absensi",
        error: error.message,
      });
    }
  }

  async recapAbsenceDetail(req, res) {
    const { id } = req.params;
    const { filter } = req.query; // opsi: 'bulan-ini' (default), '6-bulan'

    if (!id) {
      return res.status(400).json({ message: "ID siswa wajib disertakan." });
    }

    // Tentukan rentang waktu berdasarkan query
    let startDate;
    const endDate = new Date(); // hari ini

    if (filter === "6-bulan") {
      startDate = moment().subtract(6, "months").startOf("month").toDate();
    } else {
      // default: bulan ini
      startDate = moment().startOf("month").toDate();
    }

    try {
      const userWithAbsence = await User.findOne({
        where: {
          id,
          role_id: 2, // pastikan hanya siswa
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
            required: false, // tetap tampilkan user meskipun tidak ada absensi dalam rentang waktu
            attributes: ["absence_status", "date"],
          },
        ],
      });

      if (!userWithAbsence) {
        return res.status(404).json({
          message:
            "Siswa tidak ditemukan atau tidak memiliki absensi pada periode tersebut.",
          data: null,
        });
      }

      const absences = userWithAbsence.absences || [];

      const jumlahHadir = absences.filter(
        (abs) => abs.absence_status === "hadir"
      ).length;
      const jumlahIzin = absences.filter(
        (abs) => abs.absence_status === "izin"
      ).length;
      const jumlahSakit = absences.filter(
        (abs) => abs.absence_status === "sakit"
      ).length;
      const jumlahAlpa = absences.filter(
        (abs) => abs.absence_status === "alpa"
      ).length;

      const recap = {
        no: 1,
        nama_siswa: userWithAbsence.name,
        jumlah_hadir: jumlahHadir,
        jumlah_izin: jumlahIzin,
        jumlah_sakit: jumlahSakit,
        jumlah_alpa: jumlahAlpa,
        rentang_waktu: {
          dari: moment(startDate).format("YYYY-MM-DD"),
          sampai: moment(endDate).format("YYYY-MM-DD"),
        },
      };

      return res.status(200).json({
        message: "Berhasil mendapatkan rekap absensi siswa.",
        data: recap,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Gagal mendapatkan rekap absensi siswa",
        error: error.message,
      });
    }
  }
}

export default new RecapController();
