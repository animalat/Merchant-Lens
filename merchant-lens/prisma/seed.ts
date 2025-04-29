import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { subDays } from "date-fns";

const prisma = new PrismaClient();

const getRandomPastDate = () => {
  const daysAgo = Math.floor(Math.random() * 180); // last ~6 months
  return subDays(new Date(), daysAgo);
};

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

async function main() {
  const numMerchants = 10;

  for (let i = 0; i < numMerchants; i++) {
    const merchant = await prisma.merchant.create({
      data: {
        name: faker.company.name(),
        email: faker.internet.email(),
        createdAt: getRandomPastDate(),
      },
    });

    // Create products
    const products = [];
    for (let j = 0; j < 10; j++) {
      const product = await prisma.product.create({
        data: {
          name: faker.commerce.productName(),
          price: parseFloat(faker.commerce.price({ min: 10, max: 500 })),
          merchantId: merchant.id,
          createdAt: getRandomPastDate(),
        },
      });
      products.push(product);
    }

    // Create customers
    const customers = [];
    for (let k = 0; k < 30; k++) {
      const customer = await prisma.customer.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          createdAt: getRandomPastDate(),
        },
      });
      customers.push(customer);
    }

    // Create orders (some repeat customers)
    const numOrders = randomInt(50, 150);
    for (let l = 0; l < numOrders; l++) {
      const customer = faker.helpers.arrayElement(customers);
      const createdAt = getRandomPastDate();

      const order = await prisma.order.create({
        data: {
          merchantId: merchant.id,
          customerId: customer.id,
          totalAmount: 0, // will be updated later
          createdAt,
        },
      });

      // Add order items (1–4 products)
      const numItems = randomInt(1, 4);
      let total = 0;

      for (let m = 0; m < numItems; m++) {
        const product = faker.helpers.arrayElement(products);
        const quantity = randomInt(1, 5);
        const itemPrice = product.price;

        total += itemPrice * quantity;

        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: product.id,
            quantity,
            price: itemPrice,
          },
        });
      }

      // Update order total
      await prisma.order.update({
        where: { id: order.id },
        data: { totalAmount: total },
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
