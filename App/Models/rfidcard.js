// models/RfidCard.js
import { Model, DataTypes } from "sequelize";
import { sequelize } from "../Config/Database.js";
import User from "./user.js";
import Wallet from "./wallet.js";
import Transaction from "./transaction.js";

class RfidCard extends Model {
  static associate() {
    RfidCard.hasOne(Wallet, { foreignKey: "rfidcard_id", as: "wallet" });
    RfidCard.hasMany(Transaction, {
      foreignKey: "rfidcard_id",
      as: "transactions",
    });
    RfidCard.hasMany(Absence, {
      foreignKey: "rfidcard_id",
      as: "absences",
    });
    RfidCard.belongsTo(User, { foreignKey: "user_id", as: "user" });
  }
}

RfidCard.init(
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
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    card_uid: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      validate: {
        notEmpty: true,
      },
    },
    activated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    blocked_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "RfidCard",
    timestamps: true,
    underscored: true,
  }
);

export default RfidCard;
