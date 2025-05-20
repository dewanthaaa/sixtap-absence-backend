import express from "express";
import router from "./App/Routes/Api.js";
import dotenv from "dotenv";
import { connection } from "./App/Config/Database.js";
import setupAssociations from "./App/Models/SetupAssociations.js";

dotenv.config();
const PORT = process.env.PORT;
const app = express();

app.use(express.json());

//Relasi Model
setupAssociations();

//Routing
app.use(router);

//Koneksi ke DB
connection();

//Server
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
