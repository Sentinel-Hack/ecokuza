import { useEffect, useState, useCallback } from 'react';
import { getContract, getContracts } from '../utils/contracts';
import { useWeb3 } from '../contexts/Web3Context';

export const useContract = (contractName) => {
  const { provider, signer, chainId, isConnected } = useWeb3();
  const [contract, setContract] = useState(null);
  const [contracts, setContracts] = useState({});
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get a single contract
  const getContractInstance = useCallback(async () => {
    if (!provider || !chainId || !contractName) return null;
    
    try {
      const contractInstance = getContract(
        contractName,
        signer || provider,
        chainId
      );
      return contractInstance;
    } catch (err) {
      console.error(`Error getting ${contractName} contract:`, err);
      setError(err);
      return null;
    }
  }, [provider, signer, chainId, contractName]);

  // Get all contracts
  const getContractInstances = useCallback(async () => {
    if (!provider || !chainId) return {};
    
    try {
      return getContracts(signer || provider, chainId);
    } catch (err) {
      console.error('Error getting contracts:', err);
      setError(err);
      return {};
    }
  }, [provider, signer, chainId]);

  // Initialize contracts
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (contractName) {
          const contractInstance = await getContractInstance();
          setContract(contractInstance);
        } else {
          const allContracts = await getContractInstances();
          setContracts(allContracts);
        }
      } catch (err) {
        console.error('Error initializing contracts:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isConnected) {
      init();
    } else {
      setIsLoading(false);
    }
  }, [isConnected, getContractInstance, getContractInstances, contractName]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Helper function to call contract methods
  const callContract = useCallback(
    async (methodName, params = [], options = {}) => {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      try {
        setIsLoading(true);
        const method = contract[methodName];
        
        if (typeof method !== 'function') {
          throw new Error(`Method ${methodName} not found on contract`);
        }

        const tx = await method(...params);
        
        if (options.waitForMine) {
          const receipt = await tx.wait();
          return { tx, receipt };
        }
        
        return { tx };
      } catch (error) {
        console.error(`Error calling ${methodName}:`, error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [contract]
  );

  return {
    contract,
    contracts,
    isLoading,
    error,
    callContract,
  };
};

// Convenience hooks for specific contracts
export const useSentinelClubs = () => useContract('sentinelClubs');
export const usePointsEngine = () => useContract('pointsEngine');
export const useImpactCertificate = () => useContract('impactCertificate');
export const useClubRegistry = () => useContract('clubRegistry');
