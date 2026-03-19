// src/lib/validatePayment.ts
import { funds, vendors } from "../mock";

/**
 * Validates a payment attempt against fund and vendor rules.
 * @param fundId - The fund to use
 * @param vendorId - The vendor to pay
 * @param amount - The payment amount
 * @returns { success: boolean; reason?: string }
 */
export function validatePayment(
  fundId: string,
  vendorId: string,
  amount: number
): { success: boolean; reason?: string } {
  // Find fund
  const fund = funds.find((f) => f.id === fundId);
  if (!fund) return { success: false, reason: "Fund not found" };

  // Find vendor
  const vendor = vendors.find((v) => v.id === vendorId);
  if (!vendor) return { success: false, reason: "Vendor not found" };

  // Vendor must be active
  if (!vendor.isActive) return { success: false, reason: "Vendor is inactive" };

  // Vendor must be in allowedVendors
  if (!fund.allowedVendors.includes(vendorId))
    return { success: false, reason: "Vendor not allowed for this fund" };

  // Vendor category must be allowed
  if (!fund.allowedCategories.includes(vendor.category))
    return { success: false, reason: "Vendor category not allowed" };

  // Amount must not exceed maxAmount
  if (amount > fund.maxAmount)
    return { success: false, reason: "Amount exceeds fund maximum" };

  // Usage limit not exceeded
  if (fund.usageCount >= fund.usageLimit)
    return { success: false, reason: "Usage limit exceeded" };

  // Fund must not be expired
  if (Date.now() > fund.expiry)
    return { success: false, reason: "Fund expired" };

  // All checks passed
  return { success: true };
}
