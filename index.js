import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import crypto from "crypto";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

import Customer from "./Models/customer.model.js";
import transactionModel from "./Models/transaction.model.js";
import Account from "./Models/account.model.js";

import credentials from "./middleware/credentials.js";
import corsOptions from "./config/corsOptions.js";

dotenv.config();

const app = express();

const port = process.env.PORT;

const mongoURL = process.env.DATABASE_URL;

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(cors(corsOptions));

app.use(cookieParser());

app.use(credentials);

mongoose
  .connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to mongoDB"))
  .catch((err) => console.log("Error Connecting to mongoDB"));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

////////////////////////////////////// refreshToken Controller //////////////////////////////////////////

app.get("/refreshToken", async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });

    const foundUser = await Account.findOne({ refreshToken }).exec();

    // Detected refresh token reuse!
    if (!foundUser) {
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
          if (err) return res.sendStatus(403); //Forbidden
          // Delete refresh tokens of hacked user
          const hackedUser = await User.findOne({
            username: decoded.username,
          }).exec();
          hackedUser.refreshToken = [];
          const result = await hackedUser.save();
        }
      );
      return res.sendStatus(403); //Forbidden
    }

    const newRefreshTokenArray = foundUser.refreshToken.filter(
      (rt) => rt !== refreshToken
    );

    // evaluate jwt
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          // expired refresh token
          foundUser.refreshToken = [...newRefreshTokenArray];
          const result = await foundUser.save();
        }
        if (err || foundUser.username !== decoded.username)
          return res.sendStatus(403);

        // Refresh token was still valid
        const roles = Object.values(foundUser.roles);
        const accessToken = jwt.sign(
          {
            UserInfo: {
              username: decoded.username,
            },
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "10s" }
        );

        const newRefreshToken = jwt.sign(
          { username: foundUser.username },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: "15s" }
        );
        // Saving refreshToken with current user
        foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
        const result = await foundUser.save();

        // Creates Secure Cookie with refresh token
        res.cookie("jwt", newRefreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "None",
          maxAge: 24 * 60 * 60 * 1000,
        });

        res.json({ accessToken });
      }
    );
  } catch (error) {}
});

/////////////////////// Login ////////////////////////////////////

app.post("/login", async (req, res) => {
  try {
    const cookies = req.cookies;
    const { username, password } = req.body;
    if (!username || !password)
      return res
        .status(400)
        .json({ message: "Username and password are required." });

    const foundUser = await Account.findOne({ username }).exec();
    if (!foundUser) return res.sendStatus(401); //Unauthorized
    // evaluate password
    const match = await bcrypt.compare(password, foundUser.password);
    if (match) {
      // create JWTs
      const accessToken = jwt.sign(
        {
          UserInfo: {
            username: foundUser.username,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "12h" }
      );
      const newRefreshToken = jwt.sign(
        { username: foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "24h" }
      );

      // Changed to let keyword
      let newRefreshTokenArray = !cookies?.jwt
        ? foundUser.refreshToken
        : foundUser.refreshToken.filter((rt) => rt !== cookies.jwt);

      if (cookies?.jwt) {
        const refreshToken = cookies.jwt;
        const foundToken = await Account.findOne({ refreshToken }).exec();

        // Detected refresh token reuse!
        if (!foundToken) {
          // clear out ALL previous refresh tokens
          newRefreshTokenArray = [];
        }

        res.clearCookie("jwt", {
          httpOnly: true,
          sameSite: "None",
          secure: true,
        });
      }

      foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
      const result = await foundUser.save();

      res.cookie("jwt", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.json({ accessToken });
    } else {
      return res.status(400).send({ message: "failed", success: false });
    }
  } catch (error) {}
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username && !password) {
      return res
        .status(401)
        .send({ message: "กรุณากรอกข้อมูล", success: false });
    }

    console.log(username, password);
    const success = await Account.create({
      username,
      password: await bcrypt.hash(password, 10),
    });

    if (success) {
      res.status(200).send({ message: "สมัครเสร็จสิ้น", success: true });
    }
  } catch (error) {}
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
