// models/Canteen.js
import { Model, DataTypes } from "sequelize";

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
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    current_balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    is_settled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    settlement_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Canteen",
    tableName: "Canteen", // gunakan ini jika ingin tabel bernama tunggal
    timestamps: true, // createdAt dan updatedAt akan otomatis ditambahkan
  }
);

export default Canteen;
