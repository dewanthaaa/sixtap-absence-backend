import { DataTypes } from "sequelize";
import { sequelize } from "../Config/Database.js";

const RfidCardModel = sequelize.define("RfidCard", {
  id: {
    type: DataTypes.INTEGER,
    defaultValue: DataTypes.INTEGER,
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
  card_uid: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
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
});

export default RfidCardModel;
