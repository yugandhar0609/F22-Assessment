import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import validator from 'validator';
import UserDB from '../Models/UserModels.js';
import dotenv from 'dotenv';

dotenv.config(); 

// Email Transporter Setup
const transporter = nodemailer.createTransport({
  service: 'Gmail', 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const userRegister = async (req, res) => {
  try {
    const { userName, password, email } = req.body;
    
    // Validate email
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate password strength
    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({ message: "Password is not strong enough" });
    }

    const existingUser = await UserDB.findOne({
      $or: [{ userName }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const jwtSecret = process.env.jwt_Token;
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = jwt.sign({ email }, jwtSecret, { expiresIn: '1h' });

    const newUser = new UserDB({
      userName,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationToken,
    });
    await newUser.save();

    // Send verification email
    const verificationUrl = `${process.env.BASE_URL}/verify-email?token=${verificationToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification',
      html: `<p>Please verify your email by clicking <a href="${verificationUrl}">here</a>.</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: "User registered successfully. Please check your email to verify your account." });
  } catch (error) {
    res.status(501).json({ message: "Registration failed", error: error.message });
  }
};

// Initiate Password Reset
export const initiatePasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await UserDB.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    user.resetToken = resetToken;
    await user.save();

    // Send reset email
    const resetUrl = `${process.env.BASE_URL}/api/users/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset',
      html: `<p>Please reset your password by clicking <a href="${resetUrl}">here</a>.</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    res.status(500).json({ message: "Failed to initiate password reset", error: error.message });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Validate password strength
    if (!validator.isStrongPassword(newPassword)) {
      return res.status(400).json({ message: "Password is not strong enough" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserDB.findOne({ email: decoded.email, resetToken: token });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to reset password", error: error.message });
  }
};

// Email Verification
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserDB.findOne({ email: decoded.email, verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Email verification failed", error: error.message });
  }
};


export const userLogin = async (req, res) => {
  try {
    const user = await UserDB.findOne({ userName: req.body.userName });
    if (!user) {
      return res
        .status(401)
        .json({ error: "Authentication failed user invailed" });
    }

    const passwordMatch = await bcrypt.compare( req.body.password, user.password );

    if (!passwordMatch) {
      return res
        .status(401)
        .json({ error: "Authentication failed password incorrect" });
    }

    const jwtSecret = process.env.jwt_Token;
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "7d" });

    res.status(200).json({ message: "Login successful.", token });

  } 
  
  catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};


