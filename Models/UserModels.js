import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    unique: true, // Ensure userName is unique
    required: true,
  },
  phoneNumber: {
    type: String,
    unique: true, // Ensure phoneNumber is unique
    required: true,
  },
  email: {
    type: String,
    unique: true, // Ensure email is unique
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const UserDB = mongoose.model("F22", userSchema);

export default UserDB;
