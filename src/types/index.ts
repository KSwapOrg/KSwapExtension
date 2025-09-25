import * as KeetaNet from '@keetanetwork/keetanet-client';

// Core type aliases for readability
export type TokenId = KeetaNet.TokenAddress;
export type AccountId = string;
export type Builder = KeetaNet.Builder;
export type UserClient = KeetaNet.UserClient;
export type Account = KeetaNet.lib.Account;

// Pool configuration and state
export interface Pool {
  id: AccountId;
  tokenA: TokenId;
  tokenB: TokenId;
  lpToken: TokenId;
  reserveA: bigint;
  reserveB: bigint;
  totalLpSupply: bigint;
  feeBps: number;
  protocolFeeBps: number;
  createdAt: number;
}

// Liquidity operations
export interface AddLiquidityParams {
  poolId: AccountId;
  tokenA: TokenId;
  tokenB: TokenId;
  amountA: bigint;
  amountB: bigint;
  minLpTokens: bigint;
  deadline: number;
}

export interface RemoveLiquidityParams {
  poolId: AccountId;
  tokenA: TokenId;
  tokenB: TokenId;
  lpTokenAmount: bigint;
  minAmountA: bigint;
  minAmountB: bigint;
  deadline: number;
}

// Swap operations
export interface SwapParams {
  poolId: AccountId;
  tokenIn: TokenId;
  tokenOut: TokenId;
  amountIn: bigint;
  minAmountOut: bigint;
  deadline: number;
}

export interface SwapQuote {
  amountOut: bigint;
  priceImpact: number;
  fee: bigint;
  protocolFee: bigint;
  executionPrice: number;
}

// Pool creation
export interface CreatePoolParams {
  tokenA: TokenId;
  tokenB: TokenId;
  initialAmountA: bigint;
  initialAmountB: bigint;
  feeBps?: number;
  protocolFeeBps?: number;
}

export interface PoolCreationResult {
  poolId: AccountId;
  lpToken: TokenId;
  initialLpTokens: bigint;
}

// Token metadata
export interface TokenInfo {
  id: TokenId;
  symbol: string;
  name: string;
  decimals: number;
  logoUri?: string;
  balance?: bigint;
}

// Pool statistics
export interface PoolStats {
  tvl: bigint;
  volume24h: bigint;
  fees24h: bigint;
  apr: number;
  lpPrice: number;
}

// Transaction types
export interface TransactionResult {
  blockId: string;
  success: boolean;
  error?: string;
  gasUsed?: bigint;
}

// UI state management
export interface SwapState {
  tokenIn: TokenInfo | null;
  tokenOut: TokenInfo | null;
  amountIn: string;
  amountOut: string;
  slippage: number;
  isLoading: boolean;
  quote: SwapQuote | null;
}

export interface LiquidityState {
  tokenA: TokenInfo | null;
  tokenB: TokenInfo | null;
  amountA: string;
  amountB: string;
  pool: Pool | null;
  isLoading: boolean;
  lpTokensToReceive: bigint;
}

// Error types
export enum KSwapErrorCode {
  INSUFFICIENT_LIQUIDITY = 'INSUFFICIENT_LIQUIDITY',
  SLIPPAGE_EXCEEDED = 'SLIPPAGE_EXCEEDED',
  DEADLINE_EXCEEDED = 'DEADLINE_EXCEEDED',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  POOL_NOT_FOUND = 'POOL_NOT_FOUND',
  TOKEN_NOT_FOUND = 'TOKEN_NOT_FOUND',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

export class KSwapError extends Error {
  constructor(
    public code: KSwapErrorCode,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'KSwapError';
    
    // Suppress unused parameter warnings for details
    if (details) {
      // Details are stored for future use
    }
  }
}

// Constants
export const CONSTANTS = {
  DEFAULT_FEE_BPS: 30, // 0.30%
  DEFAULT_PROTOCOL_FEE_BPS: 5, // 0.05% (out of the 0.30%)
  MAX_SLIPPAGE_BPS: 5000, // 50%
  DEFAULT_SLIPPAGE_BPS: 100, // 1%
  MINIMUM_LIQUIDITY: 1000n, // Minimum LP tokens for first liquidity
  FEE_DENOMINATOR: 10_000n,
  DEADLINE_BUFFER: 20 * 60, // 20 minutes in seconds
} as const;

// Network configuration
export interface NetworkConfig {
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  chainId: string;
  baseToken: TokenId;
  treasuryAccount: AccountId;
}

export const NETWORK_CONFIGS: Record<string, NetworkConfig> = {
  mainnet: {
    name: 'Keeta Mainnet',
    rpcUrl: 'https://rpc.keeta.com',
    explorerUrl: 'https://explorer.keeta.com',
    chainId: 'keeta-mainnet',
    baseToken: 'KTA',
    treasuryAccount: 'keeta-treasury-mainnet',
  },
  testnet: {
    name: 'Keeta Testnet',
    rpcUrl: 'https://static.test.keeta.com',
    explorerUrl: 'https://explorer.test.keeta.com',
    chainId: 'keeta-testnet',
    baseToken: 'KTA',
    treasuryAccount: 'keeta-treasury-testnet',
  },
};

// Event types for analytics/history
export interface PoolEvent {
  type: 'SWAP' | 'ADD_LIQUIDITY' | 'REMOVE_LIQUIDITY' | 'POOL_CREATED';
  poolId: AccountId;
  user: AccountId;
  timestamp: number;
  blockId: string;
  data: Record<string, any>;
}

export interface SwapEvent extends PoolEvent {
  type: 'SWAP';
  data: {
    tokenIn: TokenId;
    tokenOut: TokenId;
    amountIn: bigint;
    amountOut: bigint;
    fee: bigint;
  };
}

export interface LiquidityEvent extends PoolEvent {
  type: 'ADD_LIQUIDITY' | 'REMOVE_LIQUIDITY';
  data: {
    tokenA: TokenId;
    tokenB: TokenId;
    amountA: bigint;
    amountB: bigint;
    lpTokens: bigint;
  };
}
