import express from "express";
import AuthController from "../Controllers/authController.js";
import checkRole from "../Middlewares/checkRole.js";
import UserManagementController from "../Controllers/userManagementController.js";
import CardManagementController from "../Controllers/cardManagementController.js";
import RecapController from "../Controllers/recapController.js";
import absenceController from "../Controllers/absenceController.js";
import authenticateToken from "../Middlewares/authenticateToken.js";
import recapController from "../Controllers/recapController.js";

const router = express.Router();

//Auth
router.post("/login", AuthController.login);
router.post("/logout", authenticateToken, AuthController.logout);

//Manajemen Pengguna (Admin)
router.get(
  "/users",
  authenticateToken,
  checkRole("admin"),
  UserManagementController.index
);
router.get(
  "/users/:id",
  authenticateToken,
  checkRole("admin"),
  UserManagementController.userDetail
);
router.post(
  "/users",
  authenticateToken,
  checkRole("admin"),
  UserManagementController.create
);
router.put(
  "/users/:id",
  authenticateToken,
  checkRole("admin"),
  UserManagementController.update
);
router.put(
  "/users/update-profile",
  authenticateToken,
  checkRole(["siswa", "petinggi sekolah", "penjaga kantin", "wali kelas"]),
  UserManagementController.updateUserProfile
);
router.delete(
  "/users/:id",
  authenticateToken,
  checkRole("admin"),
  UserManagementController.destroy
);
router.post(
  "/users/:id/reset-password",
  authenticateToken,
  checkRole("admin"),
  UserManagementController.resetPassword
);

//Manajemen Kartu
router.post(
  "/card/check-user",
  authenticateToken,
  checkRole(["admin", "penjaga kantin", "siswa"]),
  CardManagementController.checkUserByNis
);
router.post(
  "/card/check-card",
  authenticateToken,
  checkRole(["admin", "penjaga kantin", "siswa"]),
  CardManagementController.checkCardByUid
);
router.post(
  "/card/activate",
  authenticateToken,
  checkRole("admin"),
  CardManagementController.cardActivation
);
router.post(
  "/card/block",
  authenticateToken,
  checkRole("admin"),
  CardManagementController.blockCard
);
//Ganti Kartu baru dengan wallet yang sama (Kasus kartu hilang)
router.post(
  "/card/renew",
  authenticateToken,
  checkRole("admin"),
  CardManagementController.renewCard
);

//Proses Absensi : Tap masuk
router.post("/tap-in", absenceController.handleTapIn);

//Proses Absensi : Tap pulang
router.post("/tap-out", absenceController.handleTapOut);

//Proses Absensi : Lihat Status Absensi
router.get(
  "/status-absen/:id",
  // checkRole(["admin", "petinggi sekolah"]),
  absenceController.getStudentAbsenceHistory
);

//Proses Absensi : Mengambil Data Histori Absensi Yang Dicari Berdasarkan Absence Id
router.get("/absence/:id", absenceController.getAbsenceHistoryById);

//Proses Absensi : Siswa Login Lihat Status Absensi Hari ini
router.get(
  "/absence/today",
  authenticateToken,
  checkRole(["admin", "siswa"]),
  absenceController.getStudentAbsenceHistoryToday
);

//Proses Absensi : Wali Kelas Lihat Semua Histori Absensi Hari ini Berdasarkan Kelas Id
router.get(
  "/absence/by-class",
  authenticateToken,
  absenceController.getAbsenceHistoryByClass
);

//Proses Absensi : Wali Kelas Lihat Histori Absensi Hari ini Berdasarkan Kelas Id
router.get(
  "/absence/by-class/today",
  authenticateToken,
  checkRole("wali kelas"),
  absenceController.getTodayAbsenceByHomeroomClass
);

//Proses Absensi : Wali Kelas Edit Histori Absensi Harian
router.put(
  "/edit-absence/:id",
  authenticateToken,
  checkRole("wali kelas"),
  absenceController.editTodayAbsenceStatus
);

//Rekap Absensi : Semua Rekap Absensi Siswa
router.get(
  "/recap-absence",
  authenticateToken,
  checkRole("admin"),
  RecapController.allAbsenceRecap
);

//Rekap Absensi (Masih Salah, Belum Dicoba)
// router.post(
//   "/absence",
//   AuthenticateToken,
//   checkRole(["admin", "wali kelas", "petinggi sekolah"]),
//   RecapController.recapAbsence
// );
export default router;
