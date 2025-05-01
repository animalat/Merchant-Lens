type StatCardProps = {
    title: string;
    value: string | number;
};
  
export default function StatCard({ title, value }: StatCardProps) {
    return (
        <div className="rounded-xl border p-6 shadow-sm bg-white">
            <h2 className="text-sm font-medium text-gray-500">{title}</h2>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
        </div>
    );
}
