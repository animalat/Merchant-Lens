import { Request, Response } from "express";
import prisma from "@/server/utils/prisma";

export default async function handleMetricsOverview(req: Request, res: Response) {
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
}
