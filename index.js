import express from "express";
import router from "./App/Routes/Api.js";
import dotenv from "dotenv";
import { connection } from "./App/Config/Database.js";
import setupAssociations from "./App/Models/SetupAssociations.js";
import cors from "cors";

dotenv.config();
const PORT = process.env.PORT;
const app = express();

// Konfigurasi CORS
// app.use(
//   cors({
//     origin: "http://localhost:5173", // Sesuaikan dengan origin frontend kamu
//     credentials: true, // Kalau pakai cookie, session, atau auth header
//   })
// );

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
