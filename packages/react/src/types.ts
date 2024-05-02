import { ReactNode } from 'react'
import { Adapter } from '@solana/wallet-adapter-base'
import { Connection } from '@solana/web3.js'
import { Account } from '@vybenetwork/core'

export interface WidgetProps {
  children?: ReactNode
  props?: { [key: string]: any }
}

export type AvailableWidgets = Record<string, React.LazyExoticComponent<(props: WidgetProps) => JSX.Element>>

export interface VybeContextAttrs {
  account: Account | null
  signIn: (adapter: Adapter) => Promise<void>
  signOut: () => void
  connection: Connection | null
  executePurchaseCredits: (adapter: Adapter, priorityFee?: number) => Promise<void>
  availableWidgets: AvailableWidgets
}

export enum VybeWidget {
  ReverseNFTSearch = 'reverse-nft-search',
}

export interface BaseConfig {
  widgets: (typeof VybeWidget)[keyof typeof VybeWidget][]
}
