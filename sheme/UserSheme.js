const {Schema, model} = require("../db/connection") // import Schema & model

// User Schema
export const UserSchema = new Schema({
    username: {type: String, unique: true, required: true},
    password: {type: String, required: true}
})

// User model
const User = model("User", UserSchema)

