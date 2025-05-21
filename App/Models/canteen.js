// models/Canteen.js
import { Model, DataTypes } from "sequelize";
import { sequelize } from "../Config/Database.js";
import Transaction from "./transaction.js";

class Canteen extends Model {
  static associate() {
    Canteen.hasMany(Transaction, {
      foreignKey: "canteen_id",
      as: "transactions",
    });
  }
}

Canteen.init(
  {
    initial_balance: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        notEmpty: true,
      },
    },
    current_balance: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        notEmpty: true,
      },
    },
    is_settled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      validate: {
        notEmpty: true,
      },
    },
    settlement_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Canteen",
    timestamps: true,
     underscored: true,
  }
);

export default Canteen;
