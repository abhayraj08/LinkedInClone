import User from "../models/user.model.js"
import Profile from "../models/profile.model.js"

import bcrypt from "bcrypt";
import crypto from "crypto";


export const register = async (req, res) => {
    try {
        const { name, email, password, username } = req.body;

        if (!name || !email || !password || !username) return res.status(400).json({ message: "Enter the required field.." });

        const user = await User.findOne({
            email
        });

        if (user) return res.status(400).json({ message: "User already exists" });


        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            username
        });

        await newUser.save();

        const profile = new Profile({
            userId: newUser._id
        })

        await profile.save();

        res.json({ message: "User created successfully" });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export const login = async (req, res) => {

    try {
        const { email, password } = req.body;

        if (!email || !password) return res.status(400).json({ message: "Enter the required field.." });

        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: "User does not exit!!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

        const token = crypto.randomBytes(32).toString("hex");

        user.token = token;
        await user.save();

        return res.json({ token });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export const uploadProfilePicture = async (req, res) => {
    const { token } = req.body;

    try {
        const user = await User.findOne({ token: token });

        if (!user) return res.status(200).json({ message: "User does not exist" });

        user.profilePicture = req.file.filename;
        await user.save();

        return res.json({ message: "Profile Picture Updated" });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export const updateUserProfile = async (req, res) => {
    try {
        const { token, ...newUserData } = req.body;

        const user = await User.findOne({ token });

        if (!user) return res.status(404).json({ message: "User not found" });

        const { username, email } = newUserData;

        // Find a user with the same username or email
        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        });

        // Allow if it's the same user, reject if it's another user
        if (existingUser && String(existingUser._id) !== String(user._id)) {
            return res.status(400).json({ message: "Username or email already exists" });
        }

        // Update the user's data
        Object.assign(user, newUserData);
        await user.save();

        return res.status(200).json({ message: "Profile updated successfully", user });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export const getUserAndProfile = async (req, res) => {

    try {
        const { token } = req.body;

        const user = await User.findOne({ token });

        if (!user) return res.status(404).json({ message: "User not found" });

        const userProfile = await Profile.findOne({ userId: user._id })
            .populate('userId', 'name email username profilePicture');

        return res.json(userProfile);

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}