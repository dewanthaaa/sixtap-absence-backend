import { Op } from "sequelize";
import Absence from "../Models/absence.js";

/**
 * Hitung statistik kehadiran (hadir, sakit, izin, alpa) siswa-siswa dalam daftar studentIds
 * selama rentang waktu tertentu.
 *
 * @param {Array} studentIds - Array berisi ID siswa
 * @param {String} startDate - Tanggal mulai (opsional)
 * @param {String} endDate - Tanggal akhir (opsional)
 * @returns {Object} Statistik total kehadiran
 */
const calculateAttendanceStatistics = async (
  studentIds,
  startDate,
  endDate
) => {
  const whereConditions = {
    user_id: { [Op.in]: studentIds },
  };

  // Jika disediakan, tambahkan filter tanggal
  if (startDate || endDate) {
    whereConditions.time_in = {};
    if (startDate) {
      whereConditions.time_in[Op.gte] = new Date(startDate);
    }
    if (endDate) {
      whereConditions.time_in[Op.lte] = new Date(endDate);
    }
  }

  // Ambil seluruh data absensi siswa sesuai filter
  const absences = await Absence.findAll({
    where: whereConditions,
    attributes: ["absence_status"],
  });

  // Hitung jumlah berdasarkan status
  const statistics = {
    hadir: 0,
    sakit: 0,
    izin: 0,
    alpa: 0,
  };

  absences.forEach((absence) => {
    const status = absence.absence_status?.toLowerCase(); // Jaga-jaga jika uppercase
    if (["hadir", "sakit", "izin", "alpa"].includes(status)) {
      statistics[status]++;
    }
  });

  return statistics;
};

export default calculateAttendanceStatistics;
