// models/schoolclass.js
import { Model, DataTypes } from "sequelize";
import { sequelize } from "../Config/Database.js";
import Absence from "./absence.js";
import User from "./user.js";

export class SchoolClass extends Model {
  static associate() {
    SchoolClass.hasMany(User, {
      foreignKey: "schoolclass_id",
      as: "user",
    });
    SchoolClass.hasMany(Absence, {
      foreignKey: "schoolclass_id",
      as: "absences",
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
    timestamps: true,
    underscored: true,
  }
);

export default SchoolClass;
