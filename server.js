import express from "express";
import loger from "./loger.js";
import mongoose from "mongoose";
import userRouter from "./controler/UserControler.js";
import cors from "cors"
import dotenv from "dotenv"
dotenv.config()


const { MONGO_DB_URI } = process.env;

//=== CONNECT TO MONGO ===
mongoose.set('autoIndex', true);
mongoose.connect(MONGO_DB_URI);

// === MONGOOSE CONNECTION ===
mongoose.connection
.on("open", () => loger.info("DATABASE STATE: Connection Open"))
.on("close", () => loger.info("DATABASE STATE: Connection Close"))
.on("error", (error) => loger.error("DATABASE STATE ERROR", error));


const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("this is the test route to make sure server is working")
})


app.use("/user", userRouter)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    loger.info(`Server is running on port ${PORT}`);
});

