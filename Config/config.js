import dotenv from "dotenv";

dotenv.config();

export default {
  development: {
    username: "root",
    password: process.env.DB_PASSWORD,
    database: "db_absensix",
    host: "127.0.0.1",
    dialect: process.env.DB_DIALECT,
  },
  test: {
    username: "root",
    password: process.env.DB_PASSWORD,
    database: "db_absensix",
    host: "127.0.0.1",
    dialect: process.env.DB_DIALECT,
  },
  production: {
    username: "root",
    password: process.env.DB_PASSWORD,
    database: "db_absensix",
    host: "127.0.0.1",
    dialect: process.env.DB_DIALECT,
  },
};
