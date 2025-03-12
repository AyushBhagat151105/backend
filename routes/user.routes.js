import express from "express";
import {
  registerUser,
  verifyUser,
  login,
  forgotPassword,
  resetPassword,
  logout,
  verifyUserCookie,
} from "../controller/user.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.get("/verify/:token", verifyUser);
router.post("/login", login);
router.post("/forgotpassword", forgotPassword);
router.post("/resetpassword/:token", resetPassword);
router.post("/logout", logout);
router.get("/me", verifyUserCookie);

export default router;
