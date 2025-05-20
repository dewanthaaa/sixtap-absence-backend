// models/role.js
import { Model, DataTypes } from "sequelize";
import { sequelize } from "../Config/Database.js";
import User from "./user.js";

export class Role extends Model {
  static associate() {
    Role.hasMany(User, { foreignKey: "role_id", as: "users" });
  }
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
      validate: {
        notEmpty: true,
      },
    },
    role_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 100],
      },
    },
  },
  {
    sequelize,
    modelName: "Role",
    tableName: "Role", // optional: bisa diatur jika kamu ingin nama tabel pasti
    timestamps: true, // sesuaikan jika kamu pakai createdAt dan updatedAt
  }
);

export default Role;
