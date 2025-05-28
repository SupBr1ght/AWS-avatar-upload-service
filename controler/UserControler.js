import User from "../model/UserSheme.js";
import { Router } from "express";
import dotenv from "dotenv";
import { basicAuth } from "../basicAuth.js";
import loger from "../loger.js";
import { DateTime } from "luxon";

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

    // check if we update nickname it's different from the old one
    if (nickname && nickname !== user.nickname) {
      const existing = await User.findOne({ nickname });
      //if nickname is aleady in use and it's not the same nickname that has user throw error
      if (existing && existing._id.toString() !== user._id.toString()) {
        return res.status(400).json({ error: "Nickname already in use" });
      }
      // update if user update nickname
      user.nickname = nickname;
      user.updatedAt = kyTime.toISO()
    }

    if (firstname) user.firstname = firstname;
    if (lastname) user.lastname = lastname;

    if (newPassword) {
      await user.setPassword(newPassword);
    }

    await user.save();
    res.set('Last-Modified', new Date(user.updated_at).toUTCString());
    res.json({
      message: "User updated successfully",
      user: {
        nickname: user.nickname
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

router.delete("/delete", async (req, res) => {
  const { nickname } = req.body;
  try {
    const existingUser = await User.findOne({ nickname });
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

export default router;
