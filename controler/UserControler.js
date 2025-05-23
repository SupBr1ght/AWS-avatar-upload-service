import User from "../model/UserSheme.js";
import { Router } from "express";
import dotenv from "dotenv";

dotenv.config();

const router = Router(); // create router to create route bundle

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

export default router;
