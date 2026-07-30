import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateToken } from "../utils/generateToken.js";
import { sendEmail } from "../utils/sendEmail.js";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// ================= Register =================
export const register = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (!gmailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Only Gmail accounts are allowed",
      });
    }

    if (role === "admin") {
      return res.status(403).json({
        success: false,
        message: "You can't register as admin.",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Verification Token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Create User
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: role || "user",
      isVerified: false,
      verificationToken,
    });

    // Verification Link
   
      
    const verifyUrl = `http://localhost:5000/api/auth/verify/${verificationToken}`;

await sendEmail(
  user.email,
  "Verify your email",
  `Welcome ${user.fullName}

Thank you for registering in Terhal.

Click the link below to verify your email:

${verifyUrl}

If you didn't create this account, you can ignore this email.`
);

    return res.status(201).json({
      success: true,
      message: "Registration successful. Please check your email.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= Verify Email =================
export const verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification token.",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= Login =================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email first.",
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= Google Callback =================
export const googleCallback = async (req, res) => {
  const token = generateToken(req.user);

  const user = encodeURIComponent(
    JSON.stringify({
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      role: req.user.role,
      isVerified: req.user.isVerified,
    })
  );

  res.redirect(
    `${CLIENT_URL}/auth/google/callback?token=${token}&user=${user}`
  );
};

// ================= Forgot Password =================
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

   const resetUrl = `http://localhost:5000/api/auth/reset-password/${resetToken}`;

 await sendEmail(
  user.email,
  "Reset Password",
  `Hello ${user.fullName},

We received a request to reset your password.

Click the link below to create a new password:

${resetUrl}

If you didn't request a password reset, you can safely ignore this email.`
);

    return res.status(200).json({
      success: true,
      message: "Password reset email sent.",
    });
  } catch (error) {
    next(error);
  }
};

// ================= Reset Password =================
export const resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token.",
      });
    }

    user.password = await bcrypt.hash(req.body.password, 10);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (error) {
    next(error);
  }
};