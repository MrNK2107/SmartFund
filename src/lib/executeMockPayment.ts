// src/lib/executeMockPayment.ts
import { funds } from "../mock";
import { validatePayment } from "./validatePayment";

/**
 * Simulates a payment by validating and updating usageCount if successful.
 * @param fundId - The fund to use
 * @param vendorId - The vendor to pay
 * @param amount - The payment amount
 * @returns { success: boolean; message: string }
 */
export function executeMockPayment(
  fundId: string,
  vendorId: string,
  amount: number
): { success: boolean; message: string } {
  const validation = validatePayment(fundId, vendorId, amount);
  if (!validation.success) {
    return { success: false, message: validation.reason || "Payment rejected" };
  }
  // Increment usageCount for the fund
  const fund = funds.find((f) => f.id === fundId);
  if (fund) {
    fund.usageCount += 1;
  }
  return { success: true, message: "Payment executed successfully" };
}
