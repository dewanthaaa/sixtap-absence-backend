// models/TransactionNotification.js
import { Model, DataTypes } from "sequelize";
import { sequelize } from "../Config/Database.js";

class TransactionNotification extends Model {
  static associate(models) {
    // Contoh relasi:
    // TransactionNotification.belongsTo(models.User, { foreignKey: 'user_id' });
  }
}

TransactionNotification.init(
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
      type: DataTypes.ENUM("transaction", "sistem", "pemberitahuan"),
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
  },
  {
    sequelize,
    modelName: "TransactionNotification",
    tableName: "TransactionNotification",
    timestamps: true,
  }
);

export default TransactionNotification;
