// models/TransactionNotification.js
import { Model, DataTypes } from "sequelize";
import { sequelize } from "../Config/Database.js";
import User from "./user.js";

class TransactionNotification extends Model {
  static associate() {
    TransactionNotification.belongsTo(User, {
      foreignKey: "user_id",
      as: "user",
    });
  }
}

TransactionNotification.init(
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
      type: DataTypes.ENUM("pembelian", "refund", "top up"),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    status: {
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
    modelName: "TransactionNotification",
     underscored: true,
    timestamps: true,
  }
);

export default TransactionNotification;
