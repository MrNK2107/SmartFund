// src/mock/vendors.ts
// VendorCategory type for different business types
export type VendorCategory = "food" | "rent" | "utilities" | "transport" | "shopping";

// Vendor interface for mock database
export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  walletAddress: string;
  isActive: boolean;
}

// Mock vendors array
export const vendors: Vendor[] = [
  {
    id: "vendor-1",
    name: "Fresh Bites Food Court",
    category: "food",
    walletAddress: "0xVendorWallet000000000000000000000000000001",
    isActive: true
  },
  {
    id: "vendor-2",
    name: "City Utilities Ltd.",
    category: "utilities",
    walletAddress: "0xVendorWallet000000000000000000000000000002",
    isActive: true
  },
  {
    id: "vendor-3",
    name: "Metro Transport",
    category: "transport",
    walletAddress: "0xVendorWallet000000000000000000000000000003",
    isActive: false // Inactive vendor for testing
  },
  {
    id: "vendor-4",
    name: "Patel Properties (Landlord)",
    category: "rent",
    walletAddress: "0xLandlordWallet0000000000000000000000000001",
    isActive: true
  },
  {
    id: "vendor-5",
    name: "Mall Mart Shopping",
    category: "shopping",
    walletAddress: "0xVendorWallet000000000000000000000000000005",
    isActive: true
  }
];
