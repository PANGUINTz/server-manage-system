import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cor from "cors";
import crypto from "crypto";

import Customer from "./Models/customer.model.js";
import transactionModel from "./Models/transaction.model.js";

import dotenv from "dotenv";

dotenv.config();

const app = express();

const port = process.env.PORT;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cor());

mongoose
  .connect("mongodb+srv://pang:pang@cluster0.xfagrql.mongodb.net/customer", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to mongoDB"))
  .catch((err) => console.log("Error Connecting to mongoDB"));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.post("/api/addList", async (req, res) => {
  try {
    const {
      customerName,
      age,
      tel,
      address,
      diagnose,
      menu,
      Ros,
      CYL_R,
      AxR,
      AddR,
      Los,
      CYL_L,
      AxL,
      AddL,
      PDR,
      PDL,
      SHR,
      SHL,
      FType,
      FPrice,
      LType,
      LPrice,
      FBrand,
      color,
      PriceTotal,
      Earn,
      Balance,
      Desc,
      DoP,
      Signature,
    } = req.body;

    const data = await Customer.findOne({ customerName });
    if (data) {
      const createData = await transactionModel.create({
        menu,
        Ros,
        CYL_R,
        AxR,
        AddR,
        Los,
        CYL_L,
        AxL,
        AddL,
        PDR,
        PDL,
        SHR,
        SHL,
        FType,
        FPrice,
        LType,
        LPrice,
        FBrand,
        color,
        PriceTotal,
        Earn,
        Balance,
        Desc,
        DoP,
        Signature,
        slug: crypto.randomBytes(12).toString("hex"),
        customer: data._id,
      });
      await Customer.updateOne(
        { _id: data._id },
        { $addToSet: { transactions: createData._id } }
      );
      return res.status(201).send({ message: "เพิ่มสำเร็จ", success: true });
    } else {
      const createCustomer = await Customer.create({
        customerName,
        age,
        tel,
        address,
        diagnose,
        slug: crypto.randomBytes(12).toString("hex"),
      });

      const createTrans = await transactionModel.create({
        menu,
        Ros,
        CYL_R,
        AxR,
        AddR,
        Los,
        CYL_L,
        AxL,
        AddL,
        PDR,
        PDL,
        SHR,
        SHL,
        FType,
        FPrice,
        LType,
        LPrice,
        FBrand,
        color,
        PriceTotal,
        Earn,
        Balance,
        Desc,
        DoP,
        Signature,
        slug: crypto.randomBytes(12).toString("hex"),
        customer: createCustomer._id,
      });
      if (createCustomer && createTrans) {
        await Customer.updateOne(
          { _id: createCustomer._id },
          { $addToSet: { transactions: createTrans._id } }
        );
        return res.status(201).send({ message: "เพิ่มสำเร็จ", success: true });
      } else {
        return res
          .status(400)
          .send({ message: "กรุณากรอกข้อมูล", success: false });
      }
    }
  } catch (error) {}
});

app.get("/api/getAll", async (req, res) => {
  try {
    const data = await transactionModel.find().populate("customer");
    return res.status(200).send({ data: data, success: true });
  } catch (error) {
    return res.send({ message: error });
  }
});

app.put(
  "/api/update/customer/:slugCustomer/transaction/:slugTrans",
  async (req, res) => {
    try {
      const {
        customerName,
        age,
        tel,
        address,
        diagnose,
        menu,
        Ros,
        CYL_R,
        AxR,
        AddR,
        Los,
        CYL_L,
        AxL,
        AddL,
        PDR,
        PDL,
        SHR,
        SHL,
        FType,
        FPrice,
        LType,
        LPrice,
        FBrand,
        color,
        PriceTotal,
        Earn,
        Balance,
        Desc,
        DoP,
        Signature,
      } = req.body.data;

      const { slugCustomer, slugTrans } = req.params;
      const updateDataCustomer = await Customer.findOneAndUpdate(
        {
          slug: slugCustomer,
        },
        {
          customerName,
          age,
          tel,
          address,
          diagnose,
        }
      );

      const updateDataTran = await transactionModel.findOneAndUpdate(
        { slug: slugTrans },
        {
          menu,
          Ros,
          CYL_R,
          AxR,
          AddR,
          Los,
          CYL_L,
          AxL,
          AddL,
          PDR,
          PDL,
          SHR,
          SHL,
          FType,
          FPrice,
          LType,
          LPrice,
          FBrand,
          color,
          PriceTotal,
          Earn,
          Balance,
          Desc,
          DoP,
          Signature,
        }
      );

      if (updateDataCustomer || updateDataTran) {
        return res
          .status(200)
          .send({ data: "อัพเดตข้อมูลสำเร็จ", success: true });
      }
      return res
        .status(400)
        .send({ message: "อัพเดตข้อมูลไม่สำเร็จ", success: false });
    } catch (error) {
      return res.status(404).send({ message: error });
    }
  }
);

app.delete("/api/delete/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const dalData = await transactionModel.deleteOne({ slug });
    if (dalData) {
      return res.status(200).send({ message: "ลบสำเร็จ", success: true });
    }
    return res.status(400).send({ message: "ลบไม่สำเร็จ", success: false });
  } catch (error) {
    return res.status(404).send({ message: error });
  }
});

app.get("/api/edit/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const data = await transactionModel.findOne({ slug }).populate("customer");
    if (data) {
      return res.status(200).send({ data: data, success: true });
    }
    return res.status(400).send({ message: "ไม่มีข้อมูล", success: false });
  } catch (error) {
    return res.status(404).send({ message: error });
  }
});
