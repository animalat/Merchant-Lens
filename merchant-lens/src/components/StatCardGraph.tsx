"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

export default function StatCardGraph({ title, chartData }: { title: string; chartData: { date: string; revenue: number }[] }) {
    let totalRevenue = 0;
    for (let i = 0; i < chartData.length; ++i) {
        totalRevenue += chartData[i].revenue;
    }

    return (
    <Card className="bg-white text-black">
        <CardHeader>
        <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
        <div className="text-2xl font-bold mb-4">{totalRevenue}</div>
        <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip />
                <Area
                type="monotone"
                dataKey="revenue"
                stroke="#212529"
                fill="#a5a5a5"
                strokeWidth={2}
                />
            </AreaChart>
            </ResponsiveContainer>
        </div>
        </CardContent>
    </Card>
    );
}
