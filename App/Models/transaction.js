// models/Transaction.js
import { Model, DataTypes } from "sequelize";
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
    rfid_card_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    canteen_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("purchase", "topup", "refund"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("success", "pending", "failed"),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Transaction",
    tableName: "Transaction",
    timestamps: true,
  }
);

export default Transaction;
