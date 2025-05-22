import { Op, fn, col, where } from "sequelize";
import Absence from "../Models/Absence.js";
import User from "../Models/user.js";
import Role from "../Models/role.js";
import SchoolClass from "../Models/schoolclass.js";

class RecapController {
  async recapAbsence(req, res) {
    try {
      // Ambil bulan dan tahun dari body, bukan query
      const { month, year } = req.body;

      if (!month || !year) {
        return res.status(400).json({
          message: "Parameter bulan dan tahun wajib disertakan.",
        });
      }

      // Ambil semua user yang memiliki role 'siswa'
      const students = await User.findAll({
        include: [
          {
            model: Role,
            as: "role",
            where: { role_name: "siswa" },
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
    } catch (error) {
      console.error("Error saat merekap absensi:", error);
      return res.status(500).json({
        message: "Terjadi kesalahan saat merekap absensi.",
        error: error.message,
      });
    }
  }
}

export default new RecapController();
