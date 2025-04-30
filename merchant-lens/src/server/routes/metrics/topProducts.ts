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
 * Top products (per month).
 * @param req 
 *  - merchantId
 *  - month (YYYY-MM)
 * @param res 
 */
export default async function topProducts(req: Request, res: Response) {
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

        const orders = await prisma.order.findMany({
            where: {
                merchantId,
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        const productSalesMap: Record<number, { name: string; quantity: number; revenue: number }> = {};

        for (const order of orders) {
            for (const item of order.items) {
                const productId = item.productId;
                if (!productSalesMap[productId]) {
                    productSalesMap[productId] = {
                        name: item.product.name,
                        quantity: 0,
                        revenue: 0,
                    };
                }
                
                productSalesMap[productId].quantity += item.quantity;
                productSalesMap[productId].revenue += item.price * item.quantity;
            }
        }

        const topProducts = Object.values(productSalesMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

        // fix floating-point error
        for (const product of Object.values(productSalesMap)) {
            product.revenue = Number(product.revenue.toFixed(2));
        }

        res.json({
            topProducts: topProducts,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
}
