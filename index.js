import express from "express";
import router from "./App/Routes/Api.js";
import dotenv from "dotenv";
import { connection } from "./App/Config/Database.js";
import setupAssociations from "./App/Models/SetupAssociations.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const PORT = process.env.PORT;
const app = express();

// Setup untuk __dirname (karena pakai module system)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======== 💡 Ini bagian penting ========
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Artinya: semua file di dalam folder 'uploads/' bisa diakses via /uploads/...
// =======================================

// Konfigurasi CORS
app.use(
  cors({
    origin: "https://5t8hlpk5-5500.asse.devtunnels.ms", // Sesuaikan dengan origin frontend kamu
    credentials: true, // Kalau pakai cookie, session, atau auth header
  })
);

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
