import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
const prisma = new PrismaClient();

export class CategoryController {
  static async getAllCategories(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const allCategories = await prisma.category.findMany();

    res.json(allCategories);
  }
}
