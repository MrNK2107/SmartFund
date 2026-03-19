// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SmartFund.sol";

/**
 * @title SmartFundMultiVendor
 * @notice Extension of SmartFund that supports multiple approved vendors per fund.
 */
contract SmartFundMultiVendor is SmartFund {

    // ── Events ──────────────────────────────────────────────────────
    event VendorAdded(uint256 indexed fundId, address vendor);
    event VendorRemoved(uint256 indexed fundId, address vendor);

    /**
     * @notice Add an approved vendor to a fund.
     * @param fundId Fund to update
     * @param vendor Vendor address to approve
     */
    function addVendor(uint256 fundId, address vendor) external onlyFundCreator(fundId) {
        require(vendor != address(0), "Invalid vendor address");
        require(!approvedVendors[fundId][vendor], "Vendor already approved");
        approvedVendors[fundId][vendor] = true;
        emit VendorAdded(fundId, vendor);
    }

    /**
     * @notice Remove an approved vendor from a fund.
     * @param fundId Fund to update
     * @param vendor Vendor address to remove
     */
    function removeVendor(uint256 fundId, address vendor) external onlyFundCreator(fundId) {
        require(approvedVendors[fundId][vendor], "Vendor not approved");
        // Don't allow removing the primary vendor
        require(vendor != funds[fundId].allowedVendor, "Cannot remove primary vendor");
        approvedVendors[fundId][vendor] = false;
        emit VendorRemoved(fundId, vendor);
    }

    /**
     * @notice Check if a vendor is approved for a fund.
     * @param fundId Fund to check
     * @param vendor Vendor address to check
     * @return Whether the vendor is approved
     */
    function isVendorApproved(uint256 fundId, address vendor) external view returns (bool) {
        return vendor == funds[fundId].allowedVendor || approvedVendors[fundId][vendor];
    }
}
