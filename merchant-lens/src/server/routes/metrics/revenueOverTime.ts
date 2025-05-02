import { Request, Response } from "express";
import prisma from "@/server/utils/prisma";
import {
    format,
    subMonths,
    startOfMonth,
    addMonths,
    subDays,
    startOfDay,
    addDays,
    subWeeks,
    startOfWeek,
    addWeeks,
    isAfter,
} from "date-fns";
import { toZonedTime } from 'date-fns-tz';

/**
 * @param req
 *  - merchantId
 *  - numTime (how many timeType units to get)
 *  - timeType (the unit of time desired; day|week|month)
 * @param res 
 * @returns 
 */
export default async function revenueOverTime(req: Request, res: Response) {
    const merchantId = Number(req.query.merchantId);
    const numTime = Number(req.query.numTime);
    const timeType = req.query.timeType;

    if (isNaN(merchantId)) {
        res.status(400).json({ error: "Invalid or missing merchantId" });
        return;
    }

    if (isNaN(numTime)) {
        res.status(400).json({ error: "Invalid or missing numTime" });
        return;
    }

    if (typeof timeType !== "string") {
        res.status(400).json({ error: "Invalid or missing timeType" });
        return;
    }

    let subFunc = subMonths;
    let startOfFunc = startOfMonth;
    let addFunc = addMonths;
    let timeTypeString = "yyyy-MM";
    if (timeType == "month") {
        /**
         * The following will be used,
         * subFunc = subMonths;
         * startOfFunc = startOfMonth;
         * addFunc = addMonths;
         * timeTypeString = "yyyy-MM";
         */
    } else if (timeType == "week") {
        subFunc = subWeeks;
        startOfFunc = startOfWeek;
        addFunc = addWeeks;
        timeTypeString = "yyyy-MM-dd";
    } else if (timeType == "day") {
        subFunc = subDays;
        startOfFunc = startOfDay;
        addFunc = addDays;
        timeTypeString = "yyyy-MM-dd";
    } else {
        res.status(400).json({ error: "Invalid timeType: must be month|week|day" });
        return;
    }

    const now = new Date();
    const startDate = subFunc(now, numTime - 1);

    try {
        const orders = await prisma.order.findMany({
            where: {
                merchantId,
                createdAt: {
                    gte: startDate,
                    lte: now,
                },
            },
            select: {
                totalAmount: true,
                createdAt: true,
            },
        });

        const revenueMap: Record<string, number> = {};
        for (const order of orders) {
            const zoned = toZonedTime(order.createdAt, 'UTC');
            const bucket = format(startOfFunc(zoned), timeTypeString);
            revenueMap[bucket] = (revenueMap[bucket] || 0) + order.totalAmount;
        }

        // fill in the remaining times w/ 0
        const result = [];
        let current = startOfFunc(startDate);

        while (!isAfter(current, now)) {
            const label = format(current, timeTypeString);
            result.push({
                date: label,
                revenue: Number((revenueMap[label] || 0).toFixed(2)),
            });
            current = addFunc(current, 1);
        }

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
}
