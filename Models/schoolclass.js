// models/schoolclass.js
import { Model, DataTypes } from "sequelize";
import { sequelize } from "../Config/Database.js";

export class SchoolClass extends Model {}

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
