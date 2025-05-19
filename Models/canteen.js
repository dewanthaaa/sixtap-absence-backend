// models/Canteen.js
import { Model, DataTypes } from "sequelize";
import { sequelize } from "../Config/Database.js";

class Canteen extends Model {
  static associate(models) {
    // define associations here jika diperlukan
    // Contoh: Canteen.hasMany(models.Transaction, { foreignKey: 'canteen_id' });
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
