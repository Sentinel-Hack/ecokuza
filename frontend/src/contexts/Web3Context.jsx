import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { SUPPORTED_CHAINS, DEFAULT_CHAIN_ID } from '../config/contracts';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState('');
  const [chainId, setChainId] = useState(DEFAULT_CHAIN_ID);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize provider and check connection
  const init = async () => {
    if (window.ethereum) {
      try {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(web3Provider);

        // Check if already connected
        const accounts = await web3Provider.listAccounts();
        if (accounts.length > 0) {
          await handleAccountsChanged(accounts);
        }

        // Set up event listeners
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
        
        const network = await web3Provider.getNetwork();
        setChainId(network.chainId);
      } catch (error) {
        console.error('Error initializing Web3:', error);
      }
    }
    setIsLoading(false);
  };

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      setAccount('');
      setSigner(null);
      setIsConnected(false);
    } else {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = web3Provider.getSigner();
      setAccount(accounts[0]);
      setSigner(signer);
      setIsConnected(true);
    }
  };

  const handleChainChanged = (chainId) => {
    window.location.reload();
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      window.open('https://metamask.io/download.html', '_blank');
      return;
    }

    try {
      setIsLoading(true);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // Switch to the default chain if needed
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${DEFAULT_CHAIN_ID.toString(16)}` }],
        });
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          const chain = SUPPORTED_CHAINS[DEFAULT_CHAIN_ID];
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${DEFAULT_CHAIN_ID.toString(16)}`,
                chainName: chain.name,
                nativeCurrency: {
                  name: chain.currency,
                  symbol: chain.currency,
                  decimals: 18,
                },
                rpcUrls: [chain.rpcUrl],
                blockExplorerUrls: [chain.explorer],
              },
            ],
          });
        } else {
          throw switchError;
        }
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      init();
    } else {
      setIsLoading(false);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        account,
        chainId,
        isConnected,
        isLoading,
        connectWallet,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
