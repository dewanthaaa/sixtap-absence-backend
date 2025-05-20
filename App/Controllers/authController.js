import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../Models/user.js"; // Pastikan path dan ekstensi sesuai
import Role from "../Models/role.js"; // Jika perlu di-include manual

class AuthController {
  async login(req, res) {
    try {
      const { identifier, password } = req.body;
      console.log(identifier);
      console.log(password);

      // Validasi input
      if (!identifier) {
        return res.status(422).json({
          message: "Validasi gagal.",
          errors: {
            identifier: "Kolom identifier (NIS atau email) wajib diisi.",
          },
        });
      }

      if (!password) {
        return res.status(422).json({
          message: "Validasi gagal.",
          errors: {
            password: "Kolom password wajib diisi.",
          },
        });
      }

      const isNumeric = /^\d+$/.test(identifier);

      // Cari user berdasarkan NIS atau email, sertakan relasi ke role
      let user = await User.findOne({
        where: isNumeric ? { nis: identifier } : { email: identifier },
        include: [{ model: Role, as: "role" }],
      });

      // Jika user tidak ditemukan
      if (!user) {
        return res.status(401).json({
          message: isNumeric ? "NIS tidak terdaftar" : "Email tidak terdaftar",
        });
      }

      // Validasi peran pengguna
      const userRoleName = user.role?.name?.toLowerCase() || "";
      let validRole = false;

      if (isNumeric) {
        validRole = userRoleName !== "siswa";
      } else {
        validRole = ![
          "admin",
          "petinggi sekolah",
          "penjaga kantin",
          "wali kelas",
        ].includes(userRoleName);
      }

      if (validRole) {
        return res.status(401).json({
          message: isNumeric
            ? "NIS hanya untuk login siswa"
            : "Email hanya untuk login Admin, Petinggi Sekolah, Penjaga Kantin, atau Wali Kelas",
        });
      }

      // Cek password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          message: "Password salah",
        });
      }

      // Buat token JWT
      const token = jwt.sign(
        { id: user.id, nis: user.nis, email: user.email },
        process.env.JWT_SECRET || "default_secret_key",
        { expiresIn: "1h" }
      );

      // Respon sukses
      return res.status(200).json({
        message:
          userRoleName === "siswa"
            ? "Login siswa berhasil"
            : `Login berhasil sebagai ${userRoleName}`,
        access_token: token,
        data: { user },
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({
        message: "Terjadi kesalahan pada server",
      });
    }
  }
}

export default new AuthController();
