import moment from "moment";
import RfidCard from "../Models/rfidcard.js";
import User from "../Models/user.js";
import Absence from "../Models/absence.js";
import { Op } from "sequelize";
import SchoolClass from "../Models/schoolclass.js";

class AbsenceController {
  async handleTapIn(req, res) {
    const { card_uid } = req.body;

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
          attributes: ["id", "name", "nis", "batch", "schoolclass_id"],
        },
      });

      if (!rfidCard || !rfidCard.user) {
        return res
          .status(404)
          .json({ message: "Kartu tidak valid atau belum terdaftar" });
      }

      const user = rfidCard.user;
      console.log(user);
      //   const today = moment().format("YYYY-MM-DD");

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
      const currentHour = moment().hour();
      const currentMinute = moment().minute();
      const currentTime = currentHour * 60 + currentMinute; // minutes from midnight
      const schoolStartTime = 7 * 60; // 7:00 AM
      const schoolEndTime = 23 * 60; // 23:00 PM

      if (currentTime < schoolStartTime || currentTime > schoolEndTime) {
        return res.status(400).json({
          success: false,
          message: "Tap-in diluar jam sekolah (07:00 - 15:00)",
        });
      }

      const statusTerlambat = moment().isAfter(moment().hour(6).minute(30));
      const absence = await Absence.create({
        user_id: user.id,
        rfid_card_id: rfidCard.id,
        schoolclass_id: user.schoolclass_id,
        day: moment().format("dddd"),
        time_in: moment().toDate(),
        time_out: null,
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
      await todayAbsence.save();
      console.log(todayAbsence.time_out);

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
              attributes: ["day", "time_in", "time_out"],
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
    try {
      const studentId = req.user.id; // Ambil dari token (middleware auth)

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

  async getAbsenceHistoryByClass(req, res) {}
}

export default new AbsenceController();
