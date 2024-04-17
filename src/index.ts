import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { loadAuthData, storeAuthData } from "./store";
import { isBrowser, resolver } from "./utils";
import { AUTH_ENDPOINT, AUTH_MSG, AuthFailedError, CREDITS_PRICE_USDC, CreditPurchaseError, NotAuthenticatedError, PURCHASE_ENDPOINT, USDC_MINT, VYBE_WALLET } from "./constants";
import bs58 from 'bs58'
import { BaseMessageSignerWalletAdapter, BaseSignerWalletAdapter, WalletNotConnectedError, WalletSendTransactionError } from "@solana/wallet-adapter-base";
import { TOKEN_PROGRAM_ID, createTransferInstruction, getAssociatedTokenAddress } from "@solana/spl-token";

interface Account {
  id: string // UUID,
  credits: number,
  key?: string,
}

interface AuthRequest {
  pk: string
  sig: string
  msg: string
  generate?: boolean
}

async function sendAuthData(body: AuthRequest): Promise<Account> {
  const isoFetch = isBrowser ? fetch : () => Promise.reject('Node is not yet supported.') // support node

  const [err, data] = await resolver(isoFetch(AUTH_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(body)
  }))

  if (err) throw err

  return data?.json()
}

async function auth(adapter: BaseMessageSignerWalletAdapter): Promise<Account | AuthFailedError> {
  if (!adapter.connected) return new AuthFailedError()

  const authData = await loadAuthData()
  const isAuthReq = (ar: Partial<AuthRequest>): ar is AuthRequest => Boolean(ar.pk && ar.msg && ar.sig)
  const requestBody: Partial<AuthRequest> = { msg: AUTH_MSG, pk: adapter.publicKey!.toBase58() }

  if (authData && new PublicKey(authData.pk) === adapter.publicKey) {
    requestBody.sig = authData.sig

    if (!authData.key) {
      requestBody.generate = true
    }
  } else {
    const input = Uint8Array.from(AUTH_MSG.split('').map((x) => x.charCodeAt(0)))
    const output = await adapter.signMessage(input)
    requestBody.sig = bs58.encode(output)
    requestBody.generate = true
  }

  if (!isAuthReq(requestBody)) return new AuthFailedError()

  const [err, resp] = await resolver(sendAuthData(requestBody))

  if (err || !resp) {
    return new AuthFailedError()
  }

  await storeAuthData({
    pk: requestBody.pk,
    sig: requestBody.sig,
    key: authData?.key ?? resp.key!
  })
  
  return resp
}

async function submitTx(adapter: BaseSignerWalletAdapter, connection: Connection): Promise<string> {
  if (!adapter.publicKey) throw new WalletNotConnectedError()

  const toPk = new PublicKey(VYBE_WALLET)  
  const mint = new PublicKey(USDC_MINT)

  const fromUsdcAccount = await getAssociatedTokenAddress(mint, adapter.publicKey)
  const toUsdcAccount = await getAssociatedTokenAddress(mint, toPk)

  const tx = new Transaction()

  // Check if the wallet has a USDC account.
  // This will throw if they don't and the consumer should handle it.
  await connection.getAccountInfo(fromUsdcAccount)

  // Create the USDC transfer instruction
  tx.add(
    createTransferInstruction(
      fromUsdcAccount,
      toUsdcAccount,
      adapter.publicKey,
      CREDITS_PRICE_USDC,
      [],
      TOKEN_PROGRAM_ID
    )
  )

  // Sign the TX
  await adapter.signTransaction(tx)
  // Submit the TX
  const [err, sig] = await resolver(connection.sendRawTransaction(tx.serialize()))
  if (err) throw err

  return sig!
}

async function processCreditPurchase(tx: String, generate = false): Promise<Account> {
  const isoFetch = isBrowser ? fetch : () => Promise.reject('Node is not yet supported.') // support node
  
  const [err, resp] = await resolver(isoFetch(PURCHASE_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({ tx, generate })
  }))

  if (err || !resp ) throw new CreditPurchaseError()
  
  const account: Account = await resp.json()
  return account
}

const purchaseCreditsFactory = (connection: Connection)  => {
  return async function purchaseCredits(adapter: BaseSignerWalletAdapter): Promise<Account> {
    const authData = await loadAuthData()
    if (!authData) throw new NotAuthenticatedError()

    const [err, tx] = await resolver(submitTx(adapter, connection))
    if (err || !tx) throw err || new WalletSendTransactionError()

    const [aerr, account] = await resolver(processCreditPurchase(tx, !authData.key))
    if (aerr || !account) throw new CreditPurchaseError()
   
    return account
  }
}

interface VybeApi {
  auth(signer: BaseMessageSignerWalletAdapter): Promise<Account | AuthFailedError>
  purchaseCredits(adapter: BaseSignerWalletAdapter): Promise<Account | CreditPurchaseError | NotAuthenticatedError>
}

export async function init(connection: Connection): Promise<VybeApi> {
  return {
    auth,
    purchaseCredits: purchaseCreditsFactory(connection)
  }
}
