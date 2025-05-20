// models/absence-notif.js
import { Model, DataTypes } from "sequelize";
import { sequelize } from "../Config/Database.js";
import User from "./user.js";
import Absence from "./Absence.js";

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
    },
    message: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("absensi", "sistem", "pemberitahuan"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("read", "unread"),
      allowNull: false,
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    absence_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "AbsenceNotification",
    tableName: "AbsenceNotification", // nama tabel, opsional bisa diubah
    timestamps: true, // sesuaikan sesuai kebutuhan
  }
);

export default AbsenceNotification;
