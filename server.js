import express from "express";
import loger from "./loger.js";
import mongoose from "mongoose";
import userRouter from "./controler/UserControler.js";
import cors from "cors"
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from "dotenv"
dotenv.config()

// ===INSTANTIATE S3CLIENT AND BUCKET
const s3 = new S3Client({ region: process.env.AWS_REGION });
const bucket = process.env.S3_BUCKET_NAME

// const { MONGO_DB_URI } = process.env;

// //=== CONNECT TO MONGO ===
// mongoose.set('autoIndex', true);
// mongoose.connect(MONGO_DB_URI);

// // === MONGOOSE CONNECTION ===
// mongoose.connection
// .on("open", () => loger.info("DATABASE STATE", "Connection Open"))
// .on("close", () => loger.info("DATABASE STATE", "Connection Open"))
// .on("error", (error) => loger.error("DATABASE STATE", error));



const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("this is the test route to make sure server is working")
})

// Endpoint to generate presigned URL
app.post('/presigned-url', async (req, res) => {
    const { key } = req.query;
    const bucket = process.env.S3_BUCKET_NAME

    if (!key) {
        return res.status(400).json({ error: 'Key is required' });
    }

    const params = {
        Bucket: 'your-bucket-name', 
        Key: key,                   
    };

    try {
        const command = new PutObjectCommand(params);

        // Генеруємо presigned URL
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); 

        // Відправляємо URL клієнту
        res.json({ url });
    } catch (err) {
        console.error('Error generating presigned URL:', err);
        return res.status(500).json({ error: 'Error generating presigned URL' });
    }
});





app.use("/user", userRouter)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    loger.info(`Server is running on port ${PORT}`);
});
