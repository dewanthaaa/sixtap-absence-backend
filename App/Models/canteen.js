// models/Canteen.js
import { Model, DataTypes } from "sequelize";
import { sequelize } from "../Config/Database.js";
import Transaction from "./transaction.js";
import User from "./user.js";

class Canteen extends Model {
  static associate() {
    Canteen.hasMany(Transaction, {
      foreignKey: "canteen_id",
      as: "transactions",
    });

    Canteen.belongsTo(User, {
      foreignKey: "opened_by",
      as: "opener",
    });
  }
}

Canteen.init(
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
    opened_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
     opened_at: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notEmpty: true,
        isDate: true,
      },
    },
    closed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
     note: {
      type: DataTypes.TEXT,
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
