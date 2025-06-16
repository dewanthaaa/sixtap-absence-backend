import moment from "moment";
import { Op } from "sequelize";
import RfidCard from "../Models/rfidcard.js";
import User from "../Models/user.js";
import Absence from "../Models/absence.js";
import SchoolClass from "../Models/schoolclass.js";
import { sendAbsenceNotificationEmail } from "../Services/absenceNotificationService.js";

class AbsenceController {
  async handleTapIn(req, res) {
    const { card_uid } = req.body;
    const isTestMode = process.env.NODE_ENV === "testing";

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
          attributes: [
            "id",
            "name",
            "email",
            "nis",
            "batch",
            "photo_filename",
            "schoolclass_id",
          ],
          include: {
            model: SchoolClass,
            as: "schoolClass",
            attributes: ["class_name"],
          },
        },
      });

      if (!rfidCard || !rfidCard.user) {
        return res
          .status(404)
          .json({ message: "Kartu tidak valid atau belum terdaftar" });
      }

      const user = rfidCard.user;
      console.log("DEBUG USER:", user);

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
        const schoolEndTime = 24 * 60; // 15:00 PM

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

      await sendAbsenceNotificationEmail(user, absence, "tapin").catch(
        console.error
      );

      // Siapkan URL foto siswa
      const photoUrl = user.photo_filename
        ? `${req.protocol}://${req.get("host")}/uploads/photos/${
            user.photo_filename
          }`
        : null;

      const userInfo = {
        id: user.id,
        name: user.name,
        nis: user.nis,
        batch: user.batch,
        class_name: user.schoolClass?.class_name || null,
        photo_url: photoUrl,
      };

      return res.status(200).json({
        message: "Absensi masuk berhasil",
        data: absence,
        user: userInfo,
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
        include: {
          model: User,
          as: "user",
          attributes: [
            "id",
            "name",
            "email",
            "nis",
            "batch",
            "photo_filename",
            "schoolclass_id",
          ],
          include: {
            model: SchoolClass,
            as: "schoolClass",
            attributes: ["class_name"],
          },
        },
      });

      if (!rfidCard || !rfidCard.user) {
        return res
          .status(404)
          .json({ message: "Kartu tidak valid atau belum terdaftar." });
      }

      const user = rfidCard.user;

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

      await sendAbsenceNotificationEmail(user, todayAbsence, "tapout");

      // Siapkan URL foto siswa
      const photoUrl = user.photo_filename
        ? `${req.protocol}://${req.get("host")}/uploads/photos/${
            user.photo_filename
          }`
        : null;

      const userInfo = {
        id: user.id,
        name: user.name,
        nis: user.nis,
        batch: user.batch,
        class_name: user.schoolClass?.class_name || null,
        photo_url: photoUrl,
      };

      return res.status(200).json({
        message: "Absensi pulang berhasil",
        data: todayAbsence,
        user: userInfo,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  }
}

export default new AbsenceController();
