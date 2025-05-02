import { Request, Response } from "express";
import prisma from "@/server/utils/prisma";
import {
    subMonths,
    startOfMonth,
    isAfter,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";

/**
 * @param req
 *  - merchantId 
 * @param res 
 * @returns 
 * res:
 * - currentMonthRevenue: number,
 * - lastMonthRevenue: number,
 * - revenueChangePercent: number,
 * - orderCount: number,
 * - avgOrderValue: number,
 */
export default async function monthOverview(req: Request, res: Response) {
    const merchantId = Number(req.query.merchantId);

    if (isNaN(merchantId)) {
        res.status(400).json({ error: "Invalid or missing merchantId" });
        return;
    }

    try {
        const now = toZonedTime(new Date(), "UTC");

        // get last and current month orders
        const startOfThisMonth = startOfMonth(now);
        const startOfLastMonth = subMonths(startOfThisMonth, 1);

        const orders = await prisma.order.findMany({
            where: {
                merchantId,
                createdAt: {
                    gte: startOfLastMonth,
                    lte: now,
                },
            },
            select: {
                totalAmount: true,
                createdAt: true,
            },
        });
        
        const currentMonthOrders = orders.filter(order =>
            isAfter(order.createdAt, startOfThisMonth)
        );
        
        const lastMonthOrders = orders.filter(order =>
            order.createdAt >= startOfLastMonth && order.createdAt < startOfThisMonth
        );

        // percent change
        const sum = (arr: typeof orders) => {
            return arr.reduce((total, order) => total + order.totalAmount, 0);
        }

        const currentRevenue = sum(currentMonthOrders);
        const lastMonthRevenue = sum(lastMonthOrders);
        const revenueGrowth = (lastMonthRevenue === 0) ? 100 : ((currentRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

        // number of orders
        const orderCount = currentMonthOrders.length;
        const avgOrderValue = orderCount === 0 ? 0 : currentRevenue / orderCount;

        res.json({
            currentMonthRevenue: currentRevenue.toFixed(2),
            lastMonthRevenue: lastMonthRevenue.toFixed(2),
            revenueChangePercent: revenueGrowth.toFixed(2),
            orderCount: orderCount,
            avgOrderValue: avgOrderValue.toFixed(2),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
}