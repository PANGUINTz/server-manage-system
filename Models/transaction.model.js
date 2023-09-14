import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  menu: {
    type: String,
    required: true,
  },
  Ros: {
    type: Number,
    default: 0,
  },
  CYL_R: {
    type: Number,
    default: 0,
  },
  AxR: {
    type: Number,
    default: 0,
  },
  AddR: {
    type: Number,
    default: 0,
  },
  Los: {
    type: Number,
    default: 0,
  },
  CYL_L: {
    type: Number,
    default: 0,
  },
  AxL: {
    type: Number,
    default: 0,
  },
  AddL: {
    type: Number,
    default: 0,
  },
  PDR: {
    type: Number,
    default: 0,
  },
  PDL: {
    type: Number,
    default: 0,
  },
  SHR: {
    type: Number,
    default: 0,
  },
  SHL: {
    type: Number,
    default: 0,
  },
  FType: {
    type: String,
  },
  FPrice: {
    type: Number,
    default: 0,
  },

  LType: {
    type: String,
  },
  LPrice: {
    type: Number,
    default: 0,
  },
  FBrand: {
    type: String,
  },
  color: {
    type: String,
  },
  PriceTotal: {
    type: Number,
    default: 0,
  },
  Earn: {
    type: Number,
    default: 0,
  },
  Balance: {
    type: Number,
    default: 0,
  },
  Desc: {
    type: String,
  },
  DoP: {
    type: Date,
  },
  Signature: {
    type: String,
  },
  slug: {
    type: String,
  },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "customers" },
});

export default mongoose.model("transactions", transactionSchema);
