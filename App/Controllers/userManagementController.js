import nodemailer from "nodemailer";
import User from "../Models/user.js";
import Role from "../Models/role.js";
import SchoolClass from "../Models/schoolclass.js";
import RfidCard from "../Models/rfidcard.js";
import Wallet from "../Models/wallet.js";
import bcrypt from "bcrypt";
import generateRandomPassword from "../Helper/generateRandomPassword.js";

const ROLES = {
  admin: 1,
  siswa: 2,
  petinggi_sekolah: 3,
  penjaga_kantin: 4,
  wali_kelas: 5,
};

class UserManagementController {
  async index(req, res) {
    try {
      //nanti panggilnya bisa pake query bisa engga
      //GET /users?page=1&limit=10 atau GET /users?page=2
      // GET /users
      const limit = parseInt(req.query.limit) || 50;
      const page = parseInt(req.query.page) || 1;
      const offset = (page - 1) * limit;

      const users = await User.findAndCountAll({
        include: [
          { model: Role, as: "role" },
          { model: SchoolClass, as: "schoolClass" },
        ],
        limit,
        offset,
        order: [["created_at", "DESC"]],
      });

      if (!users || users.count === 0) {
        return res.status(404).json({ message: "Pengguna tidak ada." });
      }

      res.json({
        message: "Pengguna berhasil didapatkan.",
        data: users.rows,
        pagination: {
          totalData: users.count,
          currentPage: page,
          perPage: limit,
          totalPages: Math.ceil(users.count / limit),
        },
      });
    } catch (error) {
      res.status(500).json({
        message: "Terjadi kesalahan server.",
        error: error.message,
      });
    }
  }

  async userDetail(req, res) {
    const { id } = req.params;
    try {
      const user = await User.findByPk(id, {
        include: [
          { model: Role, as: "role" },
          { model: SchoolClass, as: "schoolClass" },
          { model: RfidCard, as: "rfidCard" },
          { model: Wallet, as: "wallet" },
        ],
      });

      if (!user) {
        return res.status(404).json({ message: "Pengguna tidak ditemukan." });
      }

      res.json({
        message: "Pengguna berhasil didapatkan.",
        data: { user },
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Terjadi kesalahan server.", error: error.message });
    }
  }

  async create(req, res) {
    try {
      const {
        name,
        email,
        password,
        phone,
        nis,
        nip,
        role_id,
        schoolclass_id,
        batch,
        photo,
      } = req.body;

      const existUser = await User.findOne({ where: { email } });
      if (existUser) {
        return res.status(400).json({ message: "Email sudah terdaftar." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        nis: nis || null,
        nip: nip || null,
        role_id,
        schoolclass_id: schoolclass_id || null,
        batch: batch || null,
        photo: photo || null,
      });

      const { password: _, ...responseUser } = user.toJSON(); // Hapus password

      res.status(201).json({
        message: "Pengguna berhasil dibuat.",
        data: { responseUser },
      });
    } catch (error) {
      res.status(500).json({
        message: "Terjadi kesalahan saat membuat pengguna.",
        error: error.message,
      });
    }
  }

  async update(req, res) {
    const { id } = req.params;

    try {
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: "Pengguna tidak ditemukan." });
      }

      const {
        name,
        email,
        phone,
        nis,
        nip,
        role_id,
        schoolclass_id,
        password,
        batch,
        photo,
      } = req.body;

      if (email && email !== user.email) {
        const emailExists = await User.findOne({ where: { email } });
        if (emailExists) {
          return res
            .status(400)
            .json({ message: "Email sudah terdaftar oleh pengguna lain." });
        }
      }

      let updateData = {
        name,
        email,
        phone: phone || null,
        nis: nis || null,
        nip: nip || null,
        role_id,
        schoolclass_id: schoolclass_id || null,
        batch: batch || null,
        photo: photo || null,
      };

      if (password && password.trim() !== "") {
        updateData.password = await bcrypt.hash(password, 10);
      }

      await user.update(updateData);

      res.json({
        message: "Pengguna berhasil diperbarui.",
        data: { user: await user.reload() },
      });
    } catch (error) {
      res.status(500).json({
        message: "Terjadi kesalahan saat memperbarui pengguna.",
        error: error.message,
      });
    }
  }

  async destroy(req, res) {
    const { id } = req.params;

    try {
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: "Pengguna tidak ditemukan." });
      }

      await user.destroy();

      res.json({ message: "Pengguna berhasil dihapus." });
    } catch (error) {
      res.status(500).json({
        message: "Terjadi kesalahan saat menghapus pengguna.",
        error: error.message,
      });
    }
  }

  async resetPassword(req, res) {
    const { id } = req.params;

    try {
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: "Pengguna tidak ditemukan." });
      }

      const newPassword = generateRandomPassword();

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      // Konfigurasi transporter email
      const transporter = nodemailer.createTransport({
        service: "gmail", // atau sesuaikan dengan provider kamu
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Atur isi email
      const mailOptions = {
        from: `"SixTap" <${process.env.EMAIL_USER}>`,
        to: user.email, // ambil email dari data user yang ditemukan
        subject: "Reset Password Akun Anda",
        text: ` Hai ${user.name}, Password akun Anda telah direset. Berikut adalah password baru Anda: ${newPassword}.
        Silakan login ke sistem dan segera ubah password Anda untuk menjaga keamanan akun Anda.
        
        Terima kasih,
        SixTap
        `,
      };

      // Kirim email
      await transporter.sendMail(mailOptions);

      // Response sukses tanpa mengirim password ke frontend
      res.status(200).json({
        message:
          "Password berhasil di-reset dan telah dikirim ke email pengguna.",
      });
    } catch (error) {
      res.status(500).json({
        message: "Terjadi kesalahan saat reset password.",
        error: error.message,
      });
    }
  }

  async updateUserProfile(req, res) {
    try {
      const userId = req.user.id; // From authenticateToken middleware
      const userRoleName = req.user.role_name?.toLowerCase(); // From authenticateToken middleware

      // Find the user first
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User tidak ditemukan",
        });
      }

      // Define allowed fields for each role (using role names)
      const allowedFieldsByRole = {
        "petinggi sekolah": ["nip", "pin", "name", "email", "phone", "photo"],
        "wali kelas": ["nip", "pin", "name", "email", "phone", "photo"],
        "penjaga kantin": ["nip", "pin", "name", "email", "phone"],
        siswa: ["nis", "pin", "name", "email", "phone", "photo", "batch"],
      };

      // Check if user role is allowed to update data
      if (!allowedFieldsByRole[userRoleName]) {
        return res.status(403).json({
          success: false,
          message: "Anda tidak memiliki akses untuk mengupdate data",
        });
      }

      const allowedFields = allowedFieldsByRole[userRoleName];

      // Filter request body to only include allowed fields
      const updateData = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }

      // Check if there's any data to update
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: "Tidak ada data yang akan diupdate",
        });
      }

      // Validate email format if email is being updated
      if (updateData.email && !this.isValidEmail(updateData.email)) {
        return res.status(400).json({
          success: false,
          message: "Format email tidak valid",
        });
      }

      // Check if email is unique (excluding current user)
      if (updateData.email) {
        const existingUser = await User.findOne({
          where: {
            email: updateData.email,
            id: { [Op.ne]: userId }, // Op.ne = not equal
          },
        });

        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: "Email sudah digunakan oleh user lain",
          });
        }
      }

      // Validate NIS uniqueness for students
      if (updateData.nis) {
        const existingNis = await User.findOne({
          where: {
            nis: updateData.nis,
            id: { [Op.ne]: userId },
          },
        });

        if (existingNis) {
          return res.status(400).json({
            success: false,
            message: "NIS sudah digunakan oleh siswa lain",
          });
        }
      }

      // Validate NIP uniqueness for teachers/staff
      if (updateData.nip) {
        const existingNip = await User.findOne({
          where: {
            nip: updateData.nip,
            id: { [Op.ne]: userId },
          },
        });

        if (existingNip) {
          return res.status(400).json({
            success: false,
            message: "NIP sudah digunakan oleh staff lain",
          });
        }
      }

      // Hash PIN if it's being updated
      if (updateData.pin) {
        const bcrypt = require("bcrypt");
        updateData.pin = await bcrypt.hash(updateData.pin, 10);
      }

      // Update the user data
      await user.update(updateData);

      // Get updated user data (excluding sensitive information)
      const updatedUser = await User.findByPk(userId, {
        attributes: { exclude: ["password", "pin"] },
      });

      return res.status(200).json({
        success: true,
        message: "Data berhasil diupdate",
        data: updatedUser,
      });
    } catch (error) {
      console.error("Error updating user data:", error);

      // Handle Sequelize validation errors
      if (error.name === "SequelizeValidationError") {
        const validationErrors = error.errors.map((err) => ({
          field: err.path,
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: validationErrors,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan internal server",
      });
    }
  }

  // Helper method to validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export default new UserManagementController();
