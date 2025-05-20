import User from "../model/UserSheme.js";
import crypto, { pbkdf2 } from "node:crypto";
import loger from "../loger.js";
import { Router } from "express";
import dotenv from "dotenv";
import { promisify } from "util";
dotenv.config();

const secret = process.env.SECRET;
const pbkdf2Async = promisify(pbkdf2);
const router = Router(); // create router to create route bundle

// Signup route to create a new user
router.post("/signup", async (req, res) => {
  try {
    const { username, firstName, lastName, nickName, password } = req.body;

    // check if user exist
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // 2. salt
    const salt = crypto.randomBytes(128).toString("base64");

    // 3. password hashing
    const derivedKey = await pbkdf2Async(password, salt, 100000, 64, "sha512");
    const passwordHash = derivedKey.toString("hex");

    // 4. user created
    const user = await User.create({
      username,
      firstName,
      lastName,
      nickName,
      passwordHash,
      salt,
    });

    // 5. Відповідь
    res.status(201).json({ message: "User created", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
     // 1. User search
    const { nickName, password } = req.body;
    const user = await User.findOne({ nickName });
    if (!user) return res.status(400).json({ error: "credential error" });

    
    const payload = { nickName: user.nickName };
    const secret = process.env.SECRET;
    const options = { expiresIn: "1h" };

    // 2. Password hashing
    const derivedKey = await pbkdf2Async(
      password,
      user.salt,
      100000,
      64,
      "sha512"
    );
    const incomingHash = derivedKey.toString("hex");

    // 3. Checking hash
    if (incomingHash !== user.passwordHash) {
      return res.status(400).json({ error: "credential error" });
    } else {
       res.status(200).json({ message: "Login successful"});
    }

    } catch (error) {
      loger.error("[Signup error]:", error); // or [Signin error]
      res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
});

export default router;
