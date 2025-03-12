import User from "../model/User.model.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register User
const registerUser = async (req, res) => {
  //   console.log(req);
  //   console.log(res);

  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please enter all fields" });
  }
  //   console.log(email);

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User Already Exists" });
    }

    const user = await User.create({ name, email, password });
    console.log(user);
    if (!user) {
      return res.status(400).json({ message: "User Not Registered" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.verificationToken = token;

    await user.save();

    //   send email
    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      secure: false,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });

    const mailOption = {
      from: "App",
      to: user.email,
      subject: "Account Verification",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #333;">Welcome to Our App, ${user.name}!</h2>
          <p style="color: #555;">Thank you for registering. Please verify your email address by clicking the link below:</p>
          <a href="${process.env.BASE_URL}/api/v1/users/verify/${token}" style="display: inline-block; padding: 10px 20px; margin: 10px 0; font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Verify Email</a>
          <p style="color: #555;">If you did not create an account, please ignore this email.</p>
          <p style="color: #555;">Best regards,<br/>The App Team</p>
        </div>
      `,
    };

    transporter.sendMail(mailOption, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log("Message sent: %s", info.messageId);
    });

    res.status(201).json({ message: "User Registered", success: true });
  } catch (error) {
    res
      .status(400)
      .json({ message: "User Not Registered", error, success: false });
  }
};
// Verify User
const verifyUser = async (req, res) => {
  const { token } = req.params;
  if (!token) {
    return res.status(400).json({ message: "Invalid Token" });
  }
  const user = await User.findOne({ verificationToken: token });

  if (!user) {
    return res.status(400).json({ message: "Invalid Token" });
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();
  res.status(200).json({ message: "User Verified", success: true });
};
// login user
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please enter all fields" });
  }

  try {
    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "User Not Found May be Invalid Email or Password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT, {
      expiresIn: "24h",
    });

    const cookisOptions = {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    };
    res.cookie("token", token, cookisOptions);

    res.status(200).json({
      success: true,
      message: "User Logged In",
      token: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "User Not Logged In", error, success: false });
  }
};
// forgotPassword
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Please enter email" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User Not Found" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.restPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // send email
    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      secure: false,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });

    const mailOption = {
      from: "App",
      to: user.email,
      subject: "Password Reset",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #333;">Password Reset</h2>
          <p style="color: #555;">You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
          <a href="${process.env.BASE_URL}/api/v1/users/resetpassword/${token}" style="display: inline-block; padding: 10px 20px; margin: 10px 0; font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p style="color: #555;">If you did not request a password reset, please ignore this email.</p>
          <p style="color: #555;">Best regards,<br/>The App Team</p>
        </div>
      `,
    };

    transporter.sendMail(mailOption, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log("Message sent: %s", info.messageId);
    });

    res.status(200).json({
      message: "Email Sent",
      success: true,
    });
  } catch (error) {
    res.status(400).json({ message: "Email Not Sent", error, success: false });
  }
};
// restPassword
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: "Please enter all fields" });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      restPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid Token" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.restPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password Reset", success: true });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Password Not Reset", error, success: false });
  }
};
// checke user have cookie or not
const verifyUserCookie = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "No Token, Authorization Denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT);
    req.user = decoded;
    res.status(200).json({ message: "Token is valid", success: true });
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};
// Logout
const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "User Logged Out", success: true });
};

export {
  registerUser,
  verifyUser,
  login,
  forgotPassword,
  resetPassword,
  verifyUserCookie,
  logout,
};
