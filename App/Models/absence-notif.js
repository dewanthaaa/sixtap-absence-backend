// models/absence-notif.js
import { Model, DataTypes } from "sequelize";
import { sequelize } from "../Config/Database.js";
import User from "./user.js";
import Absence from "./absence.js";

export class AbsenceNotification extends Model {
  static associate() {
    AbsenceNotification.belongsTo(User, {
      foreignKey: "user_id",
      as: "user",
    });
    AbsenceNotification.belongsTo(Absence, {
      foreignKey: "absence_id",
      as: "absence",
    });
  }
}

AbsenceNotification.init(
  {
    user_id: {
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
    type: {
      type: DataTypes.ENUM("absensi", "sistem", "pemberitahuan"),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    status: {
      type: DataTypes.ENUM("read", "unread"),
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
    absence_id: {
      type: DataTypes.INTEGER,
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
