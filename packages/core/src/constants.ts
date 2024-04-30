import { PublicKey } from '@solana/web3.js'

// TODO: replace these with the live versions
export const VYBE_URL = 'http://localhost:8080'
export const CREDITS_PRICE_USDC = 10_000
export const VYBE_USDC_TOKEN_ACCOUNT = new PublicKey('GLknf9QYByEzRmsEiFeh129XYMDsfGW5zx8TDG8Q75ZF')
export const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')

// Known constants
export const STORAGE_KEY = 'vybe-data'
export const AUTH_ENDPOINT = `${VYBE_URL}/authenticate/wallet`
export const PURCHASE_ENDPOINT = `${VYBE_URL}/credits/purchase/verify`
export const AUTH_MSG = 'Please sign this message to authenticate with your Vybe account.'
export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
export const TOKEN_EXT_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb')
export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')

// Errors
export class NotAuthenticatedError extends Error {}
export class AuthFailedError extends Error {}
export class CreditPurchaseError extends Error {}
export class InsufficientBalanceError extends Error {}
export class TxConfirmationError extends Error {}
