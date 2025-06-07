// models/Wallet.js
import { Model, DataTypes } from "sequelize";
import { sequelize } from "../Config/Database.js";

class Wallet extends Model {}

Wallet.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    rfid_card_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    last_top_up: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    balance: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        notEmpty: true,
      },
    },
  },
  {
    sequelize,
    modelName: "Wallet",
    underscored: true,
    timestamps: true, // default true, bisa diatur jika tidak perlu
  }
);

export default Wallet;
