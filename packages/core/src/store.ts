import { isBrowser } from './utils'
import { STORAGE_KEY } from './constants'

interface AuthData {
  pk: string
  sig: string
  key: string
}

export async function loadAuthData(): Promise<AuthData | null> {
  if (isBrowser) {
    const serializedData = window.localStorage.getItem(STORAGE_KEY)
    if (!serializedData) return null

    const binstr = window.atob(serializedData)
    const len = binstr.length
    const bytes = new Uint8Array(len)

    for (let i = 0; i < len; i++) {
      bytes[i] = binstr.charCodeAt(i)
    }

    const jsonstr = new TextDecoder().decode(bytes)

    try {
      return JSON.parse(jsonstr)
    } catch (_) {
      window.localStorage.removeItem(STORAGE_KEY)
      return null
    }
  }

  // TODO: support node

  return null
}

export async function storeAuthData(authData: AuthData) {
  if (isBrowser) {
    const jsonstr = JSON.stringify(authData)
    const byteArray = new TextEncoder().encode(jsonstr)

    const binstr = byteArray.reduce((acc, byte) => acc + String.fromCharCode(byte), '')
    const data = window.btoa(binstr)

    window.localStorage.setItem(STORAGE_KEY, data)
  }
}
