import mongoose from 'mongoose';
import { pbkdf2, randomBytes, pbkdf2Sync, timingSafeEqual } from "crypto";
import { promisify } from 'util';


const { Schema, model } = mongoose;
const pbkdf2Async = promisify(pbkdf2);

// User Schema
const userSchema = new Schema({
    firstname: {type: String, unique: true, required: true},
    lastname: {type: String, unique: true, required: true},
    nickname: {type: String, unique: true, required: true},
    password: {type: String},
    salt: {type: String},
})

userSchema.methods.setPassword = async function(password) {
  const salt = randomBytes(16).toString('hex');
  const hashBuffer = await pbkdf2Async(password, salt, 10000, 64, 'sha512');
  this.salt = salt;
  this.password = hashBuffer.toString('hex');
};

userSchema.methods.validatePassword = function(password) {
  const hashVerify = crypto.pbkdf2Sync(password, this.salt, 10000, 64, 'sha512').toString('hex');
  // return true if passwords are equal
  return crypto.timingSafeEqual(Buffer.from(this.password), Buffer.from(hashVerify));
};

// User model
const User = model("User", userSchema)

export default User;