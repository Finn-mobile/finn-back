import { PrismaClient, Prisma, Type } from "@prisma/client";
import { NextFunction, Response } from "express";
import axios from "axios";
import { AuthRequest } from "../@types/authRequest";
const prisma = new PrismaClient();

interface ExpenseBody {
  description: string;
  type: Type;
  value: number;
  category_name: string;
}

export class ExpenseController {
  static async expenseInputMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    const data = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            'Você será um tradutor de texto natural para JSON, os campos que você gererá serão: type (que pode ser: "Gasto", "Recebimento"), description(string), value(float), category_name(que pode ser: "Transporte", "Alimentação",  "Moradia", "Lazer", "Educação", "Saúde", "Compras", "Serviços", "Outros")',
        },
        {
          role: "user",
          content:
            "Traduza para JSON os texto que está entre backticks\n`Comprei um lanche de 20 reais`",
        },
        {
          role: "assistant",
          content:
            '{\n  "type": "Gasto",\n  "description": "Lanche",\n  "value": 20,\n  "category_name": "Alimentação"\n}',
        },
        {
          role: "user",
          content: `Traduza para JSON os texto que está entre backticks\n\`${req.body.input}\``,
        },
      ],
      temperature: 0,
    };

    const openai_api_key = process.env.GPT_BEARER_TOKEN;
    const response = await axios.post("https://api.openai.com/v1/chat/completions", data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openai_api_key}`,
      },
    });

    req.body = JSON.parse(response.data.choices[0].message.content);
    next();
  }

  static async getAllExpenses(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const { type, description, category_name } = req.query as any;
    const { min_value, max_value } = req.query;

    const allExpenses = await prisma.expense.findMany({
      include: { category: true },
      where: {
        type,
        description: {
          contains: description,
          mode: "insensitive",
        },
        value: {
          gte: Number(min_value) || undefined,
          lte: Number(max_value) || undefined,
        },
        category: {
          name: category_name,
        },
        user: {
          id: userId,
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    res.json(allExpenses);
  }

  static async getExpenseById(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const id = parseInt(req.params.id);
    const expense = await prisma.expense.findFirst({
      where: { id, user: { id: userId } },
      include: { category: true },
    });

    if (expense == null) {
      res.status(404).json({ message: "Expense not found" });
    } else {
      res.json(expense);
    }
  }

  static async postExpense(req: AuthRequest, res: Response) {
    const userId = req.user?.id;

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
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });

    res.status(201).json(expense);
  }

  static async updateExpense(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const id = parseInt(req.params.id);
    const { type, description, value, category_name } = req.body as ExpenseBody;

    try {
      const expense = await prisma.expense.update({
        where: { user: { id: userId }, id },
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

  static async deleteExpense(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const id = parseInt(req.params.id);
    try {
      await prisma.expense.delete({
        where: { id, user: { id: userId } },
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
