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
      },
    },
  },
  {
    sequelize,
    modelName: "Role",
    timestamps: true,
    underscored: true,
  }
);

export default Role;
