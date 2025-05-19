import mongoose from 'mongoose';
const { Schema, model } = mongoose;


// User Schema
const UserSchema = new Schema({
    username: {type: String, unique: true, required: true},
    passwordHash: {type: String, required: true},
    salt: {type: String, required: true}
})

// User model
const User = model("User", UserSchema)

export default User;