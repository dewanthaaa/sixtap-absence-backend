import User from "../Models/user.js";
import Role from "../Models/role.js";
import SchoolClass from "../Models/schoolclass.js";
import RfidCard from "../Models/rfidcard.js";
import Wallet from "../Models/wallet.js";
import bcrypt from "bcrypt";
import generateRandomPassword from "../Helper/generateRandomPassword.js";

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
        order: [["createdAt", "DESC"]],
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
        photo
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
        photo: photo || null
      });

      res.status(201).json({
        message: "Pengguna berhasil dibuat.",
        data: { user },
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
        photo
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
        photo: photo || null
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

      //nanti ini dibikin function buat ngirim email dulu
      res.json({
        message: "Password berhasil di-reset.",
        data: {
          name: user.name,
          email: user.email,
          newPassword, // ini password baru kirim ke admin dulu (nanti ganti lewat email aja)
        },
      });
    } catch (error) {
      res.status(500).json({
        message: "Terjadi kesalahan saat reset password.",
        error: error.message,
      });
    }
  }
}

export default new UserManagementController();
