import mongoose from 'mongoose';
import { pbkdf2, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from 'util';


const { Schema, model } = mongoose;
const pbkdf2Async = promisify(pbkdf2);

// User Schema
const userSchema = new Schema({
  avatarKey: {type: String},
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  nickname: { type: String, unique: true, required: true },
  password: { type: String },
  salt: { type: String },
  deletedAt: { type: String },
  isDeleted: { type: Boolean },
  createdAt: { type: String },
  updatedAt: { type: String },
  timezone: { type: String },
  timezoneOffset: { type: Number }
})


userSchema.methods.setPassword = async function (password) {
  const salt = randomBytes(16).toString('hex');
  const hashBuffer = await pbkdf2Async(password, salt, 10000, 64, 'sha512');
  this.salt = salt;
  this.password = hashBuffer.toString('hex');
};

userSchema.methods.validatePassword = async function (password) {
  const hashBuffer = await pbkdf2Async(password, this.salt, 10000, 64, 'sha512');
  const hashVerify = hashBuffer.toString('hex');

  const storedBuffer = Buffer.from(this.password || '', 'hex');
  const verifyBuffer = Buffer.from(hashVerify, 'hex');

  if (storedBuffer.length !== verifyBuffer.length) {
    return false; // don't match buffer length
  }

  return timingSafeEqual(storedBuffer, verifyBuffer);
};


// User model
const User = model("User", userSchema)

export default User;