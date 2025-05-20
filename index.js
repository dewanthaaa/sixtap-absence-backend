import express from "express";
import router from "./App/Routes/Api.js";
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT;
const app = express();

//Routing
app.use(router);

app.use(express.json());

//Server
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
