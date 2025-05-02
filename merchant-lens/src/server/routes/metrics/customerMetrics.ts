import { Request, Response } from "express";
import prisma from "@/server/utils/prisma";
import { 
    parse, 
    startOfMonth, 
    endOfMonth, 
    isValid 
} from 'date-fns';
import { toZonedTime } from "date-fns-tz";

/**
 * Get top customers, returning customers (#), new customers (#)
 * @param req 
 *  - merchantId
 *  - month desired (yyyy-MM)
 * @param res 
 * @returns 
 * res:
 * - topCustomers: { name: string; total: number }[]
 * - returningCustomerCount: number
 * - newCustomerCount: number
 */
export default async function customerMetrics(req: Request, res: Response) {
    const merchantId = Number(req.query.merchantId);
    const month = req.query.month;
    
    if (isNaN(merchantId)) {
        res.status(400).json({ error: "Invalid or missing merchantId" });
        return;
    }

    if (typeof month !== 'string') {
        res.status(400).json({ error: "Invalid or missing month" });
        return;
    }

    const parsedMonth = parse(month, 'yyyy-MM', new Date());
    if (!isValid(parsedMonth)) {
        res.status(400).json({ error: "Invalid month, use format YYYY-MM" });
        return;
    }

    try {
        const startDate = toZonedTime(startOfMonth(parsedMonth), "UTC");
        const endDate = toZonedTime(endOfMonth(parsedMonth), "UTC");

        // top customers this month
        const ordersWithCustomers = await prisma.order.findMany({
            where: {
                merchantId,
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                customer: true,
            },
        });

        const customerSpending: Record<number, { name: string; total: number }> = {};

        for (const order of ordersWithCustomers) {
            if (!customerSpending[order.customerId]) {
                customerSpending[order.customerId] = {
                    name: order.customer.name,
                    total: 0,
                };
            }

            customerSpending[order.customerId].total += order.totalAmount;
        }

        for (const order of Object.values(customerSpending)) {
            order.total = Number(order.total.toFixed(2));
        }

        const topCustomers = Object.values(customerSpending).sort((a, b) => b.total - a.total).slice(0, 5);

        // returning and new customers
        const customerIdsThisMonth = new Set(ordersWithCustomers.map(order => order.customerId));

        const returningCustomerCount = await prisma.customer.count({
            where: {
                id: {
                    in: [...customerIdsThisMonth],
                },
                orders: {
                    some: {
                        createdAt: { lt: startDate },
                        merchantId,
                    },
                },
            },
        });

        const newCustomerCount = customerIdsThisMonth.size - returningCustomerCount;

        res.json({
            topCustomers: topCustomers,
            returningCustomerCount: returningCustomerCount,
            newCustomerCount: newCustomerCount,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
}