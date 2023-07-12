import { PrismaClient, Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
const prisma = new PrismaClient();

interface ExpenseBody {
  description: string;
  type: string;
  value: number;
  category_name: string;
}

export class ExpenseController {
  static async getAllExpenses(req: Request, res: Response, next: NextFunction) {
    const allExpenses = await prisma.expense.findMany({
      include: { category: true },
    });

    res.json(allExpenses);
  }

  static async getExpenseById(req: Request, res: Response, next: NextFunction) {
    const id = parseInt(req.params.id);
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: { category: true },
    });

    if (expense == null) {
      res.status(404).json({ message: "Expense not found" });
    } else {
      res.json(expense);
    }
  }

  static async postExpense(req: Request, res: Response, next: NextFunction) {
    const { description, type, value, category_name } = req.body as ExpenseBody;
    const expense = await prisma.expense.create({
      data: {
        description,
        type,
        value,
        category: {
          connect: {
            name: category_name,
          },
        },
      },
    });

    res.status(201).json(expense);
  }

  static async updateExpense(req: Request, res: Response, next: NextFunction) {
    const id = parseInt(req.params.id);
    const { type, description, value, category_name } = req.body as ExpenseBody;

    try {
      const expense = await prisma.expense.update({
        where: { id },
        data: {
          type: type,
          description: description,
          value: value,
          category:
            category_name != null
              ? {
                  connect: {
                    name: category_name,
                  },
                }
              : {},
        },
      });

      res.json(expense);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        res.status(404).json({ message: "Expense not found" });
      } else {
        res.sendStatus(500);
      }
    }
  }

  static async deleteExpense(req: Request, res: Response, next: NextFunction) {
    const id = parseInt(req.params.id);
    try {
      await prisma.expense.delete({
        where: { id },
      });

      res.sendStatus(204);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        res.status(404).json({ message: "Expense not found" });
      } else {
        res.sendStatus(500);
      }
    }
  }
}
