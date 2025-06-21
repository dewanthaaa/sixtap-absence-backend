import moment from "moment";
import { Op } from "sequelize";
import RfidCard from "../Models/rfidcard.js";
import User from "../Models/user.js";
import Absence from "../Models/absence.js";
import SchoolClass from "../Models/schoolclass.js";
import { sendAbsenceNotificationEmail } from "./absenceNotificationService.js";

const AbsenceService = {
  async processTapIn(card_uid, req) {
    const isTestMode = process.env.NODE_ENV === "testing";

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
      return {
        status: 404,
        body: { message: "Kartu tidak valid atau belum terdaftar" },
      };
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

    if (todayAbsence) {
      return {
        status: 400,
        body: {
          message: "Kamu sudah absen hari ini.",
          data: todayAbsence,
        },
      };
    }

    if (!isTestMode) {
      const currentHour = moment().hour();
      const currentMinute = moment().minute();
      const currentTime = currentHour * 60 + currentMinute;
      const schoolStartTime = 7 * 60;
      const schoolEndTime = 24 * 60;

      if (currentTime < schoolStartTime || currentTime > schoolEndTime) {
        return {
          status: 400,
          body: {
            success: false,
            message: "Tap-in diluar jam sekolah (07:00 - 15:00)",
          },
        };
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

    return {
      status: 200,
      body: {
        message: "Absensi masuk berhasil",
        data: absence,
        user: userInfo,
      },
    };
  },

  async processTapOut(card_uid, req) {
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
      return {
        status: 404,
        body: { message: "Kartu tidak valid atau belum terdaftar." },
      };
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
      return {
        status: 400,
        body: { message: "Belum melakukan absen masuk." },
      };
    }

    if (todayAbsence.time_out) {
      return {
        status: 400,
        body: { message: "Sudah melakukan absen pulang hari ini." },
      };
    }

    todayAbsence.time_out = moment().toDate();
    todayAbsence.date = new Date();
    await todayAbsence.save();

    await sendAbsenceNotificationEmail(user, todayAbsence, "tapout");

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

    return {
      status: 200,
      body: {
        message: "Absensi pulang berhasil",
        data: todayAbsence,
        user: userInfo,
      },
    };
  },
};

export default AbsenceService;
