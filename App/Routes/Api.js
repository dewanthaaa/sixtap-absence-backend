import express from "express";
import AuthController from "../Controllers/authController.js";

const router = express.Router();

//Get
router.get("/", (req, res) => {
  res.send("Ini adalah API Absensi!");
});

//Login
router.post("/api/v1/login", AuthController.login);

module.exports = router;

export default router;
