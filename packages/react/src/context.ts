import { createContext } from 'react'

import { VybeContextAttrs } from './types'
import { Adapter } from '@solana/wallet-adapter-base'

const VybeContext = createContext<VybeContextAttrs>({
  account: null,
  signIn: (_: Adapter) => Promise.reject('Not implemented'),
  signOut: () => {},
  connection: null,
  executePurchaseCredits: (_: Adapter) => Promise.reject('Not implemented'),
})

export default VybeContext
