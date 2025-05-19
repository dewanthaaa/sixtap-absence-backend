import UserModel from "./user.js";
import RoleModel from "./role.js";
import KelasModel from "./school_class.js";

const setupAssociations = () => {
  // Relasi User ke Role
  UserModel.belongsTo(RoleModel, {
    foreignKey: "role_id",
    as: "role",
  });
  RoleModel.hasMany(UserModel, {
    foreignKey: "role_id",
    as: "users",
  });

  // Relasi User ke Kelas
  UserModel.belongsTo(KelasModel, {
    foreignKey: "kelas_id",
    as: "kelas",
  });
  KelasModel.hasMany(UserModel, {
    foreignKey: "kelas_id",
    as: "users",
  });
};

export default setupAssociations;
