import { Adapter } from '@solana/wallet-adapter-base'
import { Connection } from '@solana/web3.js'
import { Account } from '@vybenetwork/core'

export interface VybeContextAttrs {
  account: Account | null
  signIn: (adapter: Adapter) => Promise<void>
  signOut: () => void
  connection: Connection | null
  executePurchaseCredits: (adapter: Adapter, priorityFee?: number) => Promise<void>
}

export enum VybeWidget {
  ReverseNFTSearch = 'reverse-nft-search',
}

export interface BaseConfig {
  widgets: (typeof VybeWidget)[keyof typeof VybeWidget][]
}
