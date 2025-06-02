import { Op, fn, col, where } from "sequelize";
import Absence from "../Models/absence.js";
import User from "../Models/user.js";
import Role from "../Models/role.js";
import SchoolClass from "../Models/schoolclass.js";

class RecapController {
  async allAbsenceRecap(req, res) {
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
            attributes: ["absence_status"],
          },
        ],
        order: [["name", "ASC"]], // optional: urutkan berdasarkan nama
      });

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

  async recapAbsenceDetail(req, res) {
    // Ambil semua user yang memiliki role 'siswa'
    const students = await User.findAll({
      include: [
        {
          model: Role,
          as: "role",
          where: { role_id: "2" }, //bagian ini bisa lebih diotomasi lagi
        },
        {
          model: SchoolClass,
          as: "schoolClass",
        },
      ],
    });

    // Ambil data absensi siswa hanya untuk bulan dan tahun tertentu
    const absences = await Absence.findAll({
      where: where(fn("MONTH", col("created_at")), month),
      [Op.and]: [where(fn("YEAR", col("created_at")), year)],
    });

    // Buat rekap per siswa
    const rekap = students.map((student) => {
      const userAbsences = absences.filter((ab) => ab.user_id === student.id);

      const statusCount = {
        hadir: 0,
        izin: 0,
        sakit: 0,
        alfa: 0,
      };

      userAbsences.forEach((ab) => {
        const status = ab.status.toLowerCase();
        if (statusCount[status] !== undefined) {
          statusCount[status]++;
        }
      });

      return {
        id: student.id,
        user_id: students.user_id,
        name: student.name,
        nis: student.nis,
        class: student.schoolclass?.class_name || "-",
        total: userAbsences.length,
        hadir: statusCount.hadir,
        izin: statusCount.izin,
        sakit: statusCount.sakit,
        alfa: statusCount.alfa,
      };
    });

    return res.status(200).json({
      message: "Rekap absensi siswa berhasil diambil.",
      data: rekap,
    });
  }
  catch(error) {
    console.error("Error saat merekap absensi:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan saat merekap absensi.",
      error: error.message,
    });
  }
}

export default new RecapController();
