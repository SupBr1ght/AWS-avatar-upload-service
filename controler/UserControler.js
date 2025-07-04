import User from "../model/UserSheme.js";
import { Router } from "express";
import dotenv from "dotenv";
import { basicAuth } from "../basicAuth.js";
import { DateTime } from "luxon";
import pollSQS from "/home/sap/projects/user-management-1/SQSWorker.js";
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

dotenv.config();

const router = Router(); // create routers to create route bundle
const kyTime = DateTime.now().setZone("Europe/Kyiv");

//=== REGISTRATION ===
router.post("/register", async (req, res) => {
  try {
    const { nickname, firstname, lastname, password } = req.body;

    const existingUser = await User.findOne({ nickname });
    if (existingUser)
      return res.status(400).json({ error: "Nickname already exists" });

    //create user instance
    const user = new User({
      nickname,
      firstname,
      lastname,
      createdAt: kyTime.toISO(),
      updatedAt: "Was not updated",
      deletedAt: "Was not deleted",
      timezone: kyTime.zoneName,
      timezoneOffset: kyTime.offset,
    });
    //hashed user's password
    await user.setPassword(password);
    await user.save();
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/update", basicAuth, async (req, res) => {
  try {
    const user = req.user;
    const { firstname, lastname, newPassword, nickname } = req.body;
    const ifUnmodifiedSince = req.headers["if-unmodified-since"];

    //If headers not modified then modify it if it was then return exeption
    if (ifUnmodifiedSince) {
      const clientLastModified = new Date(ifUnmodifiedSince);
      const serverLastModified = new Date(user.updatedAt);

      if (clientLastModified < serverLastModified) {
        return res.status(412).json({
          error:
            "Resource was modified. Please fetch the latest version first.",
          details: {
            clientVersion: clientLastModified.toUTCString(),
            serverVersion: serverLastModified.toUTCString(),
          },
        });
      }
    }

    // check if we update nickname it's different from the old one
    if (nickname && nickname !== user.nickname) {
      const existing = await User.findOne({ nickname });
      //if nickname is aleady in use and it's not the same nickname that has user throw error
      if (existing && existing._id.toString() !== user._id.toString()) {
        return res.status(400).json({ error: "Nickname already in use" });
      }
      // update if user update nickname
      user.nickname = nickname;
      user.updatedAt = kyTime.toISO();
    }

    if (firstname) user.firstname = firstname;
    if (lastname) user.lastname = lastname;
    if (newPassword) {
      await user.setPassword(newPassword);
    }
    user.updatedAt = kyTime.toISO();

    await user.save();

    res.set("Last-Modified", user.updatedAt);
    res.json({
      message: "User updated successfully",
      user: {
        nickname: user.nickname,
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/users", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    if (limit <= 0 || limit > 100) {
      res.status(400).json({ error: "Limit must be between 1 and 100" });
    }
    //get data about users without salt and password
    const users = await User.find({}, " -password -salt -deletedAt");
    //return all user's and their's length
    res.json({ users, count: users.length });
  } catch (error) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/user", async (req, res) => {
  try {
    const { nickname } = req.query;
    const user = await User.findOne({ nickname });
    if (user) {
      res.set("Last-Modified", user.updatedAt);
      res.status(200).json({ user });
    }
  } catch {
    res.status(404).json({ message: "User was not found" });
  }
});

router.delete("/delete", async (req, res) => {
  const { nickname } = req.body;
  try {
    const existingUser = await User.findOne({ nickname })
      .select(
        "-password -salt -deletedAt -createdAt -updatedAt -isDeleted -__v"
      )
      .lean();
    if (existingUser) {
      const deletedUser = await User.findOneAndUpdate(
        { nickname: nickname },
        {
          $set: {
            isDeleted: true,
            deletedAt: kyTime.toISO(),
            timezone: kyTime.zoneName,
            timezoneOffset: kyTime.offset, // Store the offset in minutes } }
          },
        }
      );
      res.json({ message: "user deleted succsessfuly" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ===INSTANTIATE S3CLIENT AND BUCKET
const s3 = new S3Client({ region: process.env.AWS_REGION });

// Endpoint to generate presigned URL
router.post('/avatar-upload-url', async (req, res) => {
    const { key, userId } = req.body;
    const bucket = process.env.S3_BUCKET_NAME;

    if (!key) {
        return res.status(400).json({ error: 'Key is required' });
    }

    const params = {
        Bucket: bucket, 
        Key: `avatars/${key}`,
        ContentType: "image/jpeg"                 
    };

    try {
        const command = new PutObjectCommand(params);
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

        //update user in bd
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.avatarKey = key;
        await user.save();

        res.json({ url });

    } catch (err) {
        loger.error('Error generating presigned URL:', err);
        res.status(500).json({ error: 'Error generating presigned URL' });
    }
});

pollSQS();


export default router;
