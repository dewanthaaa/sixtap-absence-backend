// models/schoolclass.js
import { Model, DataTypes } from "sequelize";
import { sequelize } from "../Config/Database.js";

class SchoolClass extends Model {}

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
