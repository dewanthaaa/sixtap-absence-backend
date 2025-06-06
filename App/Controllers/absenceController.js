import moment from "moment";
import { Op } from "sequelize";
import RfidCard from "../Models/rfidcard.js";
import User from "../Models/user.js";
import Absence from "../Models/absence.js";
import SchoolClass from "../Models/schoolclass.js";
import calculateAttendanceStatistics from "../Helper/attendanceStatistic.js";

class AbsenceController {
  async handleTapIn(req, res) {
    const { card_uid } = req.body;
    const isTestMode =
      process.env.NODE_ENV === "testing";

    try {
      // Cek apakah kartu RFID terdaftar dan aktif
      const rfidCard = await RfidCard.findOne({
        where: {
          card_uid,
          is_active: true,
          blocked_at: { [Op.is]: null },
        },
        include: {
          model: User,
          as: "user",
          attributes: ["id", "name", "nis", "batch", "photo", "schoolclass_id"],
        },
      });

      if (!rfidCard || !rfidCard.user) {
        return res
          .status(404)
          .json({ message: "Kartu tidak valid atau belum terdaftar" });
      }

      const user = rfidCard.user;
      console.log(user);

      // Cari record absence hari ini berdasarkan rfid_card_id (ini coba dibuat variabel hari ini-nya)
      const todayAbsence = await Absence.findOne({
        where: {
          rfid_card_id: rfidCard.id,
          createdAt: {
            [Op.gte]: moment().startOf("day").toDate(),
            [Op.lte]: moment().endOf("day").toDate(),
          },
        },
      });

      if (todayAbsence) {
        return res
          .status(400)
          .json({ message: "Kamu sudah absen hari ini.", data: todayAbsence });
      }

      // Validasi school hours (7:00 AM - 12:00 PM)
      if (!isTestMode) {
        const currentHour = moment().hour();
        const currentMinute = moment().minute();
        const currentTime = currentHour * 60 + currentMinute; // minutes from midnight
        const schoolStartTime = 7 * 60; // 7:00 AM
        const schoolEndTime = 15 * 60; // 15:00 PM

        if (currentTime < schoolStartTime || currentTime > schoolEndTime) {
          return res.status(400).json({
            success: false,
            message: "Tap-in diluar jam sekolah (07:00 - 15:00)",
          });
        }
      }

      const statusTerlambat = moment().isAfter(moment().hour(6).minute(30));
      const absence = await Absence.create({
        user_id: user.id,
        rfid_card_id: rfidCard.id,
        schoolclass_id: user.schoolclass_id,
        day: moment().format("dddd"),
        time_in: moment().toDate(),
        time_out: null,
        date: new Date(),
        info: statusTerlambat ? "Terlambat" : null,
        absence_status: "hadir",
        card_status: "approved",
      });

      return res.status(200).json({
        message: "Absensi masuk berhasil",
        data: absence,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  }

  async handleTapOut(req, res) {
    const { card_uid } = req.body;

    try {
      const rfidCard = await RfidCard.findOne({
        where: { card_uid, is_active: true },
        include: [
          { model: User, as: "user", attributes: ["name", "schoolclass_id"] },
        ],
      });

      if (!rfidCard || !rfidCard.user) {
        return res
          .status(404)
          .json({ message: "Kartu tidak valid atau belum terdaftar." });
      }

      const todayAbsence = await Absence.findOne({
        where: {
          rfid_card_id: rfidCard.id,
          createdAt: {
            [Op.gte]: moment().startOf("day").toDate(),
            [Op.lte]: moment().endOf("day").toDate(),
          },
        },
      });

      if (!todayAbsence) {
        return res
          .status(400)
          .json({ message: "Belum melakukan absen masuk." });
      }

      if (todayAbsence.time_out) {
        return res
          .status(400)
          .json({ message: "Sudah melakukan absen pulang hari ini." });
      }

      todayAbsence.time_out = moment().toDate();
      todayAbsence.date = new Date();
      await todayAbsence.save();

      return res.status(200).json({
        message: "Absensi pulang berhasil",
        data: todayAbsence,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  }

  async getStudentAbsenceHistory(req, res) {
    const { id } = req.params;

    try {
      if (id) {
        const student = await User.findByPk(id, {
          attributes: ["id", "name", "nis", "batch", "photo"],
          include: [
            {
              model: Absence,
              as: "absences",
              attributes: ["day", "time_in", "time_out", "date"],
              include: [
                {
                  model: SchoolClass,
                  as: "schoolClass",
                  attributes: ["class_name"],
                },
              ],
            },
          ],
        });

        if (!student) {
          throw { message: "Data kehadiran tidak ditemukan" };
        }

        return res.status(200).json({
          success: true,
          message: "Sukses melihat kehadiran",
          data: student,
        });
      }
    } catch (error) {
      console.error("Get status error:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async getStudentAbsenceHistoryToday(req, res) {
    console.log("Masuk ke getStudentAbsenceHistoryToday");

    try {
      const studentId = req.user.id; // Ambil dari token (middleware auth)
      console.log(studentId);

      // Cari data siswa
      const student = await User.findOne({
        where: { id: studentId },
        attributes: ["id", "name", "nis", "schoolclass_id"],
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Siswa tidak ditemukan",
        });
      }

      const todayStart = moment().startOf("day").toDate();
      const todayEnd = moment().endOf("day").toDate();

      // Cari data absen berdasarkan user_id dan tanggal hari ini
      const attendance = await Absence.findOne({
        where: {
          user_id: student.id,
          time_in: {
            [Op.between]: [todayStart, todayEnd],
          },
        },
        attributes: ["id", "time_in", "time_out", "absence_status", "info"],
      });

      return res.status(200).json({
        success: true,
        data: {
          student: {
            name: student.name,
            nis: student.nis,
            classId: student.schoolclass_id,
          },
          attendance: attendance
            ? {
                timeIn: attendance.time_in,
                timeOut: attendance.time_out,
                date: attendance.date,
                status: attendance.absence_status,
                info: attendance.info,
              }
            : null,
        },
      });
    } catch (error) {
      console.error("Get Absence History Error:", error);
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan di server",
        error: error.message,
      });
    }
  }

  async getAbsenceHistoryByClass(req, res) {
    try {
      const userId = req.user.id; // Dari JWT middleware
      const {
        startDate,
        endDate,
        studentId,
        status,
        page = 1,
        limit = 10,
        sortBy = "created_at",
        sortOrder = "DESC",
      } = req.query;

      // 1. Validasi wali kelas dan ambil data kelas
      const homeRoomTeacher = await User.findOne({
        where: {
          id: userId,
          role_id: 5, // Role wali kelas
        },
        include: [
          {
            model: SchoolClass,
            as: "schoolClass",
            attributes: ["id", "class_name", "class_code"],
          },
        ],
      });

      if (!homeRoomTeacher) {
        return res.status(403).json({
          success: false,
          message: "Akses ditolak. Anda bukan wali kelas.",
        });
      }

      if (!homeRoomTeacher.schoolclass_id) {
        return res.status(400).json({
          success: false,
          message: "Anda belum ditugaskan sebagai wali kelas.",
        });
      }

      // 2. Ambil daftar siswa di kelas
      const students = await User.findAll({
        where: {
          schoolclass_id: homeRoomTeacher.schoolclass_id,
          role_id: { [Op.in]: [1, 2] }, // Assuming 1=siswa, 2=siswa lain
        },
        attributes: ["id", "name", "nis"],
      });

      const studentIds = students.map((student) => student.id);

      if (studentIds.length === 0) {
        return res.status(200).json({
          success: true,
          message: "Tidak ada siswa di kelas ini.",
          data: {
            attendances: [],
            pagination: {},
            statistics: {},
          },
        });
      }

      // 3. Build filter conditions
      const whereConditions = {
        user_id: { [Op.in]: studentIds },
      };

      // Filter berdasarkan tanggal
      if (startDate || endDate) {
        whereConditions.date = {};
        if (startDate) {
          whereConditions.date[Op.gte] = moment(startDate)
            .startOf("day")
            .toDate();
        }
        if (endDate) {
          whereConditions.date[Op.lte] = moment(endDate).endOf("day").toDate();
        }
      }

      // Filter berdasarkan siswa tertentu
      if (studentId) {
        whereConditions.user_id = studentId;
      }

      // Filter berdasarkan status absen
      if (status) {
        whereConditions.status = status;
      }

      // 4. Ambil data absensi dengan pagination
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const attendanceData = await Absence.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "nis"],
            where: {
              schoolclass_id: homeRoomTeacher.schoolclass_id,
            },
          },
        ],
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: offset,
        distinct: true,
      });

      // 5. Hitung statistik kehadiran
      const statistics = await calculateAttendanceStatistics(
        studentIds,
        startDate,
        endDate
      );

      // 6. Format response
      const totalPages = Math.ceil(attendanceData.count / parseInt(limit));

      return res.status(200).json({
        success: true,
        message: "Data histori absen berhasil diambil.",
        data: {
          class: {
            id: homeRoomTeacher.schoolclass_id,
            class_name: homeRoomTeacher.schoolClass?.class_name,
            class_code: homeRoomTeacher.schoolClass?.class_code,
          },
          attendances: attendanceData.rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: attendanceData.count,
            itemsPerPage: parseInt(limit),
            hasNextPage: parseInt(page) < totalPages,
            hasPreviousPage: parseInt(page) > 1,
          },
          statistics,
          filters: {
            startDate,
            endDate,
            studentId,
            status,
          },
        },
      });
    } catch (error) {
      console.error("Error in getClassAttendanceHistory:", error);
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan server.",
        error: error.message,
      });
    }
  }

  //SUDAH DICOBA => AMAN TAPI PERLU DICEK KERAPIHAN KODENYA
  async getTodayAbsenceByHomeroomClass(req, res) {
    try {
      const userId = req.user.id; // Wali kelas dari token

      // Validasi apakah user adalah wali kelas
      const homeroomTeacher = await User.findOne({
        where: { id: userId, role_id: 5 }, // Role wali kelas
      });

      if (!homeroomTeacher || !homeroomTeacher.schoolclass_id) {
        return res.status(403).json({
          success: false,
          message: "Anda tidak memiliki akses sebagai wali kelas.",
        });
      }

      const todayStart = moment().startOf("day").toDate();
      const todayEnd = moment().endOf("day").toDate();

      // Ambil semua data absensi hari ini berdasarkan kelas wali
      const absencesToday = await Absence.findAll({
        where: {
          time_in: {
            [Op.between]: [todayStart, todayEnd],
          },
        },
        include: [
          {
            model: User,
            as: "user",
            where: {
              schoolclass_id: homeroomTeacher.schoolclass_id,
            },
            attributes: ["id", "name", "nis", "photo"],
          },
        ],
        order: [["time_in", "ASC"]],
      });

      return res.status(200).json({
        success: true,
        message: "Data absensi hari ini berhasil diambil.",
        data: absencesToday.map((absence) => ({
          absence_id: absence.id,
          student_id: absence.user.id,
          name: absence.user.name,
          nis: absence.user.nis,
          photo: absence.user.photo,
          time_in: absence.time_in,
          time_out: absence.time_out,
          status: absence.absence_status,
          info: absence.info,
          editable: true, // karena hanya hari ini
        })),
      });
    } catch (error) {
      console.error("Error getTodayAbsenceByHomeroomClass:", error);
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan server.",
        error: error.message,
      });
    }
  }

  //BELUM DICEK DAN DICOBA
  async editTodayAbsenceStatus(req, res) {
    try {
      const userId = req.user.id; // wali kelas
      const { id } = req.params;
      const { status, info } = req.body;

      // Validasi wali kelas
      const teacher = await User.findByPk(userId);
      if (!teacher || teacher.role_id !== 5 || !teacher.schoolclass_id) {
        return res.status(403).json({
          success: false,
          message: "Anda tidak memiliki akses.",
        });
      }

      const absence = await Absence.findByPk(id, {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "nis", "schoolclass_id"],
          },
        ],
      });

      if (!absence) {
        return res
          .status(404)
          .json({ success: false, message: "Absensi tidak ditemukan" });
      }

      // Pastikan absensi adalah milik siswa di kelas wali tersebut
      if (absence.user.schoolclass_id !== teacher.schoolclass_id) {
        return res.status(403).json({
          success: false,
          message: "Data ini bukan dari siswa kelas Anda.",
        });
      }

      // Pastikan hanya bisa edit di hari yang sama
      const isToday = moment(absence.time_in).isSame(moment(), "day");
      if (!isToday) {
        return res.status(403).json({
          success: false,
          message: "Anda hanya bisa mengedit absensi pada hari yang sama.",
        });
      }

      absence.absence_status = status;
      absence.info = info;
      await absence.save();

      return res.status(200).json({
        success: true,
        message: "Status absensi berhasil diubah.",
        data: {
          id: absence.id,
          status: absence.absence_status,
          info: absence.info,
        },
      });
    } catch (error) {
      console.error("Error editTodayAbsenceStatus:", error);
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan server.",
        error: error.message,
      });
    }
  }

  async getAbsenceHistoryById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res
          .status(404)
          .json({ message: "Id Histori Absensi Harus Disertakan" });
      }

      const absence = await Absence.findOne({
        where: { id: id },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["name", "nis"],
          },
        ],
      });

      if (!absence) {
        return res
          .status(404)
          .json({ message: "Histori Absensi Tidak Ditemukan" });
      }

      res.status(200).json({
        success: true,
        message: "Berhasil Melihat Histori Absensi!.",
        data: absence,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Terjadi kesalahan server.",
        error: error.message,
      });
    }
  }
}

export default new AbsenceController();
