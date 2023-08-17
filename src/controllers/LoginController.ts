import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

export class LoginController {
  static async login(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body;

    if (!email || !password) return res.status(401).json({ error: "Invalid email or password" });

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: process.env.JWT_EXPIRATION_TIME,
    });

    const { password: _, ...loggedUser } = user;
    res.json({ user: loggedUser, token });
  }

  static async signup(req: Request, res: Response, next: NextFunction) {
    const { email, password, name } = req.body;

    if (!email || !password || !name) return res.status(401).json({ error: "Missing email, password or name"})

    const hashedPassword = await bcrypt.hash(password, 10);

  
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) return res.status(401).json({ error: "Email is taken" });
    
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      },
    });

    const { password: _, ...createdUser } = newUser;
    res.status(201).json({ createdUser });
  }
}
