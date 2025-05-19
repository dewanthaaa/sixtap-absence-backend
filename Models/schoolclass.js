// models/schoolclass.js
import { Model, DataTypes } from "sequelize";
import { sequelize } from "../Config/Database.js";
import User from "./user.js";

export class SchoolClass extends Model {
  static associate() {
    SchoolClass.hasMany(User, {
      foreignKey: "schoolclass_id",
      as: "users",
    });
  }
}

SchoolClass.init(
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
    class_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    class_code: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  },
  {
    sequelize,
    modelName: "SchoolClass",
    tableName: "SchoolClass", // optional, tapi baik jika kamu ingin pastikan nama tabel plural
    timestamps: true, // jika kamu pakai createdAt dan updatedAt, biarkan true
  }
);

export default SchoolClass;
