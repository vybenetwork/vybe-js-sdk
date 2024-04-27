import { BlockheightBasedTransactionConfirmationStrategy, ComputeBudgetProgram, Connection, PublicKey, SendOptions, Transaction } from "@solana/web3.js";
import { loadAuthData, storeAuthData } from "./store";
import { isBrowser, resolver } from "./utils";
import { AUTH_ENDPOINT, AUTH_MSG, AuthFailedError, CREDITS_PRICE_USDC, CreditPurchaseError, InsufficientBalanceError, NotAuthenticatedError, PURCHASE_ENDPOINT, TxConfirmationError, USDC_MINT } from "./constants";
import bs58 from 'bs58'
import { Adapter, BaseMessageSignerWalletAdapter, BaseSignerWalletAdapter, WalletNotConnectedError, WalletSendTransactionError } from "@solana/wallet-adapter-base";
import { checkTokenBalance, createCreditPurchaseInstruction, getSPLTokenAccount } from "./spl";

export interface Account {
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
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }))

  if (err) throw err

  return data?.json()
}

async function auth(adapter: Adapter): Promise<Account> {
  if (!adapter.connected || !adapter.publicKey) throw new AuthFailedError()

  const authData = await loadAuthData()
  const isAuthReq = (ar: Partial<AuthRequest>): ar is AuthRequest => Boolean(ar.pk && ar.msg && ar.sig)
  const requestBody: Partial<AuthRequest> = { msg: AUTH_MSG, pk: adapter.publicKey!.toBase58() }

  if (authData && new PublicKey(authData.pk).equals(adapter.publicKey)) {
    requestBody.sig = authData.sig

    if (!authData.key) {
      requestBody.generate = true
    }
  } else {
    const input = Uint8Array.from(AUTH_MSG.split('').map((x) => x.charCodeAt(0)))
    const output = await (adapter as BaseMessageSignerWalletAdapter).signMessage(input)
    requestBody.sig = bs58.encode(output)
    requestBody.generate = true
  }

  if (!isAuthReq(requestBody)) throw new AuthFailedError()

  const [err, resp] = await resolver(sendAuthData(requestBody))

  if (err || !resp) throw new AuthFailedError()

  await storeAuthData({
    pk: requestBody.pk,
    sig: requestBody.sig,
    key: authData?.key ?? resp.key!
  })
  
  // return resp
  return {
    ...resp,
    key: authData?.key ?? resp.key!
  }
}

async function submitTx(adapter: Adapter, connection: Connection): Promise<string> {
  if (!adapter.publicKey) throw new WalletNotConnectedError()

  const senderTokenAccount = getSPLTokenAccount(adapter.publicKey, USDC_MINT)

  const hasSufficientBalance = await checkTokenBalance(senderTokenAccount, CREDITS_PRICE_USDC, connection)
  if (!hasSufficientBalance) throw new InsufficientBalanceError()

  const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({ 
    units: 1000000
  });

  const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({ 
    microLamports: 10000000
  });

  const tx = new Transaction()
    .add(modifyComputeUnits)
    .add(addPriorityFee)
    .add(
      createCreditPurchaseInstruction(adapter.publicKey, senderTokenAccount)
    )

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized')
  tx.recentBlockhash = blockhash
  tx.lastValidBlockHeight = lastValidBlockHeight
  tx.feePayer = adapter.publicKey

  // Sign the TX
  const signedTx = await (adapter as BaseSignerWalletAdapter).signTransaction(tx)

  const sendOptions: SendOptions = {
    maxRetries: 2,
    minContextSlot: (await connection.getSlot()),
    skipPreflight: false,
    preflightCommitment: 'finalized'
  }

  // Submit the TX
  const [err, txId] = await resolver(connection.sendRawTransaction(signedTx.serialize(), sendOptions))
  if (err) throw err

  const confirmationStrategy: BlockheightBasedTransactionConfirmationStrategy = {
      signature: txId!,
      blockhash,
      lastValidBlockHeight
  }

  const [terr, confirmation] = await resolver(connection.confirmTransaction(confirmationStrategy, 'confirmed'))

  if (terr || !confirmation || confirmation?.value.err) {
    throw new TxConfirmationError(terr?.message || confirmation?.value.err?.toString() || 'Tx confirmation failed.')
  }

  return txId!
}

async function processCreditPurchase(tx: String, generate = false): Promise<Account> {
  const isoFetch = isBrowser ? fetch : () => Promise.reject('Node is not yet supported.') // support node
  
  const [err, resp] = await resolver(isoFetch(PURCHASE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
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

export interface VybeApi {
  auth(signer: Adapter): Promise<Account>
  purchaseCredits(adapter: Adapter): Promise<Account>
}

export function init(connection: Connection): VybeApi {
  return {
    auth,
    purchaseCredits: purchaseCreditsFactory(connection)
  }
}

export default {
  init
}
