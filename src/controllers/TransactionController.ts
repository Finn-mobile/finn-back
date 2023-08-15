import { PrismaClient, Prisma, Type } from "@prisma/client";
import { NextFunction, Response } from "express";
import axios from "axios";
import { AuthRequest } from "../@types/authRequest";
const prisma = new PrismaClient();

interface TransactionBody {
  description: string;
  type: Type;
  amount: number;
  category_name: string;
}

export class TransactionController {
  static async transactionInputMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    const data = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            'Você será um tradutor de texto natural para JSON, você gerará uma lista de transactions com os campos que serão: type (que pode ser: "Gasto", "Recebimento"), description(string), amount(float), category_name(que pode ser: "Transporte", "Alimentação",  "Moradia", "Lazer", "Educação", "Saúde", "Compras", "Serviços", "Outros")',
        },
        {
          role: "user",
          content:
            "Traduza para JSON os texto que está entre backticks\n`Comprei um lanche de 20 reais`",
        },
        {
          role: "assistant",
          content:
            '{"transactions": [{\n  "type": "Gasto",\n  "description": "Lanche",\n  "amount": 20,\n  "category_name": "Alimentação"\n}]}',
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

    req.body = JSON.parse(response.data.choices[0].message.content)["transactions"];
    next();
  }

  static async getAllTransactions(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const { type, description, category_name } = req.query as any;
    const { min_amount, max_amount } = req.query;

    const allTransactions = await prisma.transaction.findMany({
      include: { category: true },
      where: {
        type,
        description: {
          contains: description,
          mode: "insensitive",
        },
        amount: {
          gte: Number(min_amount) || undefined,
          lte: Number(max_amount) || undefined,
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

    res.json(allTransactions);
  }

  static async getTransactionById(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const id = parseInt(req.params.id);
    const transaction = await prisma.transaction.findFirst({
      where: { id, user: { id: userId } },
      include: { category: true },
    });

    if (transaction == null) {
      res.status(404).json({ message: "Transaction not found" });
    } else {
      res.json(transaction);
    }
  }

  static async postTransaction(req: AuthRequest, res: Response) {
    const userId = req.user?.id;

    if (req.body instanceof Array) {
      const transactions = await TransactionController.#postTransactionList(
        req.body as [TransactionBody],
        userId as number
      );

      res.status(201).json(transactions);
    } else if (req.body) {
      const transaction = await TransactionController.#postTransactionObject(
        req.body as TransactionBody,
        userId as number
      );

      res.status(201).json(transaction);
    }
  }

  static async #postTransactionList(transactions: [TransactionBody], userId: number) {
    const createdTransactions: any = [];
    for (const transaction of transactions) {
      const createdTransaction = await TransactionController.#postTransactionObject(
        transaction,
        userId
      );
      createdTransactions.push(createdTransaction);
    }

    return createdTransactions;
  }

  static async #postTransactionObject(transaction: TransactionBody, userId: number) {
    const { description, type, amount, category_name } = transaction;
    const createdTransaction = await prisma.transaction.create({
      data: {
        description,
        type,
        amount,
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

    return createdTransaction;
  }

  static async updateTransaction(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const id = parseInt(req.params.id);
    const { type, description, amount, category_name } = req.body as TransactionBody;

    try {
      const transaction = await prisma.transaction.update({
        where: { user: { id: userId }, id },
        data: {
          type,
          description,
          amount,
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

      res.json(transaction);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        res.status(404).json({ message: "Transaction not found" });
      } else {
        res.sendStatus(500);
      }
    }
  }

  static async deleteTransaction(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const id = parseInt(req.params.id);
    try {
      await prisma.transaction.delete({
        where: { id, user: { id: userId } },
      });

      res.sendStatus(204);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        res.status(404).json({ message: "Transaction not found" });
      } else {
        res.sendStatus(500);
      }
    }
  }
}
