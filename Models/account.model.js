import mongoose from "mongoose";
const Schema = mongoose.Schema;

const accountSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  refreshToken: [String],
});

export default mongoose.model("accounts", accountSchema);
