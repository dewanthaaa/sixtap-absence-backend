import { Op } from "sequelize";
import User from "../Models/user.js";
import Absence from "../Models/Absence.js";
import Role from "../Models/role.js";

class AttendanceRecapController {
  async recap(req, res) {
    try {
      const { month, year } = req.query;

      // Validasi bulan dan tahun
      const targetMonth = parseInt(month);
      const targetYear = parseInt(year);

      if (!targetMonth || !targetYear || targetMonth < 1 || targetMonth > 12) {
        return res.status(400).json({
          message:
            "Parameter 'month' dan 'year' harus valid (contoh: month=5&year=2025)",
        });
      }

      // Ambil semua user dengan role "siswa"
      const students = await User.findAll({
        where: {},
        include: [
          {
            model: Role,
            as: "role",
            where: { role_name: "siswa" },
          },
          {
            model: Absence,
            as: "absences",
            required: false,
            where: {
              createdAt: {
                [Op.between]: [
                  new Date(targetYear, targetMonth - 1, 1),
                  new Date(targetYear, targetMonth, 0, 23, 59, 59),
                ],
              },
            },
          },
        ],
        order: [["name", "ASC"]],
      });

      // Format respons
      const result = students.map((student) => {
        return {
          id: student.id,
          name: student.name,
          nis: student.nis,
          email: student.email,
          absences: student.absences.map((a) => ({
            id: a.id,
            status: a.status,
            timestamp: a.createdAt,
          })),
          totalPresence: student.absences.filter((a) => a.status === "hadir")
            .length,
        };
      });

      return res.status(200).json({
        message: `Rekap absensi siswa bulan ${targetMonth}-${targetYear}`,
        data: result,
      });
    } catch (error) {
      console.error("Rekap absensi error:", error);
      return res.status(500).json({
        message: "Terjadi kesalahan saat mengambil data rekap absensi",
        error: error.message,
      });
    }
  }
}

export default new AttendanceRecapController();
