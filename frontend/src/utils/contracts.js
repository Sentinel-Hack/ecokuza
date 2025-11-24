import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../config/contracts';

// Import contract ABIs
import SentinelClubsABI from '../../contracts/artifacts/contracts/core/SentinelClubs.sol/SentinelClubs.json';
import PointsEngineABI from '../../contracts/artifacts/contracts/core/PointsEngine.sol/PointsEngine.json';
import ImpactCertificateABI from '../../contracts/artifacts/contracts/tokens/ImpactCertificate.sol/ImpactCertificate.json';
import ClubRegistryABI from '../../contracts/artifacts/contracts/registry/ClubRegistry.sol/ClubRegistry.json';

// Contract instances cache
let contractInstances = {};

/**
 * Get contract instance
 * @param {string} contractName - Name of the contract (sentinelClubs, pointsEngine, etc.)
 * @param {ethers.providers.Provider | ethers.Signer} provider - Provider or signer
 * @param {number} chainId - Chain ID
 * @returns {ethers.Contract} Contract instance
 */
export const getContract = (contractName, provider, chainId) => {
  const network = chainId in CONTRACT_ADDRESSES ? chainId : 'localhost';
  const address = CONTRACT_ADDRESSES[network]?.[contractName];
  
  if (!address) {
    throw new Error(`No address found for ${contractName} on chain ${chainId}`);
  }

  const cacheKey = `${contractName}-${address}`;
  if (contractInstances[cacheKey]) {
    return contractInstances[cacheKey];
  }

  let abi;
  switch (contractName) {
    case 'sentinelClubs':
      abi = SentinelClubsABI.abi;
      break;
    case 'pointsEngine':
      abi = PointsEngineABI.abi;
      break;
    case 'impactCertificate':
      abi = ImpactCertificateABI.abi;
      break;
    case 'clubRegistry':
      abi = ClubRegistryABI.abi;
      break;
    default:
      throw new Error(`Unknown contract: ${contractName}`);
  }

  const contract = new ethers.Contract(address, abi, provider);
  contractInstances[cacheKey] = contract;
  return contract;
};

/**
 * Get all contracts for the current chain
 * @param {ethers.providers.Provider | ethers.Signer} provider - Provider or signer
 * @param {number} chainId - Chain ID
 * @returns {Object} Object with contract instances
 */
export const getContracts = (provider, chainId) => {
  const network = chainId in CONTRACT_ADDRESSES ? chainId : 'localhost';
  const contracts = {};
  
  for (const [name, address] of Object.entries(CONTRACT_ADDRESSES[network] || {})) {
    contracts[name] = getContract(name, provider, chainId);
  }
  
  return contracts;
};

/**
 * Format error message from contract call
 * @param {Error} error - Error object
 * @returns {string} Formatted error message
 */
export const formatError = (error) => {
  if (error.code === 4001) {
    return 'Transaction was rejected by user';
  }
  if (error.data?.message) {
    return error.data.message;
  }
  if (error.message) {
    // Extract the revert reason if it's a contract revert
    const revertReason = error.message.match(/reason string: '([^']+)'/);
    if (revertReason && revertReason[1]) {
      return revertReason[1];
    }
    return error.message;
  }
  return 'An unknown error occurred';
};
