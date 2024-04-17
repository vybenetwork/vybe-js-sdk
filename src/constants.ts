// TODO: replace these with the live versions
export const VYBE_URL='http://localhost:8080'
export const CREDITS_PRICE_USDC=5_000_000
export const VYBE_WALLET="9XeDuDohkKyQCMXmkCu89u6nudRTkdpJN93v53KLGwnm"
export const USDC_MINT='Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'

// Known constants
export const STORAGE_KEY='vybe-data'
export const AUTH_ENDPOINT=`${VYBE_URL}/authenticate/wallet`
export const PURCHASE_ENDPOINT=`${VYBE_URL}/credits/purchase/verify`
export const AUTH_MSG="Please sign this message to authenticate with your Vybe account."

// Errors
export class NotAuthenticatedError extends Error {}
export class AuthFailedError extends Error {}
export class CreditPurchaseError extends Error {}
