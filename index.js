import express from "express";
import router from "./Routes/Api.js";
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT;
const app = express();

//Routing
app.use(router);

//Server
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
