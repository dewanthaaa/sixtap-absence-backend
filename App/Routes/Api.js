import express from "express";
import AuthController from "../Controllers/authController.js";

const router = express.Router();

//Login
router.post("/login", AuthController.login);

export default router;
