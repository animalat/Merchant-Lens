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

export async function fetchMonthOverview(merchantId: number) {
    const res = await fetch(`${baseUrl}/api/metrics/month-overview?merchantId=${merchantId}`, {
        cache: "no-store",
    });
    
    if (!res.ok) {
        throw new Error("Failed to fetch metrics");
    }

    return res.json();
}

export async function fetchCustomerMetrics(merchantId: number, month: string) {
    const res = await fetch(`${baseUrl}/api/metrics/customer-metrics?merchantId=${merchantId}&month=${month}`, {
        cache: "no-store",
    });
    
    if (!res.ok) {
        throw new Error("Failed to fetch metrics");
    }

    return res.json();
}

export async function fetchTopProducts(merchantId: number, month: string) {
    const res = await fetch(`${baseUrl}/api/metrics/top-products?merchantId=${merchantId}&month=${month}`, {
        cache: "no-store",
    });
    
    if (!res.ok) {
        throw new Error("Failed to fetch metrics");
    }

    return res.json();
}

export async function fetchRevenueOverTime(merchantId: number, numTime: number, timeType: string) {
    const res = await fetch(`${baseUrl}/api/metrics/revenue-over-time?merchantId=${merchantId}&numTime=${numTime}&timeType=${timeType}`, {
        cache: "no-store",
    });
    
    if (!res.ok) {
        throw new Error("Failed to fetch metrics");
    }

    return res.json();
}
