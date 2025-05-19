import express from "express";
import loger from "./loger.js";
import mongoose from "mongoose";

const { MONGO_DB_URI } = process.env;

//=== CONNECT TO MONGO ===
mongoose.connect = mongoose.connect(MONGO_DB_URI);

// === MONGOOSE CONNECTION ===
mongoose.connection
.on("open", () => loger.info("DATABASE STATE", "Connection Open"))
.on("close", () => loger.info("DATABASE STATE", "Connection Open"))
.on("error", (error) => loger.error("DATABASE STATE", error));


app.get("/", (req, res) => {
    res.send("this is the test route to make sure server is working")
})

const app = express();
app.use(cors);
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  loger.info(`Server is running on port ${PORT}`);
});
