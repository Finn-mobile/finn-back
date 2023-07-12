import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const categories = [
    "Transporte",
    "Alimentação",
    "Moradia",
    "Lazer",
    "Educação",
    "Saúde",
    "Compras",
    "Serviços",
    "Outros",
  ];

  for (const category of categories) {
    await prisma.category.create({
      data: {
        name: category,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
