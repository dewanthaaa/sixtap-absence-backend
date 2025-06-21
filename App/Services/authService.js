import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../Models/user.js";
import Role from "../Models/role.js";

const AuthService = {
  async login(identifier, password, req, res) {
    // Validasi input
    if (!identifier) {
      return {
        status: 422,
        body: {
          message: "Validasi gagal.",
          errors: {
            identifier: "Kolom identifier (NIS atau email) wajib diisi.",
          },
        },
      };
    }

    if (!password) {
      return {
        status: 422,
        body: {
          message: "Validasi gagal.",
          errors: {
            password: "Kolom password wajib diisi.",
          },
        },
      };
    }

    const isNumeric = /^\d+$/.test(identifier);

    let user = await User.findOne({
      where: isNumeric ? { nis: identifier } : { email: identifier },
      include: [{ model: Role, as: "role" }],
    });

    if (!user) {
      return {
        status: 401,
        body: {
          message: isNumeric ? "NIS tidak terdaftar" : "Email tidak terdaftar",
        },
      };
    }

    const userRoleName = user.role?.role_name?.toLowerCase() || "";
    let isRoleAllowed = false;

    if (isNumeric) {
      isRoleAllowed = userRoleName === "siswa";
    } else {
      const allowedRoles = [
        "admin",
        "petinggi sekolah",
        "penjaga kantin",
        "wali kelas",
      ];
      isRoleAllowed = allowedRoles.includes(userRoleName);
    }

    if (!isRoleAllowed) {
      return {
        status: 401,
        body: {
          message: isNumeric
            ? "NIS hanya untuk login siswa"
            : "Email hanya untuk login Admin, Petinggi Sekolah, Penjaga Kantin, atau Wali Kelas",
        },
      };
    }

    if (!user.password) {
      return {
        status: 500,
        body: {
          message:
            "User tidak memiliki password yang tersimpan. Silakan cek data pengguna.",
        },
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return {
        status: 401,
        body: { message: "Password salah" },
      };
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        nis: user.nis,
        email: user.email,
        role_name: userRoleName,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 60 * 60 * 1000,
    });

    const userData = user.toJSON();
    delete userData.password;

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    userData.photo_url = userData.photo_filename
      ? `${baseUrl}/uploads/photos/${userData.photo_filename}`
      : null;

    return {
      status: 200,
      body: {
        message:
          userRoleName === "siswa"
            ? "Login siswa berhasil"
            : `Login berhasil sebagai ${userRoleName}`,
        access_token: token,
        data: { userData },
      },
    };
  },

  logout(res) {
    res.clearCookie("access_token");
    return {
      status: 200,
      body: {
        message: "Logout berhasil. Token dihapus dari client.",
      },
    };
  },
};

export default AuthService;
