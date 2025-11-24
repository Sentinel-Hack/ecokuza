import React from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { Button } from './ui/button';

export const ConnectWalletButton = () => {
  const { account, isConnected, isLoading, connectWallet } = useWeb3();

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (isLoading) {
    return (
      <Button disabled>
        Loading...
      </Button>
    );
  }

  if (isConnected && account) {
    return (
      <Button variant="outline" className="font-mono">
        {formatAddress(account)}
      </Button>
    );
  }

  return (
    <Button onClick={connectWallet}>
      Connect Wallet
    </Button>
  );
};

export default ConnectWalletButton;
