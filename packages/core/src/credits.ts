import {
  BlockheightBasedTransactionConfirmationStrategy,
  ComputeBudgetProgram,
  Connection,
  SendOptions,
  Transaction,
} from '@solana/web3.js'
import { isBrowser, resolver } from './utils'
import { CREDITS_PRICE_USDC, PURCHASE_ENDPOINT, USDC_MINT } from './constants'
import { CreditPurchaseError, InsufficientBalanceError, TxConfirmationError } from './errors'
import {
  Adapter,
  BaseSignerWalletAdapter,
  WalletNotConnectedError,
  WalletSendTransactionError,
} from '@solana/wallet-adapter-base'
import { checkTokenBalance, createCreditPurchaseInstruction, getSPLTokenAccount } from './spl'
import { Account } from './types'

async function submitTx(adapter: Adapter, connection: Connection, priorityFee = 10000000): Promise<string> {
  if (!adapter.publicKey) throw new WalletNotConnectedError()

  const senderTokenAccount = getSPLTokenAccount(adapter.publicKey, USDC_MINT)

  const hasSufficientBalance = await checkTokenBalance(senderTokenAccount, CREDITS_PRICE_USDC, connection)
  if (!hasSufficientBalance) throw new InsufficientBalanceError()

  const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: priorityFee,
  })

  const tx = new Transaction()
    .add(addPriorityFee)
    .add(createCreditPurchaseInstruction(adapter.publicKey, senderTokenAccount))

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized')
  tx.recentBlockhash = blockhash
  tx.lastValidBlockHeight = lastValidBlockHeight
  tx.feePayer = adapter.publicKey

  // Sign the TX
  const signedTx = await (adapter as BaseSignerWalletAdapter).signTransaction(tx)

  const sendOptions: SendOptions = {
    maxRetries: 2,
    minContextSlot: await connection.getSlot(),
    skipPreflight: false,
    preflightCommitment: 'finalized',
  }

  // Submit the TX
  const [err, txId] = await resolver(connection.sendRawTransaction(signedTx.serialize(), sendOptions))
  if (err) throw err

  const confirmationStrategy: BlockheightBasedTransactionConfirmationStrategy = {
    signature: txId!,
    blockhash,
    lastValidBlockHeight,
  }

  const [terr, confirmation] = await resolver(connection.confirmTransaction(confirmationStrategy, 'confirmed'))

  if (terr || !confirmation || confirmation?.value.err) {
    throw new TxConfirmationError(terr?.message || confirmation?.value.err?.toString() || 'Tx confirmation failed.')
  }

  return txId!
}

async function processCreditPurchase(tx: String, generate = false): Promise<Account> {
  const isoFetch = isBrowser ? fetch : () => Promise.reject('Node is not yet supported.') // support node

  const [err, resp] = await resolver(
    isoFetch(PURCHASE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tx, generate }),
    })
  )

  if (err || !resp) throw new CreditPurchaseError()

  const account: Account = await resp.json()
  return account
}

export async function purchaseCredits(
  adapter: Adapter,
  connection: Connection,
  account: Account,
  priorityFee?: number
): Promise<Account> {
  const [err, tx] = await resolver(submitTx(adapter, connection, priorityFee))
  if (err || !tx) throw err || new WalletSendTransactionError()

  const [aerr, newAccount] = await resolver(processCreditPurchase(tx, !account.key))
  if (aerr || !newAccount) throw new CreditPurchaseError()

  return newAccount
}
