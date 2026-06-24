import User from "../models/user.model.js"
import Profile from "../models/profile.model.js"

import bcrypt from "bcrypt";


export const register = async (req, res) => {
    try {
        const { name, email, password, username } = req.body;

        if (name || email || password || username) return res.status(400).json({ message: "Enter the required field.." });

        const user = await User.findOne({
            email
        });

        if (user) return res.status(400).json({ message: "User already exists" });


        const hasedPassword = await bcrypt.hash(password, 10);
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

        res.json({ message: "User created successfully" });

    } catch (err) {
        return res.status(500).json({ message: error.message });
    }
}