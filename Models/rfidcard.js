// models/RfidCard.js
import { Model, DataTypes } from "sequelize";
import { sequelize } from "../Config/Database.js";
import User from "./user.js";
import Wallet from "./wallet.js";
import Transaction from "./transaction.js";

class RfidCard extends Model {
  static associate() {
    RfidCard.belongsTo(User, { foreignKey: "user_id", as: "user" });
    RfidCard.hasOne(Wallet, { foreignKey: "rfidcard_id", as: "wallet" });
    RfidCard.hasMany(Transaction, {
      foreignKey: "rfidcard_id",
      as: "transactions",
    });
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
        len: [3, 100],
      },
    },
    card_uid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    activated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    blocked_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "RfidCard",
    tableName: "RfidCard",
    timestamps: true,
  }
);

export default RfidCard;
