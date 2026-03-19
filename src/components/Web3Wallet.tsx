// src/components/Web3Wallet.tsx
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export function Web3Wallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (!isConnected) {
    return (
      <button onClick={() => connect({ connector: connectors[0] })}>
        Connect Wallet
      </button>
    );
  }
  return (
    <div>
      <span>Connected: {address}</span>
      <button onClick={() => disconnect()}>Disconnect</button>
    </div>
  );
}
