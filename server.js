import express from "express"
import loger from "./loger.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/status", (req, res) => {
    const status = {
        status: "Running"
    }

    res.send(status)
});

app.listen(PORT, ()=>{
    loger.info(`Server is running on port ${PORT}`)
})