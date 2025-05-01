import StatCard from "@/components/StatCard";

export default async function DashboardPage() {
    const data = {
        totalRevenue: 9700.65,
        totalOrders: 20,
        totalCustomers: 20,
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-950 to-blue-800 text-white p-8">
            <h1 className="text-3xl font-bold mb-6">Merchant Dashboard</h1>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard title="Total Revenue" value={`$${data.totalRevenue.toFixed(2)}`} />
            <StatCard title="Total Orders" value={data.totalOrders} />
            <StatCard title="Total Customers" value={data.totalCustomers} />
            </div>
        </div>
    );
}
