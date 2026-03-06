/**
 * API Client for SustainCommerce Backend
 * Centralized fetch wrapper for all API endpoints
 */

const API_BASE = "/api";

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    total?: number;
    detail?: string;
}

async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const url = `${API_BASE}${endpoint}`;

    const config: RequestInit = {
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
            errorData.detail || `API Error: ${response.status} ${response.statusText}`
        );
    }

    return response.json();
}

// =============================================
// Product Metadata API
// =============================================

export async function generateProductMetadata(name: string, description: string) {
    return request("/generate-product-metadata", {
        method: "POST",
        body: JSON.stringify({ name, description }),
    });
}

export async function getProducts() {
    return request("/products");
}

// =============================================
// B2B Proposal API
// =============================================

export async function generateB2BProposal(
    budget: number,
    purpose: string,
    quantity: number
) {
    return request("/generate-b2b-proposal", {
        method: "POST",
        body: JSON.stringify({ budget, purpose, quantity }),
    });
}

export async function getProposals() {
    return request("/proposals");
}

// =============================================
// AI Logs API
// =============================================

export async function getAILogs(
    search: string = "",
    module: string = "all",
    skip: number = 0,
    limit: number = 50
) {
    const params = new URLSearchParams({
        search,
        module,
        skip: String(skip),
        limit: String(limit),
    });
    return request(`/ai-logs?${params}`);
}

// =============================================
// Dashboard API
// =============================================

export async function getDashboardStats() {
    return request("/dashboard/stats");
}
