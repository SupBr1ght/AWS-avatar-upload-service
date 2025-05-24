import User from "../model/UserSheme.js";
import { Router } from "express";
import dotenv from "dotenv";
import { basicAuth } from "../basicAuth.js";

dotenv.config();

const router = Router(); // create routers to create route bundle

//=== REGISTRATION ===
router.post('/register', async (req, res) => {
  try {
    const { nickname, firstname, lastname, password } = req.body;

    const existingUser = await User.findOne({ nickname });
    if (existingUser) return res.status(400).json({ error: 'Nickname already exists' });

    //create user instance
    const user = new User({ nickname, firstname, lastname });
    //hashed user's password
    await user.setPassword(password);
    await user.save();
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/update', basicAuth, async (req, res) => {
  try {
    const user = req.user;
    const { firstname, lastname, newPassword, nickname } = req.body;

    // check if we update nickname it's different from the old one
    if (nickname && nickname !== user.nickname) {
      const existing = await User.findOne({ nickname });
      //if nickname is aleady in use and it's not the same nickname that has user throw error
      if (existing && existing._id.toString() !== user._id.toString()) {
        return res.status(400).json({ error: 'Nickname already in use' });
      }
      // update if user update nickname
      user.nickname = nickname;
    }

    if (firstname) user.firstname = firstname;
    if (lastname) user.lastname = lastname;

    if (newPassword) {
      await user.setPassword(newPassword);
    }

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        nickname: user.nickname,
        firstname: user.firstname,
        lastname: user.lastname
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
