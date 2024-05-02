import { PublicKey } from '@solana/web3.js'
import { clearAuthData, loadAuthData, storeAuthData } from './store'
import { isBrowser, resolver } from './utils'
import { AUTH_ENDPOINT, AUTH_MSG } from './constants'
import { AuthFailedError } from './errors'
import bs58 from 'bs58'
import { Adapter, BaseMessageSignerWalletAdapter } from '@solana/wallet-adapter-base'

import type { Account } from './types'

interface AuthRequest {
  pk: string
  sig: string
  msg: string
  generate?: boolean
}

async function sendAuthData(body: AuthRequest): Promise<Account> {
  const isoFetch = isBrowser ? fetch : () => Promise.reject('Node is not yet supported.') // support node

  const [err, data] = await resolver(
    isoFetch(AUTH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  )

  if (err) throw err

  return data?.json()
}

export async function signIn(adapter: Adapter, persist = false): Promise<Account> {
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

  if (persist) {
    await storeAuthData({
      pk: requestBody.pk,
      sig: requestBody.sig,
      key: authData?.key ?? resp.key!,
    })
  }

  // return resp
  return {
    ...resp,
    key: authData?.key ?? resp.key!,
  }
}

export function signOut() {
  clearAuthData()
}
