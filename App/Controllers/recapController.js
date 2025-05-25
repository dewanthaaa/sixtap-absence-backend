import { Op, fn, col, where } from "sequelize";
import Absence from "../Models/absence.js";
import User from "../Models/user.js";
import Role from "../Models/role.js";
import SchoolClass from "../Models/schoolclass.js";

class RecapController {
  async recapAbsenceAll(req, res) {
    try {
      const { id } = req.params;

      if (id) {
        const rekap = await Absence.findAll({
          attributes: [
            "sum_attendance",
            "sum_sick",
            "sum_permission",
            "sum_alpa",
          ],
          include: [
            {
              model: User,
              as: "users",
              attributes: ["nama"],
            },
          ],
        });
        if (!rekap) throw { message: "Rekap absensi tidak ditemukan" };

        return res.status(200).json({
          status: true,
          message: "Sukses melihat semua rekap absensi",
          data: rekap,
        });
      }
    } catch (error) {
      res.status(400).json({
        status: false,
        message: error.message,
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
