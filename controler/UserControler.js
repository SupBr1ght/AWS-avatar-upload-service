import User from "../model/UserSheme.js";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import loger from "../loger.js";
import { Router } from "express";
import dotenv from "dotenv"
dotenv.config()

const secret = process.env.SECRET

const router = Router(); // create router to create route bundle



// Signup route to create a new user
router.post("/signup", (req, res) => {
  loger.info(`This is request body: ${req.body}`);
  const { username, password } = req.body;
  const salt = crypto.randomBytes(128).toString("base64");

  // cyphr user's password
  crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derivedKey) => {
    // if some hashing mistakes
    if (err) return res.status(500).json({ err: "Hashing failed" });

    const passwordHash = derivedKey.toString("hex");
    // create user with hashed password
    User.create({ username, passwordHash, salt })
      .then((user) => res.status(201).json({ message: "User created", user }))
      .catch((error) => res.status(400).json({ error: error.message }));
  });
});

router.post("/login", async (req, res) => {
  try {
    // check if the user exists
    const user = await User.findOne({ username: req.body.username });
    if (user) {
      //check if password matches
      const { passwordHash, salt } = user;
      const password = req.body.password;
      // hashing new users input
      crypto.pbkdf2(password, salt, 100000, 64, "sha512", async (err, derivedKey) => {
        if (err) return res.status(500).json({ error: "Hashing error" });

        // hasing new user's input password
        const incomingHash = derivedKey.toString("hex");
        const payload = { username: user.username };
        const options = { expiresIn: "1h" };

        if (passwordHash === incomingHash) {
           jwt.sign(payload, secret, options, (err, token) => {
            if (err) {
                loger.info("JWT generation error:", err)
            } else {
                res.json({ token });
            }
            });
        } else res.status(400).json({ error: "credential error" });
      });
    } else {
      res.status(400).json({ error: "credential error" });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
});

export default router