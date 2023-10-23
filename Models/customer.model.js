import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  tel: {
    type: String,
  },
  address: {
    type: String,
  },
  diagnose: {
    type: String,
  },
  slug: {
    type: String,
  },
  transactions: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "transactions" }],
  },
});

export default mongoose.model("customers", customerSchema);
