import { NextFunction, Request, Response } from "express";
import User from "../models/User.js";
import { hash, compare } from "bcrypt"; // Import compare function
import { createToken } from "../utils/token-manager.js";

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get all users
        const users = await User.find();
        return res.status(200).json({ message: "ok", users });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "ERROR", cause: error.message });
    }
};

export const userSignup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // User signup
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(401).send("User already registered");

        const hashedPassword = await hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        return res.status(201).json({ message: "User created successfully", id: user._id.toString() });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "ERROR", cause: error.message });
    }
};

export const userLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // User login
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).send("User not registered");
        }

        // Compare passwords
        const isPasswordCorrect = await compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(403).send("Incorrect Password");
        }
        //Generating jwt token
        const token = createToken(user._id.toString(), user.email, "7d");
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);
        res.cookie("auth_token", token, {
          path: "/",
          domain: "localhost",
          expires,
          httpOnly: true,
          signed: true,
        });

        // Successful login response (you might want to send a token or user info)
        return res.status(200).json({ message: "Login successful", id: user._id.toString() });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "ERROR", cause: error.message });
    }
};

export default getAllUsers;
