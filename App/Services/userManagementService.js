import User from "../Models/user.js";
import Role from "../Models/role.js";
import SchoolClass from "../Models/schoolclass.js";
import RfidCard from "../Models/rfidcard.js";
import Wallet from "../Models/wallet.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import generateRandomPassword from "../Helper/generateRandomPassword.js";
import isValidEmail from "../Helper/isValidEmail.js";
import { Op } from "sequelize";
import path from "path";
import fs from "fs";

const UserManagementService = {
  async getUsersWithPagination(page = 1, limit = 50) {
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
      return {
        status: 404,
        body: {
          success: false,
          message: "Pengguna tidak ada.",
        },
      };
    }

    return {
      status: 200,
      body: {
        success: true,
        message: "Pengguna berhasil didapatkan.",
        data: users.rows,
        pagination: {
          totalData: users.count,
          currentPage: page,
          perPage: limit,
          totalPages: Math.ceil(users.count / limit),
        },
      },
    };
  },

  async getUserDetail(id) {
    const user = await User.findByPk(id, {
      include: [
        { model: Role, as: "role" },
        { model: SchoolClass, as: "schoolClass" },
        { model: RfidCard, as: "rfidCard" },
        { model: Wallet, as: "wallet" },
      ],
    });

    if (!user) {
      return {
        status: 404,
        body: {
          success: false,
          message: "Pengguna tidak ditemukan.",
        },
      };
    }

    return {
      status: 200,
      body: {
        success: true,
        message: "Pengguna berhasil didapatkan.",
        data: { user },
      },
    };
  },

  async createUser(data) {
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
      photo_filename,
    } = data;

    const existUser = await User.findOne({ where: { email } });
    if (existUser) {
      return {
        status: 400,
        body: {
          success: false,
          message: "Email sudah terdaftar.",
        },
      };
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
      photo_filename: photo_filename || null,
    });

    const { password: _, ...responseUser } = user.toJSON();

    return {
      status: 201,
      body: {
        success: true,
        message: "Pengguna berhasil dibuat.",
        data: { user: responseUser },
      },
    };
  },

  async updateUser(id, newData) {
    const user = await User.findByPk(id);
    if (!user) {
      return {
        status: 404,
        body: {
          success: false,
          message: "Pengguna tidak ditemukan.",
        },
      };
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
    } = newData;

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        return {
          status: 400,
          body: {
            success: false,
            message: "Email sudah terdaftar oleh pengguna lain.",
          },
        };
      }
    }

    const updateData = {
      name,
      email,
      phone: phone || null,
      nis: nis || null,
      nip: nip || null,
      role_id,
      schoolclass_id: schoolclass_id || null,
      batch: batch || null,
    };

    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await user.update(updateData);
    const updatedUser = await user.reload();

    return {
      status: 200,
      body: {
        success: true,
        message: "Pengguna berhasil diperbarui.",
        data: { user: updatedUser },
      },
    };
  },

  async deleteUser(id) {
    const user = await User.findByPk(id);
    if (!user) {
      return {
        status: 404,
        body: {
          success: false,
          message: "Pengguna tidak ditemukan.",
        },
      };
    }

    await user.destroy();

    return {
      status: 200,
      body: {
        success: true,
        message: "Pengguna berhasil dihapus.",
      },
    };
  },

  async resetUserPassword(id) {
    const user = await User.findByPk(id);
    if (!user) {
      return {
        status: 404,
        body: {
          success: false,
          message: "Pengguna tidak ditemukan.",
        },
      };
    }

    const newPassword = generateRandomPassword();
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"SixTap" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Reset Password Akun Anda",
      text: `Hai ${user.name},\n\nPassword akun Anda telah direset. Berikut adalah password baru Anda: ${newPassword}\n\nSilakan login ke sistem dan segera ubah password Anda untuk menjaga keamanan akun.\n\nTerima kasih,\nSixTap`,
    };

    await transporter.sendMail(mailOptions);

    return {
      status: 200,
      body: {
        success: true,
        message:
          "Password berhasil di-reset dan telah dikirim ke email pengguna.",
      },
    };
  },

  async getUserProfile(userId, req) {
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
      return {
        status: 404,
        body: {
          success: false,
          message: "User tidak ditemukan.",
        },
      };
    }

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
    } else if (user.role_id === 5) {
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
    } else {
      userProfile = {
        ...userProfile,
        nip: user.nip,
      };
    }

    return {
      status: 200,
      body: {
        success: true,
        message: "Berhasil mengambil data profil user saat ini.",
        data: userProfile,
      },
    };
  },

  async updateUserProfile(userId, roleName, reqBody, file, req) {
    const user = await User.findByPk(userId);
    if (!user) {
      return {
        status: 404,
        body: {
          success: false,
          message: "User tidak ditemukan",
        },
      };
    }

    const allowedFieldsByRole = {
      "petinggi sekolah": [
        "nip",
        "pin",
        "name",
        "email",
        "phone",
        "photo_filename",
      ],
      "wali kelas": ["nip", "pin", "name", "email", "phone", "photo_filename"],
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

    const allowedFields = allowedFieldsByRole[roleName?.toLowerCase()];
    if (!allowedFields) {
      return {
        status: 403,
        body: {
          success: false,
          message: "Anda tidak memiliki akses untuk mengupdate data",
        },
      };
    }

    const updateData = {};
    for (const field of allowedFields) {
      if (reqBody[field] !== undefined) updateData[field] = reqBody[field];
    }

    if (Object.keys(updateData).length === 0) {
      return {
        status: 400,
        body: {
          success: false,
          message: "Tidak ada data yang akan diupdate",
        },
      };
    }

    if (updateData.email && !isValidEmail(updateData.email)) {
      return {
        status: 400,
        body: {
          success: false,
          message: "Format email tidak valid",
        },
      };
    }

    if (updateData.email) {
      const existingUser = await User.findOne({
        where: {
          email: updateData.email,
          id: { [Op.ne]: userId },
        },
      });
      if (existingUser) {
        return {
          status: 400,
          body: {
            success: false,
            message: "Email sudah digunakan oleh user lain",
          },
        };
      }
    }

    if (updateData.nis) {
      const existingNis = await User.findOne({
        where: {
          nis: updateData.nis,
          id: { [Op.ne]: userId },
        },
      });
      if (existingNis) {
        return {
          status: 400,
          body: {
            success: false,
            message: "NIS sudah digunakan oleh siswa lain",
          },
        };
      }
    }

    if (updateData.nip) {
      const existingNip = await User.findOne({
        where: {
          nip: updateData.nip,
          id: { [Op.ne]: userId },
        },
      });
      if (existingNip) {
        return {
          status: 400,
          body: {
            success: false,
            message: "NIP sudah digunakan oleh staff lain",
          },
        };
      }
    }

    if (updateData.pin) {
      updateData.pin = await bcrypt.hash(updateData.pin, 10);
    }

    if (file) {
      const newFilename = file.filename;
      if (user.photo_filename) {
        const oldPath = path.join("uploads/photos", user.photo_filename);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updateData.photo_filename = newFilename;
    }

    await user.update(updateData);

    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ["password", "pin"] },
    });

    return {
      status: 200,
      body: {
        success: true,
        message: "Data berhasil diupdate",
        data: updatedUser,
      },
    };
  },

  async uploadPhoto(userId, file) {
    if (!file) {
      return {
        status: 400,
        body: {
          success: false,
          message: "File tidak ditemukan",
        },
      };
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return {
        status: 404,
        body: {
          success: false,
          message: "User tidak ditemukan",
        },
      };
    }

    user.photo_filename = file.filename;
    await user.save();

    return {
      status: 200,
      body: {
        success: true,
        message: "Foto berhasil diupload",
        data: {
          photo_filename: file.filename,
          photo_url: `/uploads/photos/${file.filename}`,
        },
      },
    };
  },

  async updatePhoto(userId, file, req) {
    const user = await User.findByPk(userId);
    if (!user) {
      return {
        status: 404,
        body: {
          success: false,
          message: "User tidak ditemukan",
        },
      };
    }

    if (!file) {
      return {
        status: 400,
        body: {
          success: false,
          message: "File foto tidak ditemukan",
        },
      };
    }

    const newPhotoFilename = file.filename;

    if (user.photo_filename) {
      const oldPhotoPath = path.join("uploads/photos", user.photo_filename);
      if (fs.existsSync(oldPhotoPath)) fs.unlinkSync(oldPhotoPath);
    }

    await user.update({ photo_filename: newPhotoFilename });

    return {
      status: 200,
      body: {
        success: true,
        message: "Foto profil berhasil diperbarui",
        data: {
          id: user.id,
          photo_filename: newPhotoFilename,
          photo_url: `${req.protocol}://${req.get(
            "host"
          )}/uploads/photos/${newPhotoFilename}`,
        },
      },
    };
  },
};

export default UserManagementService;
