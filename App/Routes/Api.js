import express from "express";
import AuthController from "../Controllers/authController.js";
import AuthenticateToken from "../Middlewares/authenticateToken.js";
import checkRole from "../Middlewares/checkRole.js";
import UserManagementController from "../Controllers/userManagementController.js";
import CardManagementController from "../Controllers/cardManagementController.js";
import RecapController from "../Controllers/recapController.js";
import absenceController from "../Controllers/absenceController.js";

const router = express.Router();

//Auth
router.post("/login", AuthController.login);
router.post("/logout", AuthenticateToken, AuthController.logout);

//Manajemen Pengguna (Admin)
router.get(
  "/users",
  AuthenticateToken,
  checkRole("admin"),
  UserManagementController.index
);
router.get(
  "/users/:id",
  AuthenticateToken,
  checkRole("admin"),
  UserManagementController.userDetail
);
router.post(
  "/users",
  AuthenticateToken,
  checkRole("admin"),
  UserManagementController.create
);
router.put(
  "/users/:id",
  AuthenticateToken,
  checkRole("admin"),
  UserManagementController.update
);
router.delete(
  "/users/:id",
  AuthenticateToken,
  checkRole("admin"),
  UserManagementController.destroy
);
router.post(
  "/users/:id/reset-password",
  AuthenticateToken,
  checkRole("admin"),
  UserManagementController.resetPassword
);

//Manajemen Kartu
router.post(
  "/card/check-user",
  AuthenticateToken,
  checkRole(["admin", "penjaga kantin", "siswa"]),
  CardManagementController.checkUserByNis
);
router.post(
  "/card/check-card",
  AuthenticateToken,
  checkRole(["admin", "penjaga kantin", "siswa"]),
  CardManagementController.checkCardByUid
);
router.post(
  "/card/activate",
  AuthenticateToken,
  checkRole("admin"),
  CardManagementController.cardActivation
);
router.post(
  "/card/block",
  AuthenticateToken,
  checkRole("admin"),
  CardManagementController.blockCard
);
//Ganti Kartu baru dengan wallet yang sama (Kasus kartu hilang)
router.post(
  "/card/renew",
  AuthenticateToken,
  checkRole("admin"),
  CardManagementController.renewCard
);

//Proses Absensi : Tap masuk
router.post("/tap-in", absenceController.handleTapIn);

//Proses Absensi : Tap pulang
router.post("/tap-out", absenceController.handleTapOut);

//Proses Absensi : Lihat Status Absensi
router.get("/status-absen/:id", absenceController.getStudentAbsenceHistory);

//Proses Absensi : Siswa Login Lihat Status Absensi Hari ini
router.get(
  "/absence/today",
  AuthenticateToken,
  checkRole(["admin", "siswa"]),
  absenceController.getAbsenceHistoryToday
);

//Rekap Absensi (Masih Salah, Belum Dicoba)
// router.post(
//   "/absence",
//   AuthenticateToken,
//   checkRole(["admin", "wali kelas", "petinggi sekolah"]),
//   RecapController.recapAbsence
// );
export default router;
