// models/Transaction.js
import { Model, DataTypes } from "sequelize";
import { sequelize } from "../Config/Database.js";
import User from "./user.js";
import RfidCard from "./rfidcard.js";
import Canteen from "./canteen.js";

class Transaction extends Model {
  static associate() {
    Transaction.belongsTo(User, { foreignKey: "user_id", as: "user" });
    Transaction.belongsTo(RfidCard, {
      foreignKey: "rfidcard_id",
      as: "rfidCard",
    });
    Transaction.belongsTo(Canteen, {
      foreignKey: "canteen_id",
      as: "canteen",
    });
  }
}

Transaction.init(
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
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    canteen_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    note: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Transaction",
    underscored: true,
    timestamps: true,
  }
);

export default Transaction;
