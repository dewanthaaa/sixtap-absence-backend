import { Model, DataTypes } from "sequelize";
import { sequelize } from "../Config/Database.js";

export class User extends Model {
  static associate(models) {
    // Relasi antar model bisa didefinisikan di sini
    // Contoh: User.belongsTo(models.Role, { foreignKey: 'role_id' });
  }
}

User.init(
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 100],
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    phone: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    pin: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    nis: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    nip: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    batch: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    photo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    schoolclass_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "User",
    timestamps: true, // jika kamu ingin createdAt dan updatedAt otomatis
    underscored: true, // akan pakai snake_case di nama kolom
  }
);

export default User;
