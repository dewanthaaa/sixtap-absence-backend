const checkRole = (allowedRoles = []) => {
  return (req, res, next) => {
    const userRole = req.user?.role_name?.toLowerCase();

    if (!userRole) {
      return res
        .status(403)
        .json({ message: "Role pengguna tidak ditemukan." });
    }

    if (!allowedRoles.includes(userRole)) {
      return res
        .status(403)
        .json({ message: "Akses ditolak, role tidak sesuai." });
    }

    next();
  };
};

export default checkRole;
