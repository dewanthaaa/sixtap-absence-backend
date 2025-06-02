import { Model, DataTypes } from "sequelize";
import { sequelize } from "../Config/Database.js";
import RfidCard from "./rfidcard.js";
import SchoolClass from "./schoolclass.js";
import User from "./user.js";
import AbsenceNotification from "./absence-notif.js";

export class Absence extends Model {
  static associate() {
    Absence.hasOne(AbsenceNotification, {
      foreignKey: "absence_id",
      as: "notification",
    });
    Absence.belongsTo(User, { foreignKey: "user_id", as: "user" });
    Absence.belongsTo(RfidCard, {
      foreignKey: "rfidcard_id",
      as: "rfidCard",
    });
    Absence.belongsTo(SchoolClass, {
      foreignKey: "schoolclass_id",
      as: "schoolClass",
    });
  }
}

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
