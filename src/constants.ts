export const STORAGE_KEY='vybe-data'
export const VYBE_URL='http://localhost:8080' // TODO: replace with the live service url
export const AUTH_ENDPOINT=`${VYBE_URL}/authenticate/wallet`
export const PURCHASE_ENDPOINT=`${VYBE_URL}/credits/purchase/verify`
export const AUTH_MSG="Please sign this message to authenticate with your Vybe account."

// Errors
export class AuthFailedError extends Error {}
