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

  async updateUserOwnData(req, res) {
    try {
      const userId = req.user.id;
      const role = req.user.role_name?.toLowerCase();
      console.log(userId);

      // Ambil data dari req.body
      const { name, email, phone, pin, photo, nis, nip, batch } = req.body;

      // Mapping field yang bisa diupdate berdasarkan role_name
      const roleFieldMap = {
        "wali kelas": ["name", "email", "phone", "pin", "photo", "nip"],
        siswa: ["name", "email", "phone", "pin", "photo", "nis", "batch"],
        "petinggi sekolah": ["name", "email", "phone", "pin", "photo", "nip"],
        "penjaga kantin": ["name", "email", "phone", "pin", "nip"],
      };

      const allowedFields = roleFieldMap[role];

      if (!allowedFields) {
        return res
          .status(403)
          .json({ message: "Role tidak diperbolehkan mengakses fitur ini." });
      }

      // Buat object update berdasarkan field yang diperbolehkan dan tersedia di req.body
      const updateData = {};
      allowedFields.forEach((field) => {
        if (req.body.hasOwnProperty(field)) {
          updateData[field] = req.body[field];
        }
      });

      // Update data di database
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      await user.update(updateData);

      res.status(200).json({
        message: "Data berhasil diperbarui",
        updatedData: updateData,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Terjadi kesalahan server", error: error.message });
    }
  }
}

export default new UserManagementController();
