import express from "express";
import AuthController from "../Controllers/authController.js";
import checkRole from "../Middlewares/checkRole.js";
import UserManagementController from "../Controllers/userManagementController.js";
import CardManagementController from "../Controllers/cardManagementController.js";
import RecapController from "../Controllers/recapController.js";
import AbsenceController from "../Controllers/absenceController.js";
import authenticateToken from "../Middlewares/authenticateToken.js";

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

router.get(
  "/users-detail/profile",
  authenticateToken,
  checkRole([
    "admin",
    "siswa",
    "petinggi sekolah",
    "penjaga kantin",
    "wali kelas",
  ]),
  UserManagementController.userProfile
);

router.put(
  "/users-detail/update-profile",
  authenticateToken,
  checkRole(["siswa", "petinggi sekolah", "penjaga kantin", "wali kelas"]),
  UserManagementController.updateUserProfile
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

//Absensi Harian
//Proses Absensi : Tap masuk
router.post("/tap-in", AbsenceController.handleTapIn);

//Proses Absensi : Tap pulang
router.post("/tap-out", AbsenceController.handleTapOut);

//Histori Absensi
//Proses Absensi : Lihat Status Absensi
router.get(
  "/status-absen/:id",
  // checkRole(["admin", "petinggi sekolah"]),
  AbsenceController.studentAbsenceHistoryById
);

//Proses Absensi : Siswa Login Lihat Status Absensi Hari ini
router.get(
  "/absence/today",
  authenticateToken,
  checkRole("siswa"),
  AbsenceController.onLoginStudentAbsenceHistory
);

//Proses Absensi : Wali Kelas Lihat Semua Histori Absensi Hari ini Berdasarkan Kelas Id
router.get(
  "/absence/by-class",
  authenticateToken,
  AbsenceController.studentAbsenceHistoryByClass
);

//Proses Absensi : Wali Kelas Lihat Histori Absensi Hari ini Berdasarkan Kelas Id
router.get(
  "/absence/by-class/today",
  authenticateToken,
  checkRole("wali kelas"),
  AbsenceController.studentAbsenceHistoryByClassToday
);

//Proses Absensi : Wali Kelas Edit Histori Absensi Harian
router.put(
  "/edit-absence/:id",
  authenticateToken,
  checkRole("wali kelas"),
  AbsenceController.editStudentAbsenceHistoryToday
);

//Cek lagi mulai dari sini untuk pengambilan histori absensi
//Histori Absensi : Mengambil Semua Data Histori Absensi
router.get(
  "/absence-history",
  checkRole(["admin", "petinggi sekolah"]),
  AbsenceController.allStudentAbsenceHistory
);

//Proses Absensi : Mengambil Data Histori Absensi Yang Dicari Berdasarkan Absence Id
router.get(
  "/absence-history/by-id/:id",
  authenticateToken,
  checkRole(["admin", "siswa", "wali kelas"]),
  AbsenceController.studentAbsenceHistoryByAbsenceId
);

//Rekap Absensi : Semua Rekap Absensi Siswa
router.get(
  "/recap-absence",
  authenticateToken,
  checkRole("admin"),
  RecapController.allAbsenceRecap
);

//Rekap Absensi : Rekap Absensi Siswa Berdasarkan Kelas
router.get(
  "/recap-absence-class/:id",
  authenticateToken,
  checkRole(["admin", "wali kelas"]),
  RecapController.classAbsenceRecap
);

//Rekap Absensi : Rekap Absensi Siswa Berdasarkan Id User nya
router.get(
  "/recap-absence-student/:id",
  authenticateToken,
  checkRole(["admin", "wali kelas"]),
  RecapController.recapAbsenceDetail
);

// Rekap Absensi (Masih Salah, Belum Dicoba)
// router.get(
//   "/absence",
//   authenticateToken,
//   checkRole(["admin", "wali kelas", "petinggi sekolah"]),
//   RecapController.recapAbsenceDetail
// );

export default router;
