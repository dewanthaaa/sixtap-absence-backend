import { Model, DataTypes } from "sequelize";
import RfidCard from "./rfidcard.js";
import Wallet from "./wallet.js";
import Absence from "./Absence.js";
import AbsenceNotification from "./absence-notif.js";
import Transaction from "./transaction.js";
import TransactionNotification from "./transaction-notif.js";
import Role from "./role.js";
import SchoolClass from "./schoolclass.js";

export class User extends Model {
  static associate() {
    // 1. User -> RFID Card = HasOne
    User.hasOne(RfidCard, { foreignKey: "user_id", as: "rfidCard" });

    // 2. User -> Wallet = HasOne
    User.hasOne(Wallet, { foreignKey: "user_id", as: "wallet" });

    // 3. User -> Absence = HasMany
    User.hasMany(Absence, { foreignKey: "user_id", as: "absence" });

    // 4. User -> Absence Notification = HasMany
    User.hasMany(AbsenceNotification, {
      foreignKey: "user_id",
      as: "absenceNotification",
    });

    // 5. User -> Transaction = HasMany
    User.hasMany(Transaction, {
      foreignKey: "user_id",
      as: "transaction",
    });

    // 6. User -> Transaction Notification = HasMany
    User.hasMany(TransactionNotification, {
      foreignKey: "user_id",
      as: "transactionNotification",
    });

    // Relasi dengan Role dan SchoolClass (berdasarkan foreign key yang ada di model)
    User.belongsTo(Role, { foreignKey: "role_id", as: "role" });

    User.belongsTo(SchoolClass, {
      foreignKey: "schoolclass_id",
      as: "schoolClass",
    });
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
