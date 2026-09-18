import express from "express";
import { register, login } from "../controllers/auth.controller.js";
import { googleCallback } from "../controllers/auth.controller.js";
import { registerValidation } from "../validators/auth.validator.js";
import { validate } from "../middlewares/validation.middleware.js";
import { verifyEmail } from "../controllers/auth.controller.js";
import passport from "passport";
import {
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", registerValidation, validate, register);
router.get("/verify/:token", verifyEmail);

router.post("/login", login);


router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);


router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
  }),
  googleCallback,
);


router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

export default router;