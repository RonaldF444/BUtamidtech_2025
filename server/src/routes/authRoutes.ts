import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();
const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

// ✅ Register a new user
router.post("/register", async (req, res) => {
    try {
        const { email, password, role, username } = req.body; // ✅ Include username
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.users.create({
            data: { email, password: hashedPassword, role, username } // ✅ Include username in Prisma
        });

        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error registering user" });
    }
});


// ✅ Login an existing user
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.users.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ message: "Invalid email or password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

        const token = jwt.sign({ id: user.user_id, role: user.role }, SECRET_KEY, { expiresIn: "1h" }); // ✅ Use user.user_id
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: "Error logging in" });
    }
});


export default router;
