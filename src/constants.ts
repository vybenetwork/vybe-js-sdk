import { PublicKey } from "@solana/web3.js"

// TODO: replace these with the live versions
export const VYBE_URL='http://localhost:8080'
export const CREDITS_PRICE_USDC=5_000_000
export const VYBE_USDC_TOKEN_ACCOUNT= new PublicKey("3mkt3uuopZ1A1Ae4o6iSpqBwzrFBRZiXygSnpt1BSzqr")
export const USDC_MINT= new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr')

// Known constants
export const STORAGE_KEY='vybe-data'
export const AUTH_ENDPOINT=`${VYBE_URL}/authenticate/wallet`
export const PURCHASE_ENDPOINT=`${VYBE_URL}/credits/purchase/verify`
export const AUTH_MSG="Please sign this message to authenticate with your Vybe account."
export const TOKEN_PROGRAM_ID= new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')

// Errors
export class NotAuthenticatedError extends Error {}
export class AuthFailedError extends Error {}
export class CreditPurchaseError extends Error {}
export class InsufficientBalanceError extends Error {}
export class TxConfirmationError extends Error {}
