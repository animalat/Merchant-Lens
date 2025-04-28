import express from 'express';
import { PrismaClient } from "@prisma/client";
import cors from "cors";

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/hello', (_req, res) => {
  res.json({ message: 'Hello from Express backend!' });
});

app.get("/api/metrics", async (req, res) => {
  const merchantId = Number(req.query.merchantId);

  if (isNaN(merchantId)) {
    res.status(400).send({ error: "Invalid or missing merchantId" });
    return;
  }

  try {
    const totalRevenue = await prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        merchantId,
      },
    });

    const totalOrders = await prisma.order.count({
      where: {
        merchantId,
      },
    });

    const totalCustomers = await prisma.customer.count({
      where: {
        orders: {
          some: {
            merchantId,
          },
        },
      },
    });

    res.json({
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      totalOrders,
      totalCustomers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
