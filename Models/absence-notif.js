// models/absence-notif.js
import { Model, DataTypes } from "sequelize";
import { sequelize } from "../Config/Database.js";

export class AbsenceNotification extends Model {
  static associate(models) {
    // Definisikan relasi di sini jika sudah tersedia
    // Contoh:
    // this.belongsTo(models.User, { foreignKey: 'user_id' });
    // this.belongsTo(models.Absence, { foreignKey: 'absence_id' });
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
