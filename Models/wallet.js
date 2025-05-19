// models/Wallet.js
import { Model, DataTypes } from "sequelize";
import { sequelize } from "../Config/Database.js";

class Wallet extends Model {
  static associate(models) {
    // define association here
    // Contoh: Wallet.belongsTo(models.User, { foreignKey: 'user_id' });
  }
}

Wallet.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
  },
  {
    sequelize,
    modelName: "Wallet",
    tableName: "Wallet", // optional, jika kamu pakai nama plural eksplisit
    timestamps: true, // default true, bisa diatur jika tidak perlu
  }
);

export default Wallet;
