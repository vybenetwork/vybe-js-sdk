import { ReactNode } from 'react'
import { Account } from '@vybenetwork/core'

export interface WidgetProps {
  children?: ReactNode
  props?: { [key: string]: any }
}

export type AvailableWidgets = Record<string, React.LazyExoticComponent<(props: WidgetProps) => JSX.Element>>

export interface VybeContextAttrs {
  account: Account | null
  availableWidgets: AvailableWidgets
}

export enum VybeWidget {
  ReverseNFTSearch = 'reverse-nft-search',
}

export interface BaseConfig {
  widgets: (typeof VybeWidget)[keyof typeof VybeWidget][]
}
