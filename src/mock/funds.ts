// src/mock/funds.ts
// SmartFund interface for mock funds
export interface SmartFund {
  id: string;
  userId: string;
  allowedCategories: string[];
  allowedVendors: string[];
  maxAmount: number;
  expiry: number; // Unix timestamp (ms)
  usageLimit: number;
  usageCount: number;
}

// Mock funds array
export const funds: SmartFund[] = [
  {
    id: "fund-1",
    userId: "user-1",
    allowedCategories: ["food"],
    allowedVendors: ["vendor-1"],
    maxAmount: 1000,
    expiry: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
    usageLimit: 10,
    usageCount: 0
  },
  {
    id: "fund-2",
    userId: "user-2",
    allowedCategories: ["rent"],
    allowedVendors: ["vendor-4"],
    maxAmount: 5000,
    expiry: Date.now() + 60 * 24 * 60 * 60 * 1000, // 60 days from now
    usageLimit: 1,
    usageCount: 0
  }
];
