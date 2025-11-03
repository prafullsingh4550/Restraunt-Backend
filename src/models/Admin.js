import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  username: String,
  passwordHash: String,
});

export default mongoose.model("Admin", adminSchema);
