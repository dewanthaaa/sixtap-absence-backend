import User from "./user.js";
import Role from "./role.js";
import SchoolClass from "./schoolclass.js";
import RfidCard from "./rfidcard.js";
import Wallet from "./wallet.js";
import Absence from "./absence.js";
import AbsenceNotification from "./absence-notif.js";
import Transaction from "./transaction.js";
import TransactionNotification from "./transaction-notif.js";
import Canteen from "./canteen.js";

const setupAssociations = () => {
  // Role -> User
  Role.hasMany(User, {
    foreignKey: "role_id",
    as: "users",
  });
  User.belongsTo(Role, {
    foreignKey: "role_id",
    as: "role",
  });

  // SchoolClass -> User
  SchoolClass.hasMany(User, {
    foreignKey: "schoolclass_id",
    as: "users",
  });
  User.belongsTo(SchoolClass, {
    foreignKey: "schoolclass_id",
    as: "schoolClass",
  });

  // SchoolClass -> Absence
  SchoolClass.hasMany(Absence, {
    foreignKey: "schoolclass_id",
    as: "absences",
  });
  Absence.belongsTo(SchoolClass, {
    foreignKey: "schoolclass_id",
    as: "schoolClass",
  });

  // User -> RfidCard
  User.hasOne(RfidCard, {
    foreignKey: "user_id",
    as: "rfidCard",
  });
  RfidCard.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
  });

  // User -> Wallet
  User.hasOne(Wallet, {
    foreignKey: "user_id",
    as: "wallet",
  });
  Wallet.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
  });

  // User -> Absence
  User.hasMany(Absence, {
    foreignKey: "user_id",
    as: "absences",
  });
  Absence.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
  });

  // User -> AbsenceNotification
  User.hasMany(AbsenceNotification, {
    foreignKey: "user_id",
    as: "absenceNotifications",
  });
  AbsenceNotification.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
  });

  // User -> Transaction
  User.hasMany(Transaction, {
    foreignKey: "user_id",
    as: "transactions",
  });
  Transaction.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
  });

  // User -> TransactionNotification
  User.hasMany(TransactionNotification, {
    foreignKey: "user_id",
    as: "transactionNotifications",
  });
  TransactionNotification.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
  });

  // RfidCard -> Wallet
  RfidCard.hasOne(Wallet, {
    foreignKey: "rfid_card_id",
    as: "wallet",
  });
  Wallet.belongsTo(RfidCard, {
    foreignKey: "rfid_card_id",
    as: "rfidCard",
  });

  // RfidCard -> Transaction
  RfidCard.hasMany(Transaction, {
    foreignKey: "rfid_card_id",
    as: "transactions",
  });
  Transaction.belongsTo(RfidCard, {
    foreignKey: "rfid_card_id",
    as: "rfidCard",
  });

  // Canteen -> Transaction
  Canteen.hasMany(Transaction, {
    foreignKey: "canteen_id",
    as: "transactions",
  });
  Transaction.belongsTo(Canteen, {
    foreignKey: "canteen_id",
    as: "canteen",
  });

  // Absence -> AbsenceNotification
  Absence.hasOne(AbsenceNotification, {
    foreignKey: "absence_id",
    as: "notification",
  });
  AbsenceNotification.belongsTo(Absence, {
    foreignKey: "absence_id",
    as: "absence",
  });
};

export default setupAssociations;
