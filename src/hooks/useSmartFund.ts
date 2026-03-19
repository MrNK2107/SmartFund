// src/hooks/useSmartFund.ts
import { useAccount, useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';
import { SMART_FUND_MANAGER_ADDRESS, SMART_FUND_MANAGER_ABI } from '../web3/config';

export function useUserFunds() {
  const { address } = useAccount();
  return useContractRead({
    address: SMART_FUND_MANAGER_ADDRESS,
    abi: SMART_FUND_MANAGER_ABI,
    functionName: 'getUserFunds',
    args: [address],
    watch: true,
  });
}

export function useFundDetails(fundId: bigint) {
  return useContractRead({
    address: SMART_FUND_MANAGER_ADDRESS,
    abi: SMART_FUND_MANAGER_ABI,
    functionName: 'funds',
    args: [fundId],
    watch: true,
  });
}

export function useRequestPayment() {
  const { write, data, isLoading, isSuccess, isError, error } = useContractWrite({
    address: SMART_FUND_MANAGER_ADDRESS,
    abi: SMART_FUND_MANAGER_ABI,
    functionName: 'requestPayment',
  });
  const tx = useWaitForTransaction({ hash: data?.hash });
  return { write, isLoading, isSuccess, isError, error, tx };
}
