// models/absence-notif.js
import { Model, DataTypes } from "sequelize";
import { sequelize } from "../Config/Database.js";

export class AbsenceNotification extends Model {}

AbsenceNotification.init(
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
    absence_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    message: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    notif_type: {
      type: DataTypes.ENUM("tapin", "tapout"),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    notif_status: {
      type: DataTypes.ENUM("berhasil", "gagal"),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  },
  {
    sequelize,
    modelName: "AbsenceNotification",
    timestamps: true,
    underscored: true,
  }
);

export default AbsenceNotification;
