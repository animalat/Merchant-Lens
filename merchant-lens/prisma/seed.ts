import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  // Create merchants
  const numMerchants = 10;
  for (let i = 0; i < numMerchants; i++) {
    const merchant = await prisma.merchant.create({
      data: {
        name: faker.company.name(),
        email: faker.internet.email(),
      },
    });

    // Create products for each merchant
    const numProducts = 5;           // #of products per merchant
    for (let j = 0; j < numProducts; j++) {
      await prisma.product.create({
        data: {
          name: faker.commerce.productName(),
          price: parseFloat(faker.commerce.price({ min: 10, max: 500 })),
          merchantId: merchant.id,
        },
      });
    }

    // Create customers and orders for each merchant
    const numCustomers = 20;         // #of customers per merchant
    for (let k = 0; k < numCustomers; k++) {
      const customer = await prisma.customer.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
        },
      });

      // each customer makes an order
      await prisma.order.create({
        data: {
          merchantId: merchant.id,
          customerId: customer.id,
          totalAmount: parseFloat(faker.commerce.price({ min: 20, max: 1000 })),
        },
      });
    }
  }
}

main()
  .then(async () => {
    console.log("Database seeded successfully");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
