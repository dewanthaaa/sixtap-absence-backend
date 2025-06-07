import { Model, DataTypes } from "sequelize";
import { sequelize } from "../Config/Database.js";

export class Absence extends Model {}

Absence.init(
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
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    rfid_card_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    schoolclass_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    day: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    time_in: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    time_out: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    info: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
    absence_status: {
      type: DataTypes.ENUM("hadir", "sakit", "izin", "alpa"),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    card_status: {
      type: DataTypes.ENUM("active", "approved", "rejected"),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  },
  {
    sequelize,
    modelName: "Absence",
    timestamps: true,
    underscored: true,
  }
);

export default Absence;
