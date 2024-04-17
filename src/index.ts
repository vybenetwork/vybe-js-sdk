import { PublicKey } from "@solana/web3.js";
import { loadAuthData, storeAuthData } from "./store";
import { isBrowser, resolver } from "./utils";
import { AUTH_ENDPOINT, AUTH_MSG, AuthFailedError } from "./constants";
import bs58 from 'bs58'
import { BaseMessageSignerWalletAdapter, BaseSignerWalletAdapter } from "@solana/wallet-adapter-base";

type Adapter = BaseMessageSignerWalletAdapter | BaseSignerWalletAdapter

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

async function auth(adapter: Adapter): Promise<Account | AuthFailedError> {
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
    const output = await (adapter as BaseMessageSignerWalletAdapter).signMessage(input)
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

interface VybeApi {
  auth(signer: Adapter): Promise<Account | AuthFailedError>  
}

export async function init(): Promise<VybeApi> {
  return {
    auth
  }
}
