import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../@types/authRequest";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const bearerToken = req.headers["authorization"];
  if (bearerToken === undefined) {
    res.sendStatus(401);
    return;
  }

  const token = bearerToken.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET ?? "", async (err, userInfo: any) => {
    const id = userInfo?.id;
    const user = await prisma.user.findFirst({ where: { id } });

    if (err || !user) {
      res.sendStatus(401);
      return;
    }

    const { password: _, ...loggedUser } = user;
    req.user = loggedUser;
    next();
  });
};
