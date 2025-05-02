import { fetchOverview, fetchRevenueOverTime } from "@/lib/api";
import StatCard from "@/components/StatCard";
import StatCardGraph from "@/components/StatCardGraph";

export default async function DashboardPage() {
    const merchantId = 1;
    const overviewData = await fetchOverview(merchantId);
    const revenueMonthly = await fetchRevenueOverTime(merchantId, 12, "month");
    const revenueDaily = await fetchRevenueOverTime(merchantId, 30, "day");

    return (
    <div className="min-h-screen bg-gradient-to-r from-[#222222] to-[#222222] text-white p-8">
        <h1 className="text-3xl font-bold mb-6">Merchant Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard title="Total Revenue" value={overviewData.totalRevenue} />
        <StatCard title="Total Orders" value={overviewData.totalOrders} />
        <StatCard title="Total Customers" value={overviewData.totalCustomers} />

        <StatCardGraph title="Monthly Revenue" chartData={revenueMonthly} />
        <StatCardGraph title="Revenue (Last 30 Days)" chartData={revenueDaily} />
        </div>
    </div>
    );
}
