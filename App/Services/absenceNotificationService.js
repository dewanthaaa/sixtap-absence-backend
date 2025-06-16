// services/notificationService.js
import nodemailer from "nodemailer";
import AbsenceNotification from "../Models/absence-notif.js";
import moment from "moment";

// Mapping enum value ke label yang ramah untuk manusia
const NOTIF_TYPE_LABELS = {
  tapin: "Absen Masuk",
  tapout: "Absen Pulang",
};

export async function sendAbsenceNotificationEmail(user, absence, type) {
  const notifLabel = NOTIF_TYPE_LABELS[type];

  // Validasi jika type tidak dikenali
  if (!notifLabel) {
    console.warn(`Tipe notifikasi "${type}" tidak dikenali.`);
    return;
  }

  const subject = `Notifikasi ${notifLabel} - ${user.name}`;
  const time = type === "tapin" ? absence.time_in : absence.time_out;

  const message = `
Halo Orang Tua/Wali,

Siswa atas nama ${user.name} (${user.nis}) dari kelas ${
    user.schoolClass?.class_name || "-"
  } telah melakukan ${notifLabel.toLowerCase()} pada:

📅 Tanggal: ${moment(absence.date).format("DD-MM-YYYY")}
⏰ Waktu: ${moment(time).format("HH:mm:ss")}
📌 Status: ${absence.absence_status}
ℹ️ Info: ${absence.info || "-"}

Notifikasi ini dikirim otomatis oleh Sistem Absensi Siswa.
`;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // atau SMTP lain
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Sistem Absensi" <${process.env.EMAIL_USER}>`,
      to: user.email, // make sure this field exists
      subject,
      text: message,
    });

    await AbsenceNotification.create({
      user_id: user.id,
      absence_id: absence.id,
      message,
      notif_type: type, // tetap simpan "tapin" / "tapout"
      notif_status: "berhasil",
      sent_at: new Date(),
    });
  } catch (error) {
    console.error("Gagal kirim notifikasi:", error.message);

    await AbsenceNotification.create({
      user_id: user.id,
      absence_id: absence.id,
      message: error.message,
      notif_type: type,
      notif_status: "gagal",
      sent_at: new Date(),
    });
  }
}
