import express from "express";

const router = express.Router();

//Get
router.get("/", (req, res) => {
  res.send("Ini adalah API Absensi!");
});

//Login
router.post("/api/v1/login", authController.login);

module.exports = router;

export default router;
