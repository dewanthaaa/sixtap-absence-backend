import express from "express";
import AuthController from "../Controllers/authController.js";
import AuthenticateToken from "../Middleware/authenticateToken.js";
import UserManagementController from "../Controllers/userManagementController.js";
import CardManagemenController from "../Controllers/cardManagementController.js";
import CheckRole from "../Middleware/checkRole.js";

const router = express.Router();

//Auth
router.post("/login", AuthController.login);
router.post("/logout", AuthenticateToken, AuthController.logout);

//Manajemen Pengguna (Admin)
router.get('/users', AuthenticateToken, CheckRole('admin'), UserManagementController.index);
router.get('/users/:id', AuthenticateToken,CheckRole('admin'), UserManagementController.userDetail);
router.post('/users', AuthenticateToken,CheckRole('admin'), UserManagementController.create);
router.put('/users/:id', AuthenticateToken,CheckRole('admin'), UserManagementController.update);
router.delete('/users/:id', AuthenticateToken,CheckRole('admin'), UserManagementController.destroy);
router.post('/users/:id/reset-password', AuthenticateToken,CheckRole('admin'),  UserManagementController.resetPassword);

//Manajemen Kartu
router.post('/card/check-user', AuthenticateToken, CheckRole(['admin', 'penjaga kantin', 'siswa']), CardManagemenController.checkUserByNis);
router.post('/card/check-card', AuthenticateToken, CheckRole(['admin', 'penjaga kantin', 'siswa']), CardManagemenController.checkCardByUid);
router.post('/card/activate', AuthenticateToken, CheckRole('admin'), CardManagemenController.cardActivation);
router.post('/card/block', AuthenticateToken, CheckRole('admin'), CardManagemenController.blockCard);
//Ganti Kartu baru dengan wallet yang sama (Kasus kartu hilang)
router.post('/card/renew', AuthenticateToken, CheckRole('admin'), CardManagemenController.renewCard);
export default router;
