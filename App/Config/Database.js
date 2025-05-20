import { Sequelize } from "sequelize";

let dbName;
process.env.STATUS == "DEVELOPMENT"
  ? (dbName = process.env.DB_PROD_NAME)
  : (dbName = process.env.DB_DEV_NAME);

const sequelize = new Sequelize(
  dbName,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: "localhost",
    dialect: "mysql",
  }
);

const connection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database Connected");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

export { sequelize, connection };
