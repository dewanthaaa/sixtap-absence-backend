// models/Transaction.js
import { Model, DataTypes } from "sequelize";
import { sequelize } from "../Config/Database.js";

class Transaction extends Model {
  static associate(models) {
    // Contoh relasi:
    // Transaction.belongsTo(models.Canteen, { foreignKey: 'canteen_id' });
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
