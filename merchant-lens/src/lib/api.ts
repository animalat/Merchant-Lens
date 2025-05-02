const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function fetchOverview(merchantId: number) {
    const res = await fetch(`${baseUrl}/api/metrics?merchantId=${merchantId}`, {
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch metrics");
    }

    return res.json();
}
