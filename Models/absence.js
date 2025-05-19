import { Model, DataTypes } from "sequelize";
import { sequelize } from "../Config/Database.js";

export class Absence extends Model {
  static associate(models) {
    // Relasi, misalnya:
    // Absence.belongsTo(models.User, { foreignKey: 'user_id' });
  }
}

Absence.init(
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
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 100],
      },
    },
    day: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    time_in: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    time_out: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("hadir", "sakit", "izin", "alpa"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "approved", "rejected"),
      allowNull: false,
    },
    activated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    blocked_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Absence",
    tableName: "Absence",
    timestamps: true,
    underscored: true,
  }
);

export default Absence;
