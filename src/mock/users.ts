// src/mock/users.ts
// Role type for all user types in the system
export type Role = "admin" | "user" | "vendor" | "landlord";

// User interface for mock database
export interface User {
  id: string;
  name: string;
  role: Role;
  walletAddress: string;
}

// Mock users array
export const users: User[] = [
  {
    id: "admin-1",
    name: "Alice Admin",
    role: "admin",
    walletAddress: "0xAdminWallet00000000000000000000000000000001"
  },
  {
    id: "user-1",
    name: "Rahul Sharma",
    role: "user",
    walletAddress: "0xUserWallet00000000000000000000000000000001"
  },
  {
    id: "user-2",
    name: "Priya Singh",
    role: "user",
    walletAddress: "0xUserWallet00000000000000000000000000000002"
  },
  {
    id: "vendor-1",
    name: "Fresh Bites Food Court",
    role: "vendor",
    walletAddress: "0xVendorWallet000000000000000000000000000001"
  },
  {
    id: "vendor-2",
    name: "City Utilities Ltd.",
    role: "vendor",
    walletAddress: "0xVendorWallet000000000000000000000000000002"
  },
  {
    id: "vendor-3",
    name: "Metro Transport",
    role: "vendor",
    walletAddress: "0xVendorWallet000000000000000000000000000003"
  },
  {
    id: "landlord-1",
    name: "Mr. Patel (Landlord)",
    role: "landlord",
    walletAddress: "0xLandlordWallet0000000000000000000000000001"
  }
];
