import moment from "moment";
import RfidCard from "../Models/rfidcard.js";
import User from "../Models/user.js";
import Absence from "../Models/absence.js";
import { Op } from "sequelize";

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
      const schoolEndTime = 15 * 60; // 15:00 PM

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
        school_class_id: rfidCard.user.school_class_id,
        day: moment().format("dddd"),
        time_in: moment().toDate(),
        time_out: null,
        info: statusTerlambat ? "Terlambat" : null,
        type: "hadir",
        status: "approved",
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
}

export default new AbsenceController();
