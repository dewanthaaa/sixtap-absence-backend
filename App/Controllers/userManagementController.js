import nodemailer from "nodemailer";
import User from "../Models/user.js";
import Role from "../Models/role.js";
import SchoolClass from "../Models/schoolclass.js";
import RfidCard from "../Models/rfidcard.js";
import Wallet from "../Models/wallet.js";
import bcrypt from "bcrypt";
import Op from "sequelize";
import generateRandomPassword from "../Helper/generateRandomPassword.js";
import isValidEmail from "../Helper/isValidEmail.js";
import fs from "fs";
import path from "path";

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

  async userProfile(req, res) {
    try {
      // Ambil ID user dari payload JWT yang sudah diverifikasi oleh middleware
      const userId = req.user.id;

      // Cari user termasuk relasi ke tabel kelas
      const user = await User.findOne({
        where: { id: userId },
        include: [
          { model: Role, as: "role", attributes: ["role_name"] },
          {
            model: SchoolClass,
            as: "schoolClass",
            attributes: ["class_name"],
          },
          {
            model: RfidCard,
            as: "rfidCard",
            attributes: ["id", "card_uid", "is_active"],
          },
        ],
      });

      if (!user) {
        return res.status(404).json({
          message: "User tidak ditemukan.",
        });
      }

      // Siapkan URL foto
      const photoUrl = user.photo_filename
        ? `${req.protocol}://${req.get("host")}/uploads/photos/${
            user.photo_filename
          }`
        : null;

      let userProfile = {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        phone: user.phone,
        photo: photoUrl,
      };

      // Role 2 = siswa
      if (user.role_id === 2) {
        userProfile = {
          ...userProfile,
          nis: user.nis,
          batch: user.batch,
          pin: user.pin,
          class: [
            {
              class_id: user.schoolclass_id || "-",
              class_name: user.schoolClass?.class_name || "-",
            },
          ],
          rfid_card: [
            {
              id: user.rfidCard?.id,
              card_uid: user.rfidCard?.card_uid,
              is_active: user.rfidCard?.is_active,
            },
          ],
        };
      }

      // Role 5 = wali kelas (misalnya)
      else if (user.role_id === 5) {
        userProfile = {
          ...userProfile,
          nip: user.nip,
          class: [
            {
              class_id: user.schoolclass_id || "-",
              class_name: user.schoolClass?.class_name || "-",
            },
          ],
        };
      }

      // Role lainnya (admin, kepala sekolah, dll)
      else {
        userProfile = {
          ...userProfile,
          nip: user.nip,
        };
      }

      return res.status(200).json({
        message: "Berhasil mengambil data profil user saat ini.",
        data: userProfile,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Terjadi kesalahan saat mengambil profil user.",
        error: error.message,
      });
    }
  }

  async updateUserProfile(req, res) {
    const userId = req.user.id; // From authenticateToken middleware
    const userRoleName = req.user.role_name?.toLowerCase(); // From authenticateToken middleware

    try {
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
        "petinggi sekolah": [
          "nip",
          "pin",
          "name",
          "email",
          "phone",
          "photo_filename",
        ],
        "wali kelas": [
          "nip",
          "pin",
          "name",
          "email",
          "phone",
          "photo_filename",
        ],
        "penjaga kantin": ["nip", "pin", "name", "email", "phone"],
        siswa: [
          "nis",
          "pin",
          "name",
          "email",
          "phone",
          "photo_filename",
          "batch",
        ],
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
      if (updateData.email && !isValidEmail(updateData.email)) {
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
        updateData.pin = await bcrypt.hash(updateData.pin, 10);
      }

      // Handle file upload (foto profil)
      if (req.file) {
        const newFilename = req.file.filename;

        // Hapus foto lama jika ada dan bukan default
        if (user.photo_filename) {
          const oldPath = path.join("uploads/photos", user.photo_filename);
          try {
            fs.unlinkSync(oldPath);
          } catch (err) {
            console.warn(
              "Gagal menghapus foto lama (mungkin tidak ada):",
              err.message
            );
          }
        }

        // Simpan nama file baru
        updateData.photo_filename = newFilename;
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

  async uploadUserPhotoProfile(req, res) {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: "File tidak ditemukan" });
    }

    try {
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      // Simpan nama file ke DB
      user.photo_filename = req.file.filename;
      await user.save();

      res.status(200).json({
        message: "Foto berhasil diupload",
        photo_filename: req.file.filename,
        photo_url: `/uploads/photos/${req.file.filename}`, // optional
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Gagal upload foto", error: error.message });
    }
  }

  async updateUserPhotoProfile(req, res) {
    const userId = req.user.id;

    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User tidak ditemukan" });
      }

      // Cek apakah file ada
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "File foto tidak ditemukan" });
      }

      // Simpan nama file baru
      const newPhotoFilename = req.file.filename;

      // Hapus file lama jika ada
      if (user.photo_filename) {
        const oldPhotoPath = path.join("uploads/photos", user.photo_filename);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }

      // Update ke database
      await user.update({ photo_filename: newPhotoFilename });

      return res.status(200).json({
        success: true,
        message: "Foto profil berhasil diperbarui",
        data: {
          id: user.id,
          photo_filename: newPhotoFilename,
          photo_url: `${req.protocol}://${req.get(
            "host"
          )}/uploads/photos/${newPhotoFilename}`,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan saat mengupdate foto profil",
      });
    }
  }
}

export default new UserManagementController();
